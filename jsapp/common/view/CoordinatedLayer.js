(function (pkg, fac) {
  pkg.CoordinatedLayer = fac(createjs, pkg);
})(atcapp, function(createjs, app) {

  createjs.extend(CoordinatedLayer, createjs.Container);
  createjs.promote(CoordinatedLayer, "Container");

  /**
   * REMEMBER CHILD CLASS SHOULD CALL CONSTRUCTOR.
   *   this.CoordinatedLayer_constructor();
   */  
  function CoordinatedLayer() {
    this.Container_constructor();
  }

  CoordinatedLayer.prototype.__updateScale = function (scale) {
    this.scaleX = this.scaleY = scale;
    this.scaleY *= app.Coord.Y_RATIO;
  };

  return CoordinatedLayer;
});
