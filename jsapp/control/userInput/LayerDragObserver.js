(function (pkg, fac) {
  pkg.LayerDragObserver = fac(__, createjs, pkg);
})(atcapp, function (__, createjs, app) {

  function LayerDragObserver() {
  }

  LayerDragObserver.prototype.setup = function (container, keyObserver, onDragged) {
    __.assert(container && _.isObject(keyObserver) && _.isFunction(onDragged));

    var _lastPos = null;
    container.addEventListener("mousedown", onStart);
    
    function onStart(e) {
      if (_lastPos) { reset(); }
      if (!keyObserver.isMetaKeyDown) { return; }

      e.preventDefault();
      _lastPos = { x: e.stageX, y: e.stageY };
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
    }
    function reset() {
      _lastPos = null;
      container.removeEventListener("pressmove", onMove);
      container.removeEventListener("mousedown", onFinish);
    }
  }

  return LayerDragObserver;
});
