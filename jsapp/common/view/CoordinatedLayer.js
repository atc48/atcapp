(function (pkg, fac) {
  pkg.CoordinatedLayer = fac(createjs);
})(atcapp, function(createjs) {

  createjs.extend(CoordinatedLayer, createjs.Container);
  createjs.promote(CoordinatedLayer, "Container");

  /**
   * REMEMBER CHILD CLASS SHOULD CALL CONSTRUCTOR.
   *   this.CoordinatedLayer_constructor();
   */  
  function CoordinatedLayer() {
    this.Container_constructor();
  }

  return CoordinatedLayer;
});
