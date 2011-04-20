//
// Create Window For Search
//
var searchWindow = Titanium.UI.createWindow({
  title: 'www.khadok.com',
  backgroundColor:'#fff'
});

var searchTab = Titanium.UI.createTab({
  icon:'icon_search.png',
  title:'Search',
  window: searchWindow
});

// Construct UI controls
var searchBar = Titanium.UI.createSearchBar({
  hintText: 'What do you wanna eat?',
  showCancel: false,
  top: 0,
  left: 0,
  height: 40
});
searchBar.value = 'coffee';

var tableHeader = Ti.UI.createLabel({
  text: ' Coffee cafes, search more...',
  top: 0,
  left: 0,
  height: 40,
  //backgroundColor: '#FFFFCC',
  backgroundImage: 'searchbar_bg.png',
  color: '#fff'
});

var searchResultView = Titanium.UI.createTableView({
  backgroundColor:"white",
  data: [],
  separatorColor: "white",
  top: 40, width:320,
  headerView: tableHeader
});

// Create Table View
searchWindow.add(searchBar);
searchWindow.add(searchResultView);

// Handle search events
searchBar.addEventListener('return', function(e) {
  var options = {};
  options.keywords = e.source.value;
  SearchService.search(options, searchResultView);
  searchBar.blur();
});
