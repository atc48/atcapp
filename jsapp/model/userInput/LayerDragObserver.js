(function (pkg, fac) {
  pkg.LayerDragObserver = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(LayerDragObserver, app.Dispatcher);
  createjs.promote(LayerDragObserver, "Dispatcher");

  function LayerDragObserver() {
    this.Dispatcher_constructor();
    this.btn = {getIsActive: _.noop};
  }

  LayerDragObserver.prototype.setup = function (container, keyObserver, mapDragPanelBtn) {
    __.assert(container && _.isObject(keyObserver));
    __.assert(_.isFunction(mapDragPanelBtn.on) && _.isFunction(mapDragPanelBtn.off) &&
	      _.isFunction(mapDragPanelBtn.getIsActive));

    var self = this;
    var _lastPos = null;
    container.addEventListener("mousedown", onStart);

    var _lastMapMode = false;
    keyObserver.on("onMetaKey",    _onMapModeUpdated);
    keyObserver.on("offMetaKey",   _onMapModeUpdated);
    mapDragPanelBtn.on("active",   _onMapModeUpdated);
    mapDragPanelBtn.on("deactive", _onMapModeUpdated);

    function onStart(e) {
      if (_lastPos) { reset(); }
      if (!keyObserver.isMetaKeyDown && !self.btn.getIsActive()) { return; }

      e.preventDefault();
      _lastPos = { x: e.stageX, y: e.stageY };
      self.fire("start");
      container.addEventListener("pressmove", onMove);
      container.addEventListener("pressup", onFinish);
    }
    function onMove(e) {
      var curPos = { x: e.stageX, y: e.stageY };
      self.fire("onDragged", {diffX: curPos.x - _lastPos.x, diffY: curPos.y - _lastPos.y} );
      _lastPos = curPos;
    }
    function onFinish(e) {
      reset();
      self.fire("end");
    }
    function reset() {
      _lastPos = null;
      container.removeEventListener("pressmove", onMove);
      container.removeEventListener("mousedown", onFinish);
    }

    function _onMapModeUpdated() {
      var isMapMode = keyObserver.getIsMetaKeyDown() || mapDragPanelBtn.getIsActive();
      if (isMapMode == _lastMapMode) { return; }
      _lastMapMode = isMapMode;

      if (isMapMode) {
	self.fire("onMapDragMode");
      } else {
	self.fire("offMapDragMode");
      }
    }
  }

  LayerDragObserver.prototype.setupUiBtn = function (btn) {
    __.assert(_.isFunction(btn.getIsActive));
    this.btn = btn;
  };

  return LayerDragObserver;
});
