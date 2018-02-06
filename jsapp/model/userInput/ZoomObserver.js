(function (pkg, fac) {
  pkg.ZoomObserver = fac($, __, pkg);
})(atcapp, function ($, __, app) {

  createjs.extend(ZoomObserver, app.Dispatcher);
  createjs.promote(ZoomObserver, "Dispatcher");
  
  function ZoomObserver($stage) {
    this.Dispatcher_constructor();
    __.assert($stage && $stage[0]);

    this.mapModeBtn = {getIsActive: _.noop};
    this.$stage = $stage;
  }

  var p = ZoomObserver.prototype;

  p.setup = function (keyObserver, mapModeBtn, scrollDeltaFilter, mouseWheelEvent,
		     touchZoomObserver) {
    __.assert(_.isFunction(mapModeBtn.getIsActive) && _.isObject(keyObserver));
    __.assert(_.isFunction(scrollDeltaFilter) && _.isString(mouseWheelEvent) &&
	     touchZoomObserver);

    this.keyObserver = keyObserver;
    this.mapModeBtn = mapModeBtn;
    this.scrollDeltaFilter = scrollDeltaFilter;
    this.touchZoomObserver = touchZoomObserver;

    this.$stage.on(mouseWheelEvent, _.bind(this._onMouseWheel, this));
    this.touchZoomObserver.on("zoom", _.bind(this._onTouchZoom, this));
  }

  p._onMouseWheel = function(e) {
    if (!this.keyObserver.isMetaKeyDown && !this.mapModeBtn.getIsActive()) {
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
    this._fireOnZoomed(this.scrollDeltaFilter(delta));
  };

  p._onTouchZoom = function (e) {
    e.preventDefault();
    var delta = e.scaleDiff;
    this._fireOnZoomed(delta);
  };

  p._fireOnZoomed = function (delta) {
    this.fire("onZoomed", {
      type: "onZoomed",
      delta: delta
    });
  };


  return ZoomObserver;
});
