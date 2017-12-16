(function (pkg, fac) {
  pkg.GridMap = fac(_, __, atcapp);
})(atcapp, function (_, __, app) {

  var DEBUG = false;
  
  var DEFAULT_UNIT_SIZE = 10;
  var X_MAX = 360;
  var Y_MAX = 180;
  var COORD_SIZE = X_MAX * Y_MAX;

  /**
   * @arg leftTop  canpos
   * @arg rightBtm canpos
   */
  function GridMap(leftTop, rightBtm, opt_unitSize) {
    __.assert(_.isObject(leftTop) && _.isObject(rightBtm));
    leftTop.assertNumber(); rightBtm.assertNumber();
    this.leftTop  = leftTop.normalize();
    this.rightBtm = rightBtm.normalize();
    
    this.unitSize = opt_unitSize || DEFAULT_UNIT_SIZE;
    __.assert(_.isNumber(this.unitSize) && this.unitSize > 0);
    this.calc     = new _GridCalc(this.unitSize);
  }

  GridMap.prototype.equals = function (other) {
    return this.leftTop.equals(other.leftTop) &&
      this.rightBtm.equals(other.rightBtm);
  }

  GridMap.prototype.gridsEquals = function (other) {
    return _.isObject(other) &&
      _.isEqual(this.getGrids(), other.getGrids());
  }

  GridMap.prototype.getGrids = function (opt_yield) {
    return this._getGrids("_grids", this.calc, opt_yield);
  };


  GridMap.prototype._getGrids = function (key, calc, opt_fn) {
    __.assert(_.isString(key) && _.isObject(calc) && (!opt_fn || _.isFunction(opt_fn)));
    if (this[key]) {
      if (opt_fn) {
	_.each(this[key], opt_fn);
      }
      return this[key];
    }

    opt_fn = _.noop;

    var grids = [];
    calc.genGrids(this.leftTop, this.rightBtm, function (grid) {
      opt_fn(grid);
      grids.push(grid);
    });
    
    this[key] = grids;
    return grids;
  };

  GridMap.prototype.getAroundGridMap = function (opt_frameUnitSize) {
    var frameSize = parseInt(1 || opt_frameUnitSize);
    __.assert(_.isNumber(frameSize));

    var self = this;
    initResultMap();

    if (getResult()) {
      return getResult();
    }

    var leftTop = new app.Canpos(
      this.leftTop.x - this.unitSize * frameSize,
      this.leftTop.y - this.unitSize * frameSize
    ).normalize();
    var rightBtm = new app.Canpos(
      this.rightBtm.x + this.unitSize * frameSize,
      this.rightBtm.y + this.unitSize * frameSize
    ).normalize();
    setResult( new GridMap(leftTop, rightBtm) );

    return getResult();

    function initResultMap() {
      if (!self._aroundGridMaps) { self._aroundGridMaps = {}; }
    }
    function getResult() {
      return self._aroundGridMaps[ frameSize ];
    }
    function setResult(val) {
      self._aroundGridMaps[ frameSize ] = val;
    }
  };

  GridMap.prototype.getDoubleUnitSizeGridMap = function () {
    if (this._doubleOne) { return this._doubleOne; }
    var unitBounds = this.getGridUnitBounds();
    var leftTop = new app.Canpos(
      this.leftTop.x - this.unitSize * unitBounds.width,
      this.leftTop.y - this.unitSize * unitBounds.height
    ).normalize();
    var rightBtm = new app.Canpos(
      this.rightBtm.x + this.unitSize * unitBounds.width,
      this.rightBtm.y + this.unitSize * unitBounds.height
    ).normalize();
    
    this._doubleOne = new GridMap(leftTop, rightBtm);
    return this._doubleOne;
  };

  GridMap.prototype.getGridUnitBounds = function () {
    if (this._gridUnitBounds) { return this._gridUnitBounds; }
    this._gridUnitBounds = {
      width:  Math.ceil((this.rightBtm.x - this.leftTop.x) / this.unitSize) ,
      height: Math.ceil((this.rightBtm.y - this.leftTop.y) / this.unitSize)
    };
    return this._gridUnitBounds;
  };

  GridMap.prototype.getCanposBounds = function () {
    if (this._canposBounds) { return this._canposBounds; }
    this._canposBounds = this.leftTop.getRectangle( this.rightBtm );
    return this._canposBounds;
  };

  GridMap.prototype.getRoundedCanposBounds = function () {
    if (this._roundedCanposBounds) { return this._roundedCanposBounds; }
    var grids = this.getGrids();
    var gridTop  = GridMap.gridToCanpos(_.first(grids), this.unitSize);
    var gridLast = GridMap.gridToCanpos(_.last(grids),  this.unitSize);
    var rect = gridTop.getRectangle( gridLast );
    this._roundedCanposBounds = rect;
    return rect;
  };

  GridMap.gridToCanpos = function (n, opt_unitSize) {
    var unitSize = opt_unitSize || DEFAULT_UNIT_SIZE;
    var y = Math.floor(n / 36) * unitSize;
    var x = Math.floor(n % 36) * unitSize;
    return new app.Canpos(x, y);
  };

  function _GridCalc(unitSize) {
    this.unitSize = unitSize;
    this.xMax = 360 / unitSize;
  };

  _GridCalc.prototype.getGrid = function (x, y) {
    __.assert(_.isNumber(x) && _.isNumber(y));
    var x = this._floor(x), y = this._floor(y);
    return x + y * this.xMax;
  };

  _GridCalc.prototype._floor = function(n) {
    return Math.floor(n / this.unitSize);
  };
  _GridCalc.prototype.floor = _GridCalc.prototype._floor;

  _GridCalc.prototype.genGrids = function (leftTop, rightBtm, yieldFn) {
    var leftTopUnit =  {x: this._floor(leftTop.x),  y: this._floor(leftTop.y)};
    var rightBtmUnit = {x: this._floor(rightBtm.x), y: this._floor(rightBtm.y)};
    var unitY, unitX, grid;
    unitY = leftTopUnit.y;
    do {
      unitX = leftTopUnit.x;
      do {
	grid = this.getGrid(unitX * this.unitSize, unitY * this.unitSize)
	yieldFn( grid );
	unitX++;
      } while (unitX <= rightBtmUnit.x);
      unitY++;
    } while (unitY <= rightBtmUnit.y);
  };

  _GridCalc.prototype.getUnitSize = function () {
    return this.unitSize;
  };

  function __test() {
    var i,j,x,y,n;
    var calc;

    
    n = 0;
    calc = new _GridCalc(10);
    for(j=0; j<18; j++) {
      for(i=0; i<36; i++) {
	x = i*10; y = j*10;
	__.assert(n == calc.getGrid(x, y));
	n++;
      }
    }
    __log("test: _GridCalc ok.");


    n = 0;
    calc = new _GridCalc(10*3);
    for(j=0; j<18/3; j++) {
      for(i=0; i<36/3; i++) {
	x = i*10*3; y = j*10*3;
	__.assert(n == calc.getGrid(x, y));
	n++;
      }
    }
    __log("test: _GridCalc ok.");

    var gridMap, grids, aroundGrids;
    gridMap = new GridMap(
      new app.Canpos(0, 0),
      new app.Canpos(360 - 0.1, 180 - 0.1)
    );
    grids = gridMap.getGrids();
    __log(grids);
    assertArrEq(grids, _.range(18*36));
    aroundGrids = gridMap.getAroundGridMap().getGrids();
    assertArrEq(aroundGrids, _.range(18*36));
    __log("test: GridMap.getGrids ok.");

    grids = new GridMap(
      new app.Canpos(0, 0),
      new app.Canpos(360 - 0.1, 180 - 0.1),
      10 * 3
    ).getGrids();
    __log(grids);
    assertArrEq(grids, _.range((18/3) * (36/3)));
    __log("test: GridMap.getBigGrids ok.");

    gridMap = new GridMap(
      new app.Canpos(160, 50),
      new app.Canpos(170, 60)
    );
    grids = gridMap.getGrids();
    __.assert(grids.length == 4);
    assertArrEq(grids, [196, 197, 232, 233]);
    aroundGrids = gridMap.getAroundGridMap().getGrids();
    assertArrEq(aroundGrids, [159,160,161,162,195,196,197,198,231,232,233,234,267,268,269,270]);
    __log("test: 4 girds ok.");

    gridMap = new GridMap(
      new app.Canpos(160, 50),
      new app.Canpos(161, 51)
    );
    grids = gridMap.getGrids();
    assertArrEq(grids, [196]);
    aroundGrids = gridMap.getAroundGridMap().getGrids();
    assertArrEq(aroundGrids, [159,160,161,195,196,197,231,232,233]);
    __log("test: 1 grids ok.");

    gridMap = new GridMap(
      new app.Canpos(0, 0),
      new app.Canpos(1, 1)
    );
    grids = gridMap.getGrids();
    assertArrEq(grids, [0]);
    aroundGrids = gridMap.getAroundGridMap().getGrids();
    assertArrEq(aroundGrids, [0,1,36,37]);
    aroundGrids = gridMap.getDoubleUnitSizeGridMap().getGrids();
    assertArrEq(aroundGrids, [0,1,36,37]);
    __log("test: zero point grids ok.");

    gridMap = new GridMap(
      new app.Canpos(10.1, 10.1),
      new app.Canpos(10.2, 10.2)
    );
    grids = gridMap.getGrids();
    assertArrEq(grids, [37]);
    aroundGrids = gridMap.getAroundGridMap().getGrids();
    assertArrEq(aroundGrids, [0,1,2,36,37,38,72,73,74]);
    aroundGrids = gridMap.getDoubleUnitSizeGridMap().getGrids();
    assertArrEq(aroundGrids, [0,1,2,36,37,38,72,73,74]);
    __log("test: one point grids ok.");
    
    var canpos = GridMap.gridToCanpos(196);
    __.assert(canpos.x == 160);
    __.assert(canpos.y == 50);

    __log("GridMap.__test: All Tests Succeeded.");
    
    function __log(msg) {
      __.log(msg);
    }
    function assertArrEq(arr, r) {
      __.assert(arr.length == r.length);
      _.each(arr, function (n) {
	__.assert(r.indexOf(n) >= 0);
      });
    }
  }

  if (DEBUG) {
    __test();
  }

  return GridMap;
});
