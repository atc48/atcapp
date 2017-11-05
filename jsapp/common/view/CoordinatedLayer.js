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
    this.__childScale = 1.0 / this.scaleX;
  }

  CoordinatedLayer.prototype.__updateChildrenReciprocalScale = function(opt_mapScale) {
    var parentScale = opt_mapScale || this.scale;
    var i, numChildren = this.numChildren,
	childScale = 1.0 / parentScale,
	child;
    
    for (i = 0; i < numChildren; i++) {
      child = this.getChildAt(i);
      child.scaleX = child.scaleY = childScale;
    }
    this.__childScale = childScale;
  };


  return CoordinatedLayer;
});
