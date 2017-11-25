(function (pkg, fac) {
  pkg.FlightLayer = fac(_, __, createjs, pkg);
})(atcapp, function(_, __, createjs, app) {

  createjs.extend(FlightLayer, app.CoordinatedLayer);
  createjs.promote(FlightLayer, "CoordinatedLayer");

  var LINE = app.COLOR.SECTOR;
  
  function FlightLayer() {
    this.CoordinatedLayer_constructor();
    this.compositeOperation = "lighter"
  }

  return FlightLayer;
});
