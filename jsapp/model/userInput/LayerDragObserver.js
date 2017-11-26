(function (pkg, fac) {
  pkg.LayerDragObserver = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(LayerDragObserver, app.Dispatcher);
  createjs.promote(LayerDragObserver, "Dispatcher");

  function LayerDragObserver() {
    this.Dispatcher_constructor();
    this.btn = {getIsActive: _.noop};
  }

  LayerDragObserver.prototype.setup = function (container, keyObserver, onDragged) {
    __.assert(container && _.isObject(keyObserver) && _.isFunction(onDragged));

    var self = this;
    var _lastPos = null;
    container.addEventListener("mousedown", onStart);

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
      onDragged(  curPos.x - _lastPos.x, curPos.y - _lastPos.y );
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
  }

  LayerDragObserver.prototype.setupUiBtn = function (btn) {
    __.assert(_.isFunction(btn.getIsActive));
    this.btn = btn;
  };

  return LayerDragObserver;
});
