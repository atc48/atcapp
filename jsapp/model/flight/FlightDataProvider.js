(function (pkg, fac) {
  pkg.FlightDataProvider = fac(createjs, _, __, pkg);
})(atcapp, function (createjs, _, __, app) {

  createjs.extend(FlightDataProvider, app.Dispatcher);
  createjs.promote(FlightDataProvider, "Dispatcher");

  var FlightData;
  
  function FlightDataProvider() {
    this.Dispatcher_constructor();
    FlightData = app.FlightData;
    this.flightDataList = [];
    this.gridToIdsMap = {};
  }

  FlightDataProvider.prototype.update = function (raw) {
    // TODO: donot get all raw but only raw.flights as arg
    // TODO: donot Flight.updateKeys here.
    // TODO: make updater or manager class above this class.
    __.assert(_.isObject(raw) && _.isArray(raw.keys) && _.isArray(raw.flights));

    FlightData.updateKeys(raw.keys);
    this.flightDataList = _.map(raw.flights, function (flightRaw) {
      return new FlightData(flightRaw);
    });
    this.gridToIdsMap = raw.grid_map; // grid to flight-index-in-flights map
    
    if (this.flightDataList.length <= 0) {
      return this;
    }
    
    this.fire({flightDataList: this.flightDataList,
	       gridToIdsMap: this.gridToIdsMap});
    return this;
  };

  return FlightDataProvider;
});
