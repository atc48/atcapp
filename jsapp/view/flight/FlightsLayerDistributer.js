(function (pkg, fac){
  pkg.FlightsLayerDistributor = fac(_, __, atcapp);
})(atcapp, function(_, __, app) {

  var DEBUG = false;
  var NO_BACK_LAYER = true;

  function FlightsLayerDistributor(mainLayer, backLayer) {
    this.flightViewPool = new app.FlightViewPool(mainLayer, backLayer);
  }

  FlightsLayerDistributor.prototype.distribute = function (
    flightDataList, gridToFlightIds, mapStatus, scale){
    __.assert(_.isArray(flightDataList) && _.isObject(gridToFlightIds) &&
	      _.isObject(mapStatus) && _.isNumber(scale));
    var self = this;

    var mapGrids = mapStatus.getGridMap().getGrids();
    var allGrids    = _.map(_.keys(gridToFlightIds), function (n) { return parseInt(n); });
    var activeGrids = _.intersection(mapGrids, allGrids);
    var backGrids   = _.difference(allGrids, activeGrids);
    __.assert(allGrids.length == activeGrids.length + backGrids.length);

    var finder = new _Finder(flightDataList, gridToFlightIds);
    var pool = this.flightViewPool;
    finder.forEachGridToFlightData(activeGrids, function (data) {
      var cs = data.callsign();
      var flight = pool.moveToMainLayer( cs );
      flight.updateData( data );
      flight.updateScale( scale );
    });
    
    finder.forEachGridToFlightData(backGrids, function (data) {
      var cs = data.callsign()
      var flight = pool.moveToBackLayer( cs );
      if (!NO_BACK_LAYER) {
	flight.updateData( data );
	flight.updateScale( scale );
      }
    });
  };

  FlightsLayerDistributor.prototype.onGridChanged = function (
    flightDataList, gridToFlightIds, scale, diffGettable) {
    var finder = new _Finder(flightDataList, gridToFlightIds);
    var pool = this.flightViewPool;
    var diff = diffGettable.getDiff();

    finder.forEachGridToFlightData(diff.add, function (data) {
      var flight = pool.moveToMainLayer( data.callsign() );
      flight.updateData( data );
      flight.updateScale( scale );
    });
    finder.forEachGridToFlightData(diff.red, function (data) {
      pool.moveToBackLayer( data.callsign() );
    });
  };

  function _Finder(flightDataList, gridToFlightIds) {

    this.forEachGridToFlightData = function (grids, fn) {
      __.assert(_.isArray(grids));
      _.each(grids, function (grid) {
	var ids = gridToFlightIds[ grid ];
	_.each(ids, function (i) {
	  var flightData = flightDataList[ i ];
	  __.assert(flightData);
	  fn(flightData);
	});
      });
    };
  };

  return FlightsLayerDistributor;

});
