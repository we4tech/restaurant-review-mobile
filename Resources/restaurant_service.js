var RestaurantService = {

  mDetailsWindow: null,

  closeDetails: function() {
    if (RestaurantService.RestaurantService) {
      RestaurantService.mDetailsWindow.close();
    }
  },

  showDetails: function() {
    if (RestaurantService.RestaurantService) {
      RestaurantService.mDetailsWindow.open({modal: true});
    }
  },

  openDetails: function(restaurantExcerpt) {
    var backButton = Ti.UI.createButton({
      title: 'Back'
    });

    RestaurantService.mDetailsWindow = Ti.UI.createWindow({
      title: 'Details',
      leftNavButton: backButton
    });

    var detailsView = Ti.UI.createView({
      backgroundColor: '#fff'
    });

    // Info view
    var activityIndicator = Ti.UI.createActivityIndicator({
      style: Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN,
      height: 50,
      width: 10,
      message: 'Loading...'
    });

    detailsView.add(activityIndicator);
    activityIndicator.show();

    SearchService.remoteAgent(restaurantExcerpt.url, function(response) {
      activityIndicator.hide();
      detailsView.remove(activityIndicator);

      Ti.API.debug('Loading restaurant details...');

      try {

        var restaurant = null;

        try {
          restaurant = JSON.parse(response.source.responseText);
          restaurant = restaurant.restaurant;
          Ti.API.debug(restaurant);
        } catch (e) {
          Ti.API.error(e);
        }

        // Add toolbar
        RestaurantService.addDetailsViewToolbar(RestaurantService.mDetailsWindow, restaurant);
        RestaurantService.addWebView(detailsView, restaurantExcerpt.url);
      } catch (ex) {
        alert(ex);
      }
    });

    backButton.addEventListener('click', function(e) {
      RestaurantService.mDetailsWindow.close();
    });

    RestaurantService.mDetailsWindow.add(detailsView);
    RestaurantService.mDetailsWindow.open({modal: true});
  },

  addDetailsViewToolbar: function(detailsWindow, restaurant) {
    var buttonBar = Ti.UI.createButtonBar({
      labels: [
        {image: 'icon_camera.png', title: 'Add picture', index: 0},
        {image: 'icon_picture.png', title: 'Gallery', index: 1},
        {image: 'icon_map.png', title: 'Full map', index: 2},
        {image: 'icon_review.png', title: 'Review', index: 3}
      ],
      style: Titanium.UI.iPhone.SystemButtonStyle.BAR});

    var toolbar = Ti.UI.createToolbar({
      items: [buttonBar],
      top: '90%',
      height: 50,
      width: '100%'
    });

    detailsWindow.add(toolbar);

    buttonBar.addEventListener('click', function(e) {
      switch (e.index) {
        // Upload picture
        case 0:
          if (restaurant) {
            PictureService.takePicture(detailsWindow, restaurant);
          } else {
            alert('WebService failed to retrieve data.');
          }
          break;

        // Picture gallery
        case 1:

          break;

        // Map
        case 2:
          if (restaurant) {
            MapService.openMap(restaurant);
          }
          break;

        // Review
        case 3:
          break;
      }
    });
  },

  addWebView: function(detailsView, url) {
    url = url.replace(/json/i, 'mobile') + '&embed_view=true';

    var webView = Ti.UI.createWebView({
      height: '100%', width: '100%', url: url});
    detailsView.add(webView);
  }
};