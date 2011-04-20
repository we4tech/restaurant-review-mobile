var SearchService = {

  remoteAgent: function(url, callback) {
    Ti.API.info('Requesting remote agent - ' + url);

    var client = Ti.Network.createHTTPClient();
    client.onload = function(e) {
      Ti.API.debug('Successfully loaded content');
      Ti.API.debug(e);
      callback(e);
    };

    client.onerror = function(e) {
      Ti.API.error('Failed to request on remote server');
      Ti.API.error(e);
    };

    client.open('GET', url);
    client.setRequestHeader('User-Agent', 'search-request-client');
    client.send();
  },

  reviewStatus: function(data) {
    return (data.reviews_loved ? data.reviews_loved : 0) +
                 ' people out of ' + (data.reviews_count ? data.reviews_count : 0) +
                 ' loved this place';
  },

  buildRow: function(data) {
    var labelName = Ti.UI.createLabel({
      text: data.name.substring(0, 30),
      top: -40,
      left: 45,
      font: {fontSize: 15}
    });

    var labelStatus = Ti.UI.createLabel({
      text: SearchService.reviewStatus(data),
      top: labelName.top + 25,
      left: labelName.left,
      font: {
        fontSize: 10,
        fontWeight: 'bold'
      }
    });

    var labelDesc = Ti.UI.createLabel({
      text: data.address,
      top: labelStatus.top + 30,
      left: labelName.left,
      font: {fontSize: 10},
      color: '#888'
    });

    var verySmallImages = data.image_very_small;
    if (verySmallImages) {
      Ti.API.debug(verySmallImages[0]);

      var image = Titanium.UI.createImageView({
        image: verySmallImages[0],
        left: 5, top: 0,
        width: 30, height: 30
      });
    }

    var row = Ti.UI.createTableViewRow({
      height: 55
    });

    if (verySmallImages) {
      row.add(image);
    }
    row.add(labelName);
    row.add(labelStatus);
    row.add(labelDesc);
    row.restaurant = data;

    row.addEventListener('click', function(e) {
      var restaurant = e.row.restaurant;
      RestaurantService.openDetails(restaurant);
    });

    return row;
  },

  mActivityIndicator: null,

  setLoadingActivity: function() {
    mActivityIndicator = Ti.UI.createActivityIndicator({
      style: Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN,
      height: 50,
      width: 10,
      message: 'Loading...'
    });
  },

  loading: function(message) {
    searchWindow.setTitleControl(activityIndicator);
    nearbyWindow.setTitleControl(activityIndicator);
    activityIndicator.message = message;
    activityIndicator.show();
  },

  loaded: function() {
    searchWindow.setTitleControl(null);
    nearbyWindow.setTitleControl(null);
  },

  buildUrl: function(options) {
    Ti.API.debug(options);
    var url = ServiceDomain + "/search?" +
              "excepts[]=marker_html&excepts[]=description&" +
              "image_versions[]=very_small&image_versions[]=large&" +
              "format=json&_models=Restaurant&" +
              "name|short_array|long_array|description[]=";

    if (options.lat && options.lng) {
      Ti.API.info('Performing location specific search');
      url += options.keywords + '&lat=' + options.lat + '&lng=' + options.lng;
      if (options.meter) {
        url += '&meter=' + options.meter;
      } else {
        url += '&meter=1000';
      }
    } else if (options.keywords) {
      Ti.API.info('Performing keywords search');
      url += options.keywords;
    }

    return url;
  },

  populateData: function(items, resultView) {
    Ti.API.debug('Total number of items - ' + items.length);

    var rows = [];
    for (var i = 0; i < items.length; i++) {
      rows.push(SearchService.buildRow(items[i]));
    }

    if (rows.length > 0) {
      searchBar.blur();
      resultView.setData([]);
      resultView.setData(rows);
    }
  },

  randomNumber: function(n) {
    return ( Math.floor ( Math.random ( ) * n + 1 ) );
  },

  renderInTable: function(options, items, resultView) {
    if (options.lat && options.lng) {
      resultView.headerView.text = ' Restaurants with in ' +
                                   (options.meter ? options.meter : 1000) +
                                   ' meter.';
    } else {
      resultView.headerView.text = ' Search results for "' +
                                   options.keywords + '"';
    }
    SearchService.populateData(items, resultView);
  },

  loadSearchResults: function(url, options, resultView, mapView) {
    SearchService.loading("Loading...");
    SearchService.remoteAgent(url, function(e) {
      Ti.API.info('Response Received');

      var items = eval(e.source.responseText);
      if (items && items.length > 0) {
        SearchService.renderInTable(options, items, resultView);
      } else {
        if (!mapView) {
          alert('Nothing found for "' + options.keywords + '"');
        }
      }
      SearchService.loaded();
    });
  },

  mMapAnnoWorker: null,

  loadResultsInMap: function(url, options, resultView, mapView) {
    if (SearchService.mMapAnnoWorker) {
      clearTimeout(SearchService.mMapAnnoWorker);
    }

    SearchService.mMapAnnoWorker = setTimeout(function() {
      SearchService.loading("Loading...");
      SearchService.remoteAgent(url, function(remoteEvent) {
        Ti.API.info('Response Received');
        var items = eval(remoteEvent.source.responseText);
        if (items && items.length > 0) {
          MapService.renderInMap(options, items, resultView);
        }
        SearchService.loaded();
      });
    }, 2000);
  },

  search: function(options, resultView, mapView) {
    Ti.API.info('Performing remote serach');
    var url = SearchService.buildUrl(options);

    if (!mapView) {
      SearchService.loadSearchResults(url, options, resultView, mapView);
    } else {
      SearchService.loadResultsInMap(url, options, resultView, mapView);
    }
  },

  authorizeLocationService: function() {
    if (Ti.Platform.name != 'android') {
      var authorization = Ti.Geolocation.locationServicesAuthorization;
      Ti.API.log('Authorization: ' + authorization);
      if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
        Ti.UI.createAlertDialog({
          title:'Restaurant Search',
          message:'You have disallowed Titanium from running geolocation services.'
        }).show();
      }
      else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
        Ti.UI.createAlertDialog({
          title:'Restaurant Search',
          message:'Your system has disallowed Titanium from running geolocation services.'
        }).show();
      }
    }
  },

  findLocation: function(callback) {
    Ti.Geolocation.purpose = "Nearby Restaurant Search";
    if (Titanium.Geolocation.locationServicesEnabled) {
      SearchService.authorizeLocationService();

      Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
      Ti.Geolocation.distanceFilter = 10;

      // Setup default lng & lat
      var lng = 90.4191996;
      var lat = 23.7906284;
      
      Ti.Geolocation.getCurrentPosition(function(e) {
        if (!e.success || e.error) {
          alert('error ' + JSON.stringify(e.error));
        } else {
          lng = e.coords.longitude;
          lat = e.coords.latitude;
        }

        callback(lng, lat);
      });
    } else {
      alert('Your device location service is turned off, please turn it on.');
    }
  },

  init: function() {
    var options = {};
    options.keywords = searchBar.value;
    SearchService.search(options, searchResultView);
  },

  tagsString: function(restaurant) {
    var locationTags = restaurant.short_array;
    var tagsString = "";

    if (locationTags && locationTags.length > 0) {
      for (var i1 = 0; i1 < locationTags.length; i1++) {
        tagsString += locationTags[i1] + (i1 != locationTags.length ? ', ' : '');
      }
    }

    var tags = restaurant.long_array;
    if (tags && tags.length > 0) {
      for (var i2 = 0; i2 < tags.length; i2++) {
        tagsString += tags[i2] + (i2 != tags.length ? ', ' : '');
      }
    }

    return tagsString;
  }

};