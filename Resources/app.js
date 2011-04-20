var isAndroid = false;
if (Ti.Platform.name == 'android') {
  isAndroid = true;
}

//var ServiceDomain = "http://www.hadok.com";
var ServiceDomain = "http://www.khadok.com";

Ti.include('service.js');
Ti.include('restaurant_service.js');
Ti.include('map_service.js');
Ti.include('picture_service.js');
Ti.include('default_config.js');

// Prepare tab groups
var tabGroup = Titanium.UI.createTabGroup();
var activityIndicator = Ti.UI.createActivityIndicator({
  top: 0,
  bottom:10,
  height:50,
  width:10,
  style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
});

// Include windows
Ti.include('window_search.js');
Ti.include('window_nearby_on_map.js');
Ti.include('window_restaurant_details.js');
Ti.include('window_new_restaurant.js');

//  Add tabs
tabGroup.addTab(searchTab);
tabGroup.addTab(nearbyTab);
tabGroup.addTab(newRestaurantTab);

// open tab group
tabGroup.open();

// Load initial restaurants list
SearchService.init();