(function (pkg, fac) {
  pkg.CoordGridLayer = fac(_, createjs, pkg);
})(atcapp, function(_, createjs, app) {

  createjs.extend(CoordGridLayer, app.CoordinatedLayer);
  createjs.promote(CoordGridLayer, "CoordinatedLayer");

  var COLOR_S = app.COLOR.MAPGRID_S;
  var COLOR_L = app.COLOR.MAPGRID_L;
  
  function CoordGridLayer() {
    this.CoordinatedLayer_constructor();

    this.addChild( __createGridShape() );
    this.__updateScale(1.0);
  }

  function __createGridShape() {
    var shape = new createjs.Shape();
    var g = shape.graphics;
    var x, y;
    var X_MAX = 360, Y_MAX = 180;
    g.setStrokeStyle( 1, "butt", "miter", 10, true );
    for (x = 0; x <= X_MAX; x += 5) {
      g.beginStroke( _color(x) );
      g.moveTo(x,     0);
      g.lineTo(x, Y_MAX);
    }
    for (y = 0; y <= Y_MAX; y += 5) {
      g.beginStroke( _color(y) );
      g.moveTo(    0, y);
      g.lineTo(X_MAX, y);
    }
    g.endStroke();
    return shape;

    function _color(n) {
      return n % 10 == 0 ? COLOR_L : COLOR_S;
    }
  }

  return CoordGridLayer;
});
