(function (pkg, fac) {
  pkg.MapStatus = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(MapStatus, app.Dispatcher);
  createjs.promote(MapStatus, "Dispatcher");

  var GRID_CHANGE_DELAY     = 1000 / 10;
  var GRID_CHANGE_DELAY_MAX = 1000;

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
    
    var onMapChangedFn = _.bind(this._onMapChanged, this);
    this.on("scale", onMapChangedFn);
    this.on("move",  onMapChangedFn);

    this._onGridChangeDefer = new app.Deferer(
      _.bind(this._onGridChange, this), GRID_CHANGE_DELAY, GRID_CHANGE_DELAY_MAX);
  };
  
  // dispatches "scale" => {scale: scale}
  // dispatches "move"  => {}
  // dispatches ""

  MapStatus.prototype.getGridMap = function () {
    var leftTop  = this.mapCoordConverter.stageToCanpos(0, 0).normalize();
    var rightBtm = this.mapCoordConverter.stageToCanpos(
      this.stageSize.curWidth, this.stageSize.curHeight).normalize();

    return new app.GridMap(leftTop, rightBtm);
  };

  MapStatus.prototype._onMapChanged = function () {
    var diffGrid;

    this.fire("change", {});

    this._onGridChangeDefer.on();
  };
  
  MapStatus.prototype._onGridChange = function () {
     this.prevGridMap = this.gridMap;
     this.gridMap     = this.getGridMap();
     if (this.gridMap.gridsEquals(this.prevGridMap)) {
       return;
     }
     var gridMapDiff = new _GridMapDiff( this.gridMap, this.prevGridMap );
     this.fire("gridChanged", {
       'gridMap': this.gridMap,
       'diff': gridMapDiff
     });
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
