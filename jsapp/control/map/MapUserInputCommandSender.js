(function (pkg, fac) {
  pkg.MapUserInputCommandSender = fac(_, __);
})(atcapp, function (_, __) {

  function MapUserInputCommandSender() {
  };

  MapUserInputCommandSender.prototype.setup = function (
    uiCommand, zoomObserver, layerDragObserver) {
    
    layerDragObserver.on("onDragged", _onMapDragged);
    zoomObserver.on("onZoomed", _onMapZoomed);
		    
    function _onMapDragged(e) {
      __.assert(_.isNumber(e.diffX) && !_.isNaN(e.diffX) &&
		_.isNumber(e.diffY) && !_.isNaN(e.diffY));
      uiCommand.fire("mapMove", { moveX: e.diffX, moveY: e.diffY });
    }
    function _onMapZoomed(e) {
      __.assert(_.isNumber(e.delta) && !_.isNaN(e.delta));
      uiCommand.fire("zoom", {delta: e.delta});
    }
  }

  return MapUserInputCommandSender;
});
