(function (pkg, fac) {
  pkg.TargetSymbol = fac(createjs, pkg);
})(atcapp, function (createjs, app) {

  createjs.extend(TargetSymbol, createjs.Shape);
  createjs.promote(TargetSymbol, "super");

  var WING = 4;
  var NOSE = 8;
  var C = app.COLOR.SIMBOL;
  var USE_CACHE = false;

  function TargetSymbol() {
    this.super_constructor();
    this._draw( C.NORMAL );
    USE_CACHE && this.cache(-WING, -NOSE, WING * 2, NOSE * 2);
    this.alpha = C.ALPHA;
  }

  TargetSymbol.prototype._draw = function (color) {
    var g = this.graphics;
    g.clear()
      .beginFill( color )
      .moveTo(     0, -NOSE )
      .lineTo(  WING,  NOSE )
      .lineTo( -WING,  NOSE )
      .lineTo(     0, -NOSE );
  }

  TargetSymbol.prototype.highlight = function () {
    this._draw(C.HIGHLIGHT);
    USE_CACHE && this.updateCache();
  };

  TargetSymbol.prototype.updateData = function (data) {
    this.rotation = data.heading();
  };

  return TargetSymbol;
});
