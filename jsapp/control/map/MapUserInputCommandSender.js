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
      var event = (function () {
	if (__isValidNum(e.delta)) {
	  return {delta: e.delta};
	}
	if (__isValidNum(e.scale)) {
	  return {scale: e.scale};
	}
	if (__isValidNum(e.scaleMult)) {
	  return {scaleMult: e.scaleMult};
	}
	__.assert(false, "invalid event. e=" + event);
      })();
      event["type"] = "zoom";
      uiCommand.fire("zoom", event);
    }
  }

  function __isValidNum(n) {
    return _.isNumber(n) && !_.isNaN(n);
  }

  return MapUserInputCommandSender;
});
