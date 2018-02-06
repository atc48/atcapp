(function (pkg, fac) {
  pkg.LayerDragObserver = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(LayerDragObserver, app.Dispatcher);
  createjs.promote(LayerDragObserver, "Dispatcher");

  function LayerDragObserver() {
    this.Dispatcher_constructor();
    this.mapModeBtn = {getIsActive: _.noop};
  }

  var p = LayerDragObserver.prototype;

  p.setup = function (container, keyObserver, mapModeBtn, touchDragObserver) {
    __.assert(container && _.isObject(keyObserver) && _.isFunction(mapModeBtn.on) && _.isFunction(mapModeBtn.off) && _.isFunction(mapModeBtn.getIsActive) && touchDragObserver);

    this.keyObserver = keyObserver;
    this.mapModeBtn = mapModeBtn;

    this._setupMouseDrag(container);
    this._setupTouchDeviceDrag(touchDragObserver);
  };

  p._setupMouseDrag = function (container) {
    var self = this;
    var _lastPos = null;
    container.addEventListener("mousedown", onStart);

    var _lastMapMode = false;
    this.keyObserver.on("onMetaKey",    _onMapModeUpdated);
    this.keyObserver.on("offMetaKey",   _onMapModeUpdated);
    this.mapModeBtn.on("active",   _onMapModeUpdated);
    this.mapModeBtn.on("deactive", _onMapModeUpdated);

    function isDragging() {
      return _lastPos;
    }

    function onStart(e) {
      if (isDragging()) { reset(); }
      if (!self._isMapMode()) { return; }

      e.preventDefault();
      _lastPos = { x: e.stageX, y: e.stageY };
      self.fire("start");
      container.addEventListener("pressmove", onMove);
      container.addEventListener("pressup", onFinish);
    }
    function onMove(e) {
      var curPos = { x: e.stageX, y: e.stageY };
      self._fireDraggedEvent(curPos.x - _lastPos.x, curPos.y - _lastPos.y);
      _lastPos = curPos;
    }
    function onFinish(e) {
      if (!isDragging()) { return; }
      reset();
      self.fire("end");
    }
    function reset() {
      _lastPos = null;
      container.removeEventListener("pressmove", onMove);
      container.removeEventListener("mousedown", onFinish);
    }

    function _onMapModeUpdated() {
      var isMapMode = self._isMapMode();
      if (isMapMode == _lastMapMode) { return; }
      _lastMapMode = isMapMode;

      if (isMapMode) {
	self.fire("onMapDragMode");
      } else {
	if (isDragging()) {
	  onFinish();
	}
	self.fire("offMapDragMode");
      }
    }
  };

  p._setupTouchDeviceDrag = function (touchDragObserver) {

    var self = this;
    touchDragObserver.on("drag", _onTouchDrag);

    function _onTouchDrag(e) {
      if (!self._isMapMode()) { return; }
      if (!e.isSingleTouch) { return; }

      e.preventDefault();
      self._fireDraggedEvent(e.moveX, e.moveY);
    }
    
  };

  p._fireDraggedEvent = function (diffX, diffY) {
    // Listeners have no need to also listen "start", "end" event.
    // Those events are independent from "onDragged" event.
    this.fire("onDragged", {
      type:  "onDragged",
      diffX: diffX,
      diffY: diffY
    });
  };

  p._isMapMode = function () {
    return this.keyObserver.getIsMetaKeyDown() || this.mapModeBtn.getIsActive();
  };

  return LayerDragObserver;
});
