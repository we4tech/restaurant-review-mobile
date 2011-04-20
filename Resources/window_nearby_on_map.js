//
// Create Window for nearby restaurants
//
var nearbyWindow = Ti.UI.createWindow({
    title: 'Nearby Restaurants',
    backgroundColor: '#fff'
});

nearbyWindow.orientationModes = [
  Titanium.UI.PORTRAIT,
  Titanium.UI.LANDSCAPE_LEFT,
  Titanium.UI.LANDSCAPE_RIGHT
];

var nearbyTab = Ti.UI.createTab({
    icon: 'icon_nearby.png',
    title: 'Nearby',
    window: nearbyWindow
});

var defaultRegionGulshan = {
  latitude: 23.7906284, longitude: 90.4191996,
  latitudeDelta: 0.01, longitudeDelta: 0.01
};

var nearbyMapView = MapService.createMap([], {region: defaultRegionGulshan});


// Add buttons

var lblWhereAmIEnabled = {image: 'icon_home.png', title: 'Where m i?', enabled: true};
var lblWhereAmIInProgress = {image: 'icon_home.png', title: 'Locating...', enabled: false};
var lblWhereAmIDisabled = {image: 'icon_home.png', title: 'Where m i?', enabled: false};
var lblCheckInDisabled = {image: 'icon_flag.png', title: 'Check in', enabled: false};
var lblCheckInEnabled = {image: 'icon_flag.png', title: 'Check in', enabled: true};

var mapButtonBar = Ti.UI.createButtonBar({
  labels: [lblWhereAmIEnabled, lblCheckInDisabled],
  top: '88%',
  height: 40,
  width: 'auto',
  index: 1,
  style: Ti.UI.iPhone.SystemButtonStyle.BAR
});

var nearbyToolBar = Ti.UI.createToolbar({
  items: [mapButtonBar],
  top: '88%',
  height: 50,
  translucent: true
});


// Add events
nearbyWindow.addEventListener('open', function(e) {
  // Retrieve current location
  SearchService.findLocation(function(lng, lat) {
    var options = {};
    options.keywords = '';
    options.lat = lat;
    options.lng = lng;
    SearchService.search(options, nearbyMapView, true);
  });
});

nearbyMapView.addEventListener('regionChanged', function(e) {
  var options = {};
  options.keywords = '';
  options.lat = e.latitude;
  options.lng = e.longitude;
  SearchService.search(options, nearbyMapView, true);
});

nearbyMapView.addEventListener('click', function(e) {
  if (e.clicksource == 'rightButton') {
    RestaurantService.openDetails(e.annotation.excerpt);
  }
});

mapButtonBar.addEventListener('click', function(e) {
  switch(e.index) {
    case 0:
        // Locate to the current position
        mapButtonBar.setLabels([
          lblWhereAmIInProgress, lblCheckInDisabled
        ]);
        SearchService.findLocation(function(lng, lat) {
          nearbyMapView.setRegion({
            latitude: lat, longitude: lng,
            latitudeDelta: 0.01, longitudeDelta: 0.01});
          mapButtonBar.setLabels([
            lblWhereAmIEnabled, lblCheckInDisabled
          ]);
        });
      break;
    case 1:
      alert('Add new restaurant');
      break;
  }
});

// Add to window
nearbyWindow.add(nearbyMapView);
nearbyWindow.add(nearbyToolBar);
