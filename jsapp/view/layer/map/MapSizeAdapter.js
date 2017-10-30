(function (pkg, fac) {
  pkg.MapSizeAdapter = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  var DEFAULT_SCALE = 10.0;
  var ZOOM_MULT = 0.05;

  createjs.extend(MapSizeAdapter, app.Dispatcher);
  createjs.promote(MapSizeAdapter, "Dispatcher");
  
  function MapSizeAdapter(container, uiCommand, stageSizeMan) {
    __.assert(container && uiCommand && stageSizeMan);
    this.Dispatcher_constructor();

    this.container = container;
    this.uiCommand = uiCommand;
    this.stageSizeMan = stageSizeMan;

    this.uiCommand.on("zoom", _.bind(this._onZoomInput, this));
    this.curScale = DEFAULT_SCALE;
    this.container.scaleX = this.container.scaleY = this.curScale;

    this.uiCommand.on("mapMove", _.bind(this._onMapMove, this));
  }

  MapSizeAdapter.prototype._onZoomInput = function(e) {
    var nextScale = this.container.scaleX * (1.0 + ZOOM_MULT * (e.delta > 0 ? 1 : -1))
    this.updateScaleWithCenterFix(nextScale);
  };

  MapSizeAdapter.prototype.updateScaleWithCenterFix = function (scale) {
    __.assert(_.isNumber(scale));
    var oldCenterLocal = __getStageCenterLocalPos(this.container, this.stageSizeMan);
    this.container.scaleX = this.container.scaleY = scale;
    __setStageCenterLocalPos(this.container, this.stageSizeMan, oldCenterLocal);

    this.curScale = nextScale;
    this.fire("scale", {scale: nextScale});
  };

  function __getStageCenterLocalPos(container, stageSizeMan) {
    return container.globalToLocal(
      stageSizeMan.curWidth / 2.0,
      stageSizeMan.curHeight/ 2.0
    );
  }
  function __setStageCenterLocalPos(container, stageSizeMan, destCenterLocal) {
    var destCenterGlobal = container.localToGlobal(destCenterLocal.x, destCenterLocal.y);
    var diff = {
      x: destCenterGlobal.x - stageSizeMan.curWidth / 2.0,
      y: destCenterGlobal.y - stageSizeMan.curHeight / 2.0
    };
    container.x -= diff.x;
    container.y -= diff.y;
  }

  MapSizeAdapter.prototype._onMapMove = function (e) {
    this.container.x += e.moveX;
    this.container.y += e.moveY;
    this.fire("move", {});
  };

  return MapSizeAdapter;
});
