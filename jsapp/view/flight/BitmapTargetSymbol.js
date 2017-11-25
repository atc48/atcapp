(function (pkg, fac) {
  pkg.BitmapTargetSymbol = fac(createjs, pkg);
})(atcapp, function (createjs, app) {

  createjs.extend(BitmapTargetSymbol, createjs.Container);
  createjs.promote(BitmapTargetSymbol, "super");

  var USE_CACHE = false;
  var C = app.COLOR.SIMBOL;
  var SIZE = 80;
  var SCALE = 0.25;
  var WING = SIZE * SCALE / 2;
  var NOSE = WING;

  function BitmapTargetSymbol() {
    this.super_constructor();
    this.addChild( this.bitmap = new createjs.Bitmap("/atcapp/img/icons8-airport-80.png") );

    USE_CACHE && this.cache(-WING, -NOSE, WING * 2, NOSE * 2);
    this.bitmap.scaleX = this.bitmap.scaleY = SCALE;
    this.bitmap.x = this.bitmap.y = - SIZE * this.bitmap.scaleX / 2.0;
    this.alpha = 0.7;
  }

  BitmapTargetSymbol.prototype.highlight = function () {
    USE_CACHE && this.updateCache();
  };

  BitmapTargetSymbol.prototype.updateData = function (data) {
    this.rotation = data.heading();
  };

  return BitmapTargetSymbol;
});
