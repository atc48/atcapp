(function (pkg, fac) {
  pkg.DataBlockPositioner = fac(_, __, atcapp);
})(atcapp, function (_, __, app) {

  var DATA_BLOCK_FORCE_COEF = 1.5 * 10000;
  var NUM_FRAMES_LOOP  = 10 * 3;
  var FORCE_X_MULT = 3;
  

  function DataBlockPositioner(){
  }

  var p = DataBlockPositioner.prototype;

  p.init = function (flights) {
    var flts = _.map(flights, function (flight) {
      flight.setState("normal");      
      return new _FlightWrapper(flight);
    });

    var calculator = new _ForceCalculator(flts);
    this.calculator = calculator;

    this._isFinished = false;
  };

  p.process = function () {
    this.calculator.process();
    if (this.calculator.isFinish()) {
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
  };
  
  _FlightWrapper.prototype.addForceWith = function (flt) {
    if (flt.flight.state == "low" || this.flight.state == "low") {
      return;
    }
    var xDiff = (flt._pos.x - this._pos.x);
    var yDiff = (flt._pos.y - this._pos.y) * 0.5;
    var r2 = Math.pow(xDiff, 2) + Math.pow(yDiff, 2);
    var r1 = Math.sqrt(r2);
    var force = DATA_BLOCK_FORCE_COEF / r2;
    var forceX = (- force * xDiff / r1) * FORCE_X_MULT;
    var forceY = (- force * yDiff / r1);
    forceX = Math.floor(forceX);
    forceY = Math.floor(forceY);
    this._force.x += forceX;
    this._force.y += forceY;
  };

  _FlightWrapper.prototype.onOneIngridFinish = function () {
    this._force.ingridCount += 1;
  };
  
  _FlightWrapper.prototype.fixPos = function () {
    if (this._force.ingridCount >= 0) {
      this._force.x /= this._force.ingridCount;
      this._force.y /= this._force.ingridCount;
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


  function _ForceCalculator(flts) {
    __.assert(_.isArray(flts));
    this.flts = flts;
    this.loopCount = 0;
  }
  
  _ForceCalculator.prototype.process = function () {
    this._calcIngridForce(this.flts);
    _.each(this.flts, function (flt) {
      flt.fixPos();
    });
    this.loopCount++;
  };

  _ForceCalculator.prototype.isFinish = function () {
    return this.loopCount > NUM_FRAMES_LOOP;
  };
  
  _ForceCalculator.prototype._calcIngridForce = function (flts) {
    _.each(flts, function (flt) {
      _.each(flts, function (fltEnemy) {
	if (flt == fltEnemy) { return; }
	flt.addForceWith(fltEnemy);
      });
      flt.onOneIngridFinish();
    });
  };


  return DataBlockPositioner;
});
