//
// Create Window for nearby restaurants
//
var nearbyWindow = Titanium.UI.createWindow({
    title: 'Nearby Restaurants',
    backgroundColor: '#fff'
});
var nearbyTab = Titanium.UI.createTab({
    icon: 'icon_nearby.png',
    title: 'Nearby',
    window: nearbyWindow
});

var nearbyTableHeader = Ti.UI.createLabel({
  text: ' Restaurants near to YOU!',
  top: 0,
  left: 0,
  height: 30,
  //backgroundColor: '#FFFFCC',
  backgroundImage: 'searchbar_bg.png',
  color: '#fff'
});

var nearbyResultView = Titanium.UI.createTableView({
  backgroundColor:"white",
  data: [
    {
      title: 'Searching nearby restaurants...'
    }
  ],
  separatorColor: "white",
  top: 0, width:320,
  headerView: nearbyTableHeader
});

// Add events
nearbyWindow.addEventListener('open', function(e) {
  // Retrieve current location
  SearchService.findLocation(function(lng, lat) {
    var options = {};
    options.keywords = '';
    options.lat = lat;
    options.lng = lng;
    SearchService.search(options, nearbyResultView);    
  });
});

// Add to window
nearbyWindow.add(nearbyResultView);
