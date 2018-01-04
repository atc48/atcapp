(function (pkg, fac) {
  pkg.FixDistributor = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  var DATA;

  function FixDistributor() {
    DATA = app.DATA_FIXES_AND_ROUTES;
    this.changeHandlers = new _Handlers();
    this.visibleFixes = [];
    this.activeFixes = [];
  }

  var p = FixDistributor.prototype;

  p.init = function (mapStatus) {
    this._setupFixes();

    this.mapStatus = mapStatus;
    this.lastMapStatusSet = {};
    mapStatus.on("change_defer", _.bind(this._refresh, this));
  };

  p.refresh = function () {
    this._refresh();
  };

  p._setupFixes = function () {
    app.FixData.updateKeys( DATA["fixes_keys"] );
    this.gridMapUnitSize = DATA["grid_map_unit_size"];
    __.assert(_.isNumber(this.gridMapUnitSize));

    var onUserStatusUpdated = _.bind(this._onUserStatusUpdated, this);

    // fixMap
    var fixMap = DATA[ "fixes" ];
    _.each(fixMap, function (obj, code) {
      var fix = new app.Fix( new app.FixData(obj, code) );
      fix.getUserStatus().on("up", onUserStatusUpdated);
      fixMap[code] = fix;
    });

    // priorityGridMap
    var priorityGridMap = {};
    _.each(DATA[ "priority_grid_map" ], function (gridMap, priority) {
      var eachPriorMap = priorityGridMap[ priority ] = {};
      _.each(gridMap, function (codes, grid) {
	var eachFixList = eachPriorMap[ grid ] = [];
	_.each(codes, function (code) {
	  var fix = fixMap[ code ];
	  eachFixList.push(fix);
	});
      });
    });

    // set vars
    this.fixMap = fixMap;
    this.priorityGridMap = priorityGridMap;
  };

  function __gridsAlmostEquals(a, b) {
    if (!a && !b) { return true; }
    if (!a || !b) { return false; }
    return a.length == b.length && _.first(a) == _.first(a) && _.last(a) == _.last(b);
  }

  p._refresh = function () {
    var scale = this.mapStatus.getScale();
    var grids = this.mapStatus.getGridMap(this.gridMapUnitSize).getGrids();
    var fixVisibleMode = app.Fix.getDefaultVisibleModeByScale(scale);

    var mapStatusSet = {grids: grids, fixVisibleMode: fixVisibleMode};
    if (mapStatusSet.fixVisibleMode == this.lastMapStatusSet.fixVisibleMode &&
	__gridsAlmostEquals(mapStatusSet.grids, this.lastMapStatusSet.grids) &&
	_.isEqual(this.activeFixes, this.lastRefreshedActiveFixes)
       ){
      return;
    }
    this.lastMapStatusSet = mapStatusSet;
    this.lastRefreshedActiveFixes = _.without(this.activeFixes);

    var changeHandlers = this.changeHandlers;
    changeHandlers.onStart();

    var self = this;
    var fixes = [];

    _.each(fixVisibleMode.visiblePriorities(), function (priority) {
      var eachGridToFixes = self.priorityGridMap[priority];
      if (!eachGridToFixes) { return; }
      _.each(grids, function (grid) {
	var eachFixes = eachGridToFixes[grid];
	if (!eachFixes) { return; }
	_.each(eachFixes, visiblizeFix);
      });
    });

    _.each(_.difference(this.activeFixes, fixes), visiblizeFix);

    fixes = _.uniq(fixes);

    changeHandlers.onEnd( fixes );

    this.visibleFixes = fixes;

    function visiblizeFix(eachFix) {
      eachFix.changeVisibleMode( fixVisibleMode );
      eachFix.onLayerScaleUpdated( scale );
      fixes.push( eachFix );
      changeHandlers.onEachFix( eachFix );
    }
  };

  p._onUserStatusUpdated = function (e) {
    var fix = e.target;
    this.activeFixes = _.reject(
      this.activeFixes, function (eachFix) { return fix == eachFix; });
    if (!fix.getUserStatus().isDefault()) {
      this.activeFixes.push( fix );
    }
  };

  p.addHandler = function (opt_onChangeStart, opt_onEachFix, opt_onEnd) {
    this.changeHandlers.append(opt_onChangeStart, opt_onEachFix, opt_onEnd);
    return this;
  };

  p.getFixMapObject = function () {
    __.assert(this.fixMap, "has not init");
    return this.fixMap;
  };

  function _Handlers() {
    var _startFns   = [];
    var _eachFixFns = [];
    var _endFns     = [];
    this.append = function (start, eachFix, end) {
      if (start)   {   _startFns.push( start ); }
      if (eachFix) { _eachFixFns.push( eachFix ); }
      if (end)     {     _endFns.push( end ); }
    }
    this.onStart = function () {
      _.each(_startFns, function (fn) { fn(); });
    };
    this.onEachFix = function (fix) {
      _.each(_eachFixFns, function (fn){ fn(fix); });
    };
    this.onEnd = function (fixes) {
      _.each(_endFns, function (fn) { fn(fixes); });
    };
  }

  return FixDistributor;
  
});
