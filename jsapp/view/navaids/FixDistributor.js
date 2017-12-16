(function (pkg, fac) {
  pkg.FixDistributor = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  var DATA;

  function FixDistributor() {
    DATA = app.DATA_FIXES_AND_ROUTES;
    this.changeHandlers = new _Handlers();
    this.activeFixes = [];
  }

  var p = FixDistributor.prototype;

  p.init = function (mapStatus) {
    this._setupFixes();

    this.mapStatus = mapStatus;
    this.lastMapStatusSet = null;
    mapStatus.on("gridChanged_prolong", _.bind(this._onGridChanged, this));
  };

  p._setupFixes = function () {
    app.FixData.updateKeys( DATA["fixes_keys"] );

    // fixMap
    var fixMap = {};
    _.each(DATA[ "fixes" ], function (obj, code) {
      var fix = new app.Fix( new app.FixData(obj, code) );
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

  p._onGridChanged = function (e) {
    var scale = this.mapStatus.getScale();
    var grids = this.mapStatus.getGridMap().getGrids();
    var fixVisibleMode = app.Fix.getDefaultVisibleModeByScale(scale);

    var mapStatusSet = {grids: grids, fixVisibleMode: fixVisibleMode};
    if (mapStatusSet == this.lastMapStatusSet) {
      return;
    }
    this.lastMapStatusSet = mapStatusSet;

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
	_.each(eachFixes, function (fix) {
	  fix.changeVisibleMode( fixVisibleMode );
	  fix.onLayerScaleUpdated( scale );
	  fixes.push( fix );
	  changeHandlers.onEachFix( fix );
	});
      });
    });

    changeHandlers.onEnd( fixes );

    this.activeFixes = fixes;
  };

  p.addHandler = function (opt_onChangeStart, opt_onEachFix, opt_onEnd) {
    this.changeHandlers.append(opt_onChangeStart, opt_onEachFix, opt_onEnd);
    return this;
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
