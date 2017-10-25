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
  }

  CoordinatedLayer.prototype.__updateScale = function (scale) {
    this.scaleX = this.scaleY = scale;
  };

  return CoordinatedLayer;
});
