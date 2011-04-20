var MapService = {

  mBuiltAnnotationCaches : {},

  buildAnnotation: function(item) {
    var verySmallImages = item.image_very_small;
    var image = null;

    if (verySmallImages && verySmallImages.length > 0) {
      image = verySmallImages[0];
    }

    return Ti.Map.createAnnotation({
      latitude: item.lat,
      longitude: item.lng,
      title: item.name,
      subtitle: SearchService.reviewStatus(item),
      pincolor: isAndroid ? "orange" : Ti.Map.ANNOTATION_RED,
      animate: true,
      leftButton: image,
      rightButton: Ti.UI.iPhone.SystemButton.DISCLOSURE,
      restaurantId: item.id,
      url: item.url,
      excerpt: item
    });
  },

  mActiveAnnotations : {},

  renderInMap: function(options, items, mapView) {
    var annotations = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!MapService.mActiveAnnotations[item.name]) {
        var annotation = MapService.buildAnnotation(item);
        annotations.push(annotation);
        MapService.mActiveAnnotations[item.name] = annotation;
      }
    }

    mapView.addAnnotations(annotations);
  },

  createMap: function(annotations, options) {
    var height = '100%';
    var mapType = Ti.Map.STANDARD_TYPE;
    var region = null;

    if (options) {
      if (options.height) {
        height = options.height;
      }

      if (options.mapType) {
        mapType = options.mapType;
      }

      if (options.region) {
        region = options.region;
      }
    }

    return Ti.Map.createView({
      mapType: mapType,
      region: region,
      animate: true,
      regionFit: true,
      userLocation: true,
      height: height,
      annotations: annotations
    });
  },

  openMap: function(item) {
    var backButton = Ti.UI.createButton({
      title: 'Back'
    });

    var toolbar = Ti.UI.createToolbar({
      items: [backButton],
      bottom:0,
      borderTop:true,
      borderBottom:false,
      translucent:true,
      barColor:'#999'
    });

    var window = Ti.UI.createWindow({
      title: 'Map'
    });

    window.orientationModes = [
      Titanium.UI.PORTRAIT,
      Titanium.UI.LANDSCAPE_LEFT,
      Titanium.UI.LANDSCAPE_RIGHT
    ];

    var annotation = MapService.buildAnnotation(item);
    var mapView = MapService.createMap([annotation], {
      region: {latitude: item.lat, longitude: item.lng, latitudeDelta:0.01, longitudeDelta:0.01}
    });

    mapView.selectAnnotation(annotation);


    // Add to container
    window.add(mapView);
    window.add(toolbar);

    // Event listeners
    backButton.addEventListener('click', function(e) {
      window.close();
    });

    // Display window
    window.open();
  }
};