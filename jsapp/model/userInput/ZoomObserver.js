(function (pkg, fac) {
  pkg.ZoomObserver = fac($, __, pkg);
})(atcapp, function ($, __, app) {

  createjs.extend(ZoomObserver, app.Dispatcher);
  createjs.promote(ZoomObserver, "Dispatcher");
  
  var MOUSE_WHEEL_EVENT = app.BrowserDepends.MOUSE_WHEEL_EVENT;
			 
  function ZoomObserver($stage) {
    this.Dispatcher_constructor();
    __.assert($stage && $stage[0]);
    this.btn = {getIsActive: _.noop};
    this.setupUiBtn = function (btn) {
      __.assert(_.isFunction(btn.getIsActive));
      this.btn = btn;
    };

    this.setup = function (keyObserver) {
      __.assert(_.isObject(keyObserver));
      $stage.on(MOUSE_WHEEL_EVENT, _onMouseWheel);
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
	self.fire("onZoomed", {delta: - delta});
      }
    };
  }
  
  return ZoomObserver;
});
