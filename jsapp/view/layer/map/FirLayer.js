(function (pkg, fac) {
  pkg.FirLayer = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  createjs.extend(FirLayer, app.CoordinatedLayer);
  createjs.promote(FirLayer, "CoordinatedLayer");

  var COLOR = app.COLOR.FIR_BDY.color;
  var ALPHA = app.COLOR.FIR_BDY.alpha;
  var DASH  = app.COLOR.FIR_BDY.dash;
  
  function FirLayer() {
    this.CoordinatedLayer_constructor();

    this.alpha = ALPHA;
    this.addChild( __createShape() );
  }

  function __createShape() {
    var DATA = atcapp.DATA_FUKUOKA_FIR;

    var points = DATA['p'];
    var shape = new createjs.Shape();
    var g = shape.graphics;
    g.setStrokeStyle( 1, "square", "miter", 10, true );
    g.setStrokeDash( DASH );
    g.beginStroke( COLOR );
    g.moveTo(points[0][0], points[0][1]);
    _.each(points.slice(1), function (p) {
      g.lineTo(p[0], p[1]);
      console.log(p);
    });
    g.endStroke();
    return shape;
  }

  return FirLayer;
});
