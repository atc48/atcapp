(function (pkg, fac) {
  pkg.MapUserInputCommandSender = fac(_, __);
})(atcapp, function (_, __) {

  function MapUserInputCommandSender(uiCommand, keyObserver, zoomObserver, layerDragObserver) {

    this.init = function (stage) {
      layerDragObserver.setup(stage, keyObserver, _onMapDragged);
      zoomObserver.setup(keyObserver, _onMapZoomed);
      return this;
    };

    function _onMapDragged(diffX, diffY) {
      uiCommand.fire("mapMove", { moveX: diffX, moveY: diffY });
    }
    function _onMapZoomed(delta) {
      uiCommand.fire("zoom", {delta: delta});
    }
  }

  return MapUserInputCommandSender;
});
