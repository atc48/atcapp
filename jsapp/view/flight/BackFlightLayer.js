(function (pkg, fac) {
  pkg.BackFlightLayer = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  createjs.extend(BackFlightLayer, app.CoordinatedLayer);
  createjs.promote(BackFlightLayer, "CoordinatedLayer");

  function BackFlightLayer() {
    this.CoordinatedLayer_constructor();
  }

  return BackFlightLayer;
});
