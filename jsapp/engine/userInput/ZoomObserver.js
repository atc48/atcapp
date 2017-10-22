(function (pkg, fac) {
  pkg.ZoomObserver = fac($, __, pkg);
})(atcapp, function ($, __, app) {

  var MOUSE_WHEEL_EVENT = (function () {
    if ('onwheel' in document) { return 'wheel'; }
    if ('onmousewheel' in document) { return 'mousewheel'; }
    return 'DOMMouseScroll';
  })();
			 
  function ZoomObserver($stage, uiCommand) {
    __.assert($stage && $stage[0] && uiCommand);

    $stage.on(MOUSE_WHEEL_EVENT, _onMouseWheel);
    
    function _onMouseWheel(e) {
      e.preventDefault();
      var delta = (function () {
	if (e.originalEvent.deltaY) { return - e.originalEvent.deltaY; }
	if (e.originalEvent.wheelDelta) { return e.originalEvent.wheelDelta }
	return e.originalEvent.detail;
	// Scroll UP   : delta < 0
	// Scroll DOWN : delta > 0
      })();
      _onZoomed(- delta);
    }

    function _onZoomed(delta) {
      uiCommand.fire("zoom", {delta: delta});
    }
  }
  
  return ZoomObserver;
});
