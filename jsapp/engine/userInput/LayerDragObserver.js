(function (pkg, fac) {
  pkg.LayerDragObserver = fac(__, createjs, pkg);
})(atcapp, function (__, createjs, app) {

  function LayerDragObserver(uiCommand, keyObserver) {
    __.assert(uiCommand && keyObserver);
    this.uiCommand = uiCommand;
    this.keyObserver = keyObserver;
  }

  LayerDragObserver.prototype.setup = function (key, container) {
    __.assert(key && _.isString(key) && container);

    var uiCommand   = this.uiCommand;
    var keyObserver = this.keyObserver;
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
      uiCommand.fire("mapMove", {
	moveX: curPos.x - _lastPos.x,
	moveY: curPos.y - _lastPos.y
      });
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
