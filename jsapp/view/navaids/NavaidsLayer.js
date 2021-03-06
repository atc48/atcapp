(function (pkg, fac) {
  pkg.NavaidsLayer = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  createjs.extend(NavaidsLayer, app.CoordinatedLayer);
  createjs.promote(NavaidsLayer, "CoordinatedLayer");

  function NavaidsLayer() {
    this.CoordinatedLayer_constructor();

    this.addChild( this.routeLayer = new app.CoordinatedLayer() );
    this.addChild( this.fixLayer   = new app.CoordinatedLayer() );
  }

  NavaidsLayer.prototype.init = function (fixDistributor, mapStatus) {
    var self = this;
    var fixLayer = this.fixLayer;
    this.fixDistributor = fixDistributor;
    fixDistributor.addHandler(onFixesChangeStart, onFixesChangeEach, onFixesChangeEnd);

    function onFixesChangeStart() {
      fixLayer.removeAllChildren();
    }
    function onFixesChangeEach(fix) {
      fixLayer.addChild( fix );
    }
    function onFixesChangeEnd(fixes) {
      //console.log(fixes.length);
    }
  };

  NavaidsLayer.prototype.onMapScaleChange = function (scale) {
    var fixVisibleMode = app.Fix.getDefaultVisibleModeByScale(scale);
    this.fixLayer.__updateChildrenReciprocalScale(scale, forEachFix);

    function forEachFix(fix) {
      fix.changeVisibleMode( fixVisibleMode );
    }
  };

  return NavaidsLayer;
});
