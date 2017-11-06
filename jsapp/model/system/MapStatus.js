(function (pkg, fac) {
  pkg.MapStatus = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(MapStatus, app.Dispatcher);
  createjs.promote(MapStatus, "Dispatcher");

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

  MapStatus.prototype.setup = function (mapCoordConverter) {
    this.mapCoordConverter = mapCoordConverter;
    
    var onMapChangedFn = _.bind(this._onMapChanged, this);
    this.on("scale", onMapChangedFn);
    this.on("move",  onMapChangedFn);
  };
  
  // dispatches "scale" => {scale: scale}
  // dispatches "move"  => {}
  // dispatches ""

  MapStatus.prototype._onMapChanged = function () {
    var diffGrid;

    this.fire("change");
  }

  return MapStatus;
  
});
