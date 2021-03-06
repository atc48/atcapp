(function (pkg, fac) {
  pkg.CoordGridLayer = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  createjs.extend(CoordGridLayer, app.CoordinatedLayer);
  createjs.promote(CoordGridLayer, "CoordinatedLayer");

  var COLOR = app.COLOR.MAPGRID;;
  
  function CoordGridLayer() {
    this.CoordinatedLayer_constructor();

    this.addChild( __createGridShape(0) );
  }

  CoordGridLayer.prototype.onScaleUpdated = function (scale) {
    __.assert(_.isNumber(scale));
    var gridSep = __gridSepByScale(scale);
    var shape = __createGridShape(gridSep);
    if (this.getChildAt(0) === shape) {
      return;
    }
    this.removeChildAt(0);
    this.addChild( shape );
  };

  function __gridSepByScale(scale) {
    if (scale < 9) { return 0; }
    if (scale < 12) { return 10; }
    if (scale < 40) {  return 5; }
    return 1;
  }

  var _GRID_SHAPE_OBJ_POOL = {};
  function __createGridShape(gridSep) {
    __.assert(_.isNumber(gridSep));
    var shape = _GRID_SHAPE_OBJ_POOL['' + gridSep];
    if (shape) { return shape; }
    shape = new createjs.Shape();
    _GRID_SHAPE_OBJ_POOL['' + gridSep] = shape;
    if (gridSep <= 0) {
      return shape;
    }
    var g = new app.CanposGraphicsWrapper(shape.graphics);
    var x, y;
    var X_MIN =   0, X_MAX = 360,
	Y_MIN = -90, Y_MAX =  90;
    g.setStrokeStyle( 1, "butt", "miter", 10, true );
    for (x = X_MIN; x <= X_MAX; x += gridSep) {
      g.beginStroke( _color(x) );
      g.moveTo(x, Y_MIN);
      g.lineTo(x, Y_MAX);
    }
    for (y = Y_MIN; y <= Y_MAX; y += gridSep) {
      g.beginStroke( _color(y) );
      g.moveTo(X_MIN, y);
      g.lineTo(X_MAX, y);
    }
    g.endStroke();
    return shape;

    function _color(n) {
      if (n % 10 == 0) { return COLOR._10; }
      if (n %  5 == 0) { return COLOR.__5; }
      if (n %  1 == 0) { return COLOR.__1; }
    }
  }

  return CoordGridLayer;
});
