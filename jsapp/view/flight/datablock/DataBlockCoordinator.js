(function (pkg, fac) {
  pkg.DataBlockCoordinator = fac(_, __, atcapp);
})(atcapp, function (_, __, app) {

  var NUM_FRAMES_LOOP  = 10 * 3;

  var __physicsStrategy;

  function DataBlockCoordinator(){
    __physicsStrategy = new app.DataBlockPhysicsStrategy();
  }

  var p = DataBlockCoordinator.prototype;

  p.init = function (flights) {
    var flts = _.map(flights, function (flight) {
      flight.setState("normal");
      return new _FlightWrapper(flight);
    });

    this.processor = new _ForceCalcProcessor(flts);

    this._isFinished = false;
  };

  p.process = function () {
    this.processor.process();
    if (this.processor.isFinish()) {
      this._isFinished = true;
    }
  };

  p.hasFinished = function () {
    return this._isFinished;
  };

  function _FlightWrapper(flight) {
    this.flight = flight;
    this.reset();
    this.dataBlockHeightRatio = app.DataBlock.RIGID_SIZE.heightRatio;
    this.lastForceAbs = 0;
  };

  _FlightWrapper.prototype.reset = function () {
    this._force = {x:0, y:0, ingridCount: 0};
    this._pos = this.flight.getDataBlockStagePos();
    this._flightPt = this.flight.getGlobalPt();
  };
  
  _FlightWrapper.prototype.addForceWith = function (flt) {
    var addForce = __physicsStrategy.forceByOtherWithCenter(this._pos, flt._pos);
    this._force.x += addForce.x;
    this._force.y += addForce.y;
  };

  _FlightWrapper.prototype.onOneIngridFinish = function () {
    this._force.ingridCount += 1;
  };
  
  _FlightWrapper.prototype.fixPos = function () {
    if (this._force.ingridCount >= 0) {
      this._pos.x += this._force.x;
      this._pos.y += this._force.y;
      this.lastForceAbs = Math.sqrt(Math.pow(this._force.x, 2) + Math.pow(this._force.y, 2));
    }

    if (!this.flight.getIsDataBlockFix()) {
      this.flight.updateByForce( this._pos );
    }
    this.reset();
  };

  _FlightWrapper.prototype.isDiverging = function () {
    return this.lastForceAbs > 80;
  };


  function _ForceCalcProcessor(flts) {
    __.assert(_.isArray(flts));
    this.flts = flts;
    this.loopCount = 0;
  }
  
  _ForceCalcProcessor.prototype.process = function () {
    this._calcIngridForce(this.flts);
    _.each(this.flts, function (flt) {
      flt.fixPos();
    });
    this.loopCount++;
  };

  _ForceCalcProcessor.prototype.isFinish = function () {
    return this.loopCount > NUM_FRAMES_LOOP;
  };
  
  _ForceCalcProcessor.prototype._calcIngridForce = function (flts) {
    _.each(flts, function (flt) {
      if (flt.flight.state == "low") { return; }
      _.each(flts, function (fltEnemy) {
	if (flt == fltEnemy) { return; }
	if (fltEnemy.flight.state == "low") { return; }
	flt.addForceWith(fltEnemy);
      });
      flt.onOneIngridFinish();
    });
  };


  return DataBlockCoordinator;
});
