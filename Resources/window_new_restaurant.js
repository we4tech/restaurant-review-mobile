var newRestaurantWindow = Ti.UI.createWindow({
    title: 'Add New Restaurant',
    backgroundColor: '#fff'
});

var newRestaurantTab = Ti.UI.createTab({
    icon: 'icon_add.png',
    title: 'Restaurant',
    window: newRestaurantWindow
});

var newFormHeader = Ti.UI.createLabel({
  text: 'Create new restaurant'
});

var newFormTableView = Ti.UI.createTableView({
  backgroundColor:"white",
  data: [],
  separatorColor: "#ccc",
  top: 40, width:320,
  headerView: newFormHeader
});

newRestaurantWindow.add(newFormTableView);
newRestaurantWindow.addEventListener('open', function(e) {
  // Add form fields

});