(function (pkg, fac) {
  pkg.CoordinatedLayer = fac(createjs, pkg);
})(atcapp, function(createjs, app) {

  createjs.extend(CoordinatedLayer, createjs.Container);
  createjs.promote(CoordinatedLayer, "Container");

  /**
   * REMEMBER CHILD CLASS SHOULD CALL CONSTRUCTOR.
   *   this.CoordinatedLayer_constructor();
   */  
  function CoordinatedLayer(opt) {
    opt = opt || {};
    this.Container_constructor();
    if (!opt.no_bent_scale) {
      this.__updateScale(1.0);
    }
  }

  CoordinatedLayer.prototype.__updateScale = function (scale) {
    this.scaleX = this.scaleY = scale;
    this.scaleY *= app.Coord.Y_RATIO;
  };

  return CoordinatedLayer;
});
