(function (pkg, fac){
  pkg.FlightsLayerDistributor = fac(_, __, atcapp);
})(atcapp, function(_, __, app) {

  var DEBUG = false;

  function FlightsLayerDistributor(mainLayer, backLayer) {
    this.mainLayer = mainLayer;
    this.backLayer = backLayer;
  }

  FlightsLayerDistributor.prototype.distribute = function (
    flightDataList, gridToFlightIds, mapStatus, scale){
    __.assert(_.isArray(flightDataList) && _.isObject(gridToFlightIds) &&
	      _.isObject(mapStatus) && _.isNumber(scale));
    // TODO: make FlightViewPool class
    this.mainLayer.removeAllChildren();
    this.backLayer.removeAllChildren();
    // TODO: use diff (make this.lastGrids var)
    var mapGrids = mapStatus.getGridMap().getGrids();
    var allGrids    = _.map(_.keys(gridToFlightIds), function (n) { return parseInt(n); });
    var activeGrids = _.intersection(mapGrids, allGrids);
    var backGrids   = _.difference(allGrids, activeGrids);
    __.assert(allGrids.length == activeGrids.length + backGrids.length);

    var flightsPair = _.map([
      [activeGrids, this.mainLayer,  true],
      [backGrids,   this.backLayer, false]
    ], function (arr) {
      var grids = arr[0], layer = arr[1], isActive = arr[2];
      var finder = new _Finder(flightDataList, gridToFlightIds);
      var flights = _.map(grids, function (grid) {
	return finder.getFlightsByGrid(grid, function (flight) {
	  flight.scaleX = flight.scaleY = scale;
	  if (DEBUG && !isActive) {
	    flight.highlight();
	  }
	  layer.addChild(flight);
	});
      })
      return _.flatten(flights);
    });
    var activeFlights = flightsPair[0];
    var backFlights   = flightsPair[1];
    __.assert(activeFlights.length + backFlights.length == flightDataList.length);
    if (DEBUG) {
      __.log("mapGrids=" + mapGrids + ", activeGrids=" + activeGrids);
      __.log("activeFlights.length=" + activeFlights.length + ", backFlights.length=" + backFlights.length);
    }
  };

  function _Finder(flightDataList, gridToFlightIds) {
    __.assert(_.isArray(flightDataList) && _.isObject(gridToFlightIds));

    this.getFlightsByGrid = function (grid, yieldFn) {
      var ids = gridToFlightIds[ grid ];
      __.assert(_.isArray(ids) && ids.length > 0);
      var flights = _.map(ids, function (i) {
	var flight = _getFlightByData( flightDataList[i] );
	yieldFn(flight);
	return flight;
      });
      return flights;
    }
    function _getFlightByData(flightData) {
      var flight = new app.Flight().updateData(flightData);
      return flight;
    }
  }

  return FlightsLayerDistributor;

});
