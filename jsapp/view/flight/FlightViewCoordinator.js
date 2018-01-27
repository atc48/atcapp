(function (pkg, fac){
  pkg.FlightViewCoordinator = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  var TOO_MANY_LEN = 80;
  
  function FlightViewCoordinator() {
  };

  var p = FlightViewCoordinator.prototype;

  p.setup = function (mapStatus, stageSize) {
    this.mapStatus = mapStatus;
    this.stageSize = stageSize;

    this.blockTicker = new app.TickHandler(this._onTick, this);
    this.blockCdntor = new app.DataBlockCoordinator();
  };

  p.coordinate = function (activeFlights) {
    var stageSize = this.stageSize;
    this.calculator = null;
    var flights = activeFlights;

    flights = _.filter(flights, function (f) {
      f.setState("low");
      var gPos = f.localToGlobal(0, 0);
      return f.isDataBlockAvailable() &&
	gPos.x > 0 && gPos.y > 0 &&
	gPos.x < stageSize.curWidth && gPos.y < stageSize.curHeight;
    });

    if (flights.length > TOO_MANY_LEN) {
      _.each(flights, function (flight) {
	flight.setState( "low" );
      });
      return;
    }

    this.blockCdntor.init(flights);
    this.blockTicker.start();
  };

  p._onTick = function () {
    this.blockCdntor.process();
    if (this.blockCdntor.hasFinished()) {
      this.blockTicker.stop();
    }
  };


  return FlightViewCoordinator;
});
