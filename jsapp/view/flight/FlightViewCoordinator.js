(function (pkg, fac){
  pkg.FlightViewCoordinator = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  var TOO_MANY_LEN = 80;
  var DATA_BLOCK_FORCE_COEF = 1.5 * 10000;
  var NUM_STAGE_DIVIDE = 1;
  var NUM_FRAMES_LOOP  = 10 * 3;
  var FORCE_X_MULT = 3;
  
  function FlightViewCoordinator(mapStatus, stageSize) {
    this.mapStatus = mapStatus;
    this.stageSize = stageSize;
    createjs.Ticker.addEventListener("tick", _.bind(this._onTick, this));
  }

  var p = FlightViewCoordinator.prototype;

  p.coordinate = function (activeFlights) {
    var stageSize = this.stageSize;
    this.calculator = null;
    var flights = activeFlights;

    flights = _.filter(flights, function (f) {
      f.setState("low");
      var gPos = f.localToGlobal(0, 0);
      return gPos.x > 0 && gPos.y > 0 &&
	gPos.x < stageSize.curWidth && gPos.y < stageSize.curHeight;
    });

    if (flights.length > TOO_MANY_LEN) {
      _.each(flights, function (flight) {
	flight.setState( "low" );
      });
      return;
    }
    _.each(flights, function (flight) {
      flight.setState("normal");
    });

    var self = this;
    var stageGrid = this.mapStatus.getStageGrid(NUM_STAGE_DIVIDE);
    var fltMap = new _FlightWrapperMap(stageGrid);

    fltMap.init(flights);

    var calculator = new _ForceCalculator(fltMap);
    this.calculator = calculator;
  };

  p._onTick = function () {
    if (!this.calculator) { return; }
    this.calculator.process();
    if (this.calculator.isFinish()) {
      this.calculator = null;
    }
  };

  
  function _ForceCalculator(fltMap) {
    this.fltMap = fltMap;
    this.loopCount = 0;
  }
  
  _ForceCalculator.prototype.process = function () {
    var self = this;
    this.fltMap.forEachGridKey(function (gridKey, flts) {
      self._calcIngridForce(flts);
    });
    this.fltMap.reset(function (flt) {
      flt.fixPos();
      if (self.loopCount > 10 && flt.isDiverging()) {
	flt.flight.setState("low");
	self.fltMap.remove(flt);
      }
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
  
  
  function _FlightWrapperMap(stageGrid) {
    var _map, _keys, _flts, _rems;
    var self = this;

    this.init = function (flights) {
      _map = {}; _keys = []; _flts = []; _rems = [];
      
      _.each(flights, function (flight) {
	var flt = new _FlightWrapper(flight, stageGrid);
	_flts.push(flt);
	var keys = flt.getGridKeys();
	self._append(keys, flt);
      });
    };

    this.reset = function (opt_eachFltFn) {
      _map = {}; _keys = [];
      _.each(_rems, function (flt) {
	if (_flts.indexOf(flt) >= 0) {
	  _flts.splice(_flts.indexOf(flt), 1);
	}
      });
      _rems = [];
      var fn = opt_eachFltFn || _.noop;
      _.each(_flts, function (flt) {
	fn(flt);
	var keys = flt.getGridKeys();
	self._append(keys, flt);
      });
    };

    this._append = function (gridKeys, flt) {
      _.each(gridKeys, function (key) {
	if (!_map[key]) { _map[key] = [flt]; }
	else { _map[key].push(flt); }
	_keys.push(key)
      });
    };

    this.remove = function (flt) {
      _rems.push( flt );
    };

    this.forEachGridKey = function (fn) {
      _keys = _.uniq(_keys);
      _.each(_keys, function (key) {
	var flts = _map[key];
	_.each(_rems, function (f) {
	  if (flts.indexOf(f) >= 0) {
	    flts.splice(flts.indexOf(f), 1);
	  }
	});
	fn(key, flts);
      });
    };

    this.forEachFlt = function (fn) {
      _.each(_flts, function (flt) {
	if (_rems.indexOf(flt) >= 0) { return; }
	fn(flt);
      });
    };
  }


  function _FlightWrapper(flight, stageGrid) {
    this.flight = flight;
    this.stageGrid = stageGrid;
    this.reset();
    this.dataBlockHeightRatio = app.DataBlock.RIGID_SIZE.heightRatio;
    this.lastForceAbs = 0;
  };

  _FlightWrapper.prototype.getGridKeys = function () {
    if (NUM_STAGE_DIVIDE == 1) {
      return ["1"];
    }
    var keys = this.stageGrid.getDoubledGridKeys(
      //this.flight.x, this.flight.y);
      this._pos.x, this._pos.y);
    return keys;
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

  return FlightViewCoordinator;
});
