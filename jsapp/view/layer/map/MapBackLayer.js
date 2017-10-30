(function (pkg, fac) {
  pkg.MapBackLayer = fac(_, createjs, pkg);
})(atcapp, function(_, createjs, app) {

  createjs.extend(MapBackLayer, app.CoordinatedLayer);
  createjs.promote(MapBackLayer, "CoordinatedLayer");

  function MapBackLayer() {
    this.CoordinatedLayer_constructor();
    var rightBottom = app.Canpos.canposByCoord(360, -90);
    var shape = new createjs.Shape();
    shape.graphics
      .beginFill(app.COLOR.BACKGROUND)
      .drawRect(0, 0, rightBottom.x, rightBottom.y);
    return shape;
    
  }

  return MapBackLayer;
});

