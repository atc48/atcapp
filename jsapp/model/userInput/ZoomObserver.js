(function (pkg, fac) {
  pkg.ZoomObserver = fac($, __, pkg);
})(atcapp, function ($, __, app) {

  createjs.extend(ZoomObserver, app.Dispatcher);
  createjs.promote(ZoomObserver, "Dispatcher");
  
  function ZoomObserver($stage) {
    this.Dispatcher_constructor();
    __.assert($stage && $stage[0]);
    this.btn = {getIsActive: _.noop};
    this.setupUiBtn = function (btn) {
      __.assert(_.isFunction(btn.getIsActive));
      this.btn = btn;
    };

    this.setup = function (keyObserver, scrollDeltaFilter, mouseWheelEvent) {
      __.assert(_.isObject(keyObserver) && _.isFunction(scrollDeltaFilter) && _.isString(mouseWheelEvent));
      $stage.on(mouseWheelEvent, _onMouseWheel);
      var self = this;
    
      function _onMouseWheel(e) {
	if (!keyObserver.isMetaKeyDown && !self.btn.getIsActive()) {
	  return;
	}
	e.preventDefault();
	var delta = (function () {
	  if (e.originalEvent.deltaY) { return - e.originalEvent.deltaY; }
	  if (e.originalEvent.wheelDelta) { return e.originalEvent.wheelDelta }
	  return e.originalEvent.detail;
	  // Scroll UP   : delta < 0
	  // Scroll DOWN : delta > 0
	})();
	self.fire("onZoomed", {delta: scrollDeltaFilter(delta)});
      }
    };
  }

  return ZoomObserver;
});
