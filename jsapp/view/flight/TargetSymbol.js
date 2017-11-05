(function (pkg, fac) {
  pkg.TargetSymbol = fac(createjs, pkg);
})(atcapp, function (createjs, app) {

  //createjs.extend(TargetSymbol, createjs.Bitmap);
  createjs.extend(TargetSymbol, createjs.Shape);//createjs.Bitmap);
  createjs.promote(TargetSymbol, "super");

  var WING = 4;
  var NOSE = 8;
  var C = app.COLOR.SIMBOL;
  var TRI = app.IMG.TRIANGLE;

  function TargetSymbol() {
    this.super_constructor();
    //this.super_constructor( TRI );
    this._draw( C.NORMAL );
    this.cache(-WING, -NOSE, WING * 2, NOSE * 2);
  }

  TargetSymbol.prototype._draw = function (color) {
    var g = this.graphics;
    g.clear()
      .beginFill( color )
      .moveTo( -WING, -NOSE )
      .lineTo(  WING, -NOSE )
      .lineTo(     0,  NOSE )
      .lineTo( -WING, -NOSE );

  }

  return TargetSymbol;
});
