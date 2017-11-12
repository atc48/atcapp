(function (pkg, fac) {
  pkg.MapStatus = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(MapStatus, app.Dispatcher);
  createjs.promote(MapStatus, "Dispatcher");

  var GRID_CHANGE_DELAY     = 1000;
  var GRID_CHANGE_DELAY_MAX = 1000 * 3;
  var GRID_CHANGE_PROLONG_DEFER_DELAY = 400;

  /**
   * External interface for map scale, grid status, etc.
   *   this class is only for observing event but not for firing,
   *   only MapUICommandHandler can fire via this class.
   */
  /**
   * (ZoomObserver, KeyboardObserver, MapLayerDragObserver)
   *   => MapUserInputCommandSender
   *   => UICommand
   *   => UICommandHandler
   *   => MapStatus
   *   ==> many classes
   */
  function MapStatus() {
    this.Dispatcher_constructor();
  }

  MapStatus.prototype.setup = function (mapCoordConverter, stageSize) {
    __.assert(_.isObject(mapCoordConverter) && _.isObject(stageSize));
    this.mapCoordConverter = mapCoordConverter;
    this.stageSize         = stageSize;
    var self = this;

    this.scale = 1;

    var onMapChangedFn = _.bind(this._onMapChanged, this);
    this.on("scale", onMapChangedFn);
    this.on("move",  onMapChangedFn);
    this.stageSize.on("resize", onMapChangedFn);

    this.gridChangedStates = {
      "gridChanged"         : {},
      "gridChanged_prolong" : {}
    };
    this._onGridChangeDefer = new app.Deferer(
      _.bind(this._onGridChange, this), GRID_CHANGE_DELAY, GRID_CHANGE_DELAY_MAX);
    this._onGridChangeProlongDefer = new app.Deferer(function () {
      self._onGridChange("gridChanged_prolong");
    }, GRID_CHANGE_PROLONG_DEFER_DELAY);
  };
  
  // dispatches "scale" => {scale: scale}
  // dispatches "move"  => {}
  // dispatches ""

  MapStatus.prototype.getGridMap = function () {
    if (this._gridMap) {
      return this._gridMap;
    }
    var leftTop  = this.mapCoordConverter.stageToCanpos(0, 0).normalize();
    var rightBtm = this.mapCoordConverter.stageToCanpos(
      this.stageSize.curWidth, this.stageSize.curHeight).normalize();

    this._gridMap = new app.GridMap(leftTop, rightBtm);
    return this._gridMap;
  };

  MapStatus.prototype.getAroundGridMap = function (opt_frameUnitSize) {
    return this.getGridMap().getAroundGridMap(opt_frameUnitSize);
  };

  MapStatus.prototype.getScale = function () {
    return this.scale;
  }

  MapStatus.prototype._onMapChanged = function (e) {
    __.assert(["MapStatus.scale", "MapStatus.move", "StageSize.resize"].indexOf(e.type) >= 0);
    var diffGrid;
    // in case
    if (e.type == "MapStatus.scale") {
      this.scale = e.scale;
    }
    this._gridMap = null;
    this.fire("change", {});

    this._onGridChangeDefer.on();
    this._onGridChangeProlongDefer.on();
  };
  
  MapStatus.prototype._onGridChange = function (opt_eventType) {
    var eventType = opt_eventType || "gridChanged";
    __.assert(["gridChanged", "gridChanged_prolong"].indexOf(eventType) >= 0);
    var state = this.gridChangedStates[ eventType ];
    state.prevGridMap = state.gridMap || null;
    state.gridMap     = this.getGridMap();
    if (state.gridMap.gridsEquals(state.prevGridMap)) {
      return;
    }
    var gridMapDiff = new _GridMapDiff( state.gridMap, state.prevGridMap );
    var event = {
      'gridMap': state.gridMap,
      'diff': gridMapDiff
    };
    this.fire(eventType, event);
  };

  function _GridMapDiff(cur, prev) {
    this.cur = cur;
    this.prev = prev || null;
    this.diff = null;
  }
  _GridMapDiff.prototype.get = function () {
    if (this.diff) { return this.diff; }
    __.assert(!this.cur.gridsEquals(this.prev));
    var newGrids = this.cur.getGrids();
    var oldGrids = this.prev && this.prev.getGrids() || [];
    this.diff = {
      add: _.difference(newGrids, oldGrids), // added grids
      red: _.difference(oldGrids, newGrids)  // reduced grids
    };
    return this.diff;
  };

  return MapStatus;
  
});