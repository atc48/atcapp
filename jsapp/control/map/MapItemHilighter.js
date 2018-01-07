(function (pkg, fac) {
  pkg.MapItemHilighter = fac(_, __);
})(atcapp, function (_, __) {

  function MapItemHilighter() {
  };

  var p = MapItemHilighter.prototype;

  p.init = function (mapItemCommand, fixMap, fixDistributor, mapRegionLocator) {
    mapItemCommand.on("activate", _.bind(this._onCommandActivated, this));

    this.fixMap = fixMap;
    this.fixDistributor = fixDistributor;
    this.mapRegionLocator = mapRegionLocator;
  }

  p._onCommandActivated = function (codes) {
    // collect item views
    var items = _.map(codes, _.bind(this._getMapItemByCode, this));
    items = _.compact(items);

    // get back the un hilighted items to ACTIVE
    var unHilightedItems = _.difference(this.lastItems, items);
    _.each(unHilightedItems, function (item) {
      item.getUserStatus().update("ACTIVE");
    });

    // get items HILIGHT
    _.each(items, function (item) {
      item.getUserStatus().update("HILIGHT");
    });

    // refresh view
    this.fixDistributor.refresh();

    // change the map scale and center
    this.mapRegionLocator.locate(items);

    this.lastItems = items;
  };

  p._getMapItemByCode = function (code) {
    return this.fixMap.getByCode( code ) || null;
  };
  
  return MapItemHilighter;
});
