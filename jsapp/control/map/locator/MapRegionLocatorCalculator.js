(function (pkg, fac) {
  pkg.MapRegionLocatorCalculator = fac(__, atcapp);
})(atcapp, function (__, app) {

  var SCALE_BUFFER = 0.2;

  function MapRegionLocatorCalculator() {
  }

  var p = MapRegionLocatorCalculator.prototype;

  p.init = function (mapStatus) {
    __.assert(mapStatus);

    this.mapStatus = mapStatus;
  };

  p.calculate = function (canposes) {
    var regionRect = app.ExRectangle.regionByCanposes(canposes);
    var center = regionRect.getCenter();

    var stageRect = this.mapStatus.getCanposRectangle();

    var regionScaleRatio = Math.max(
      regionRect.width  / stageRect.width,
      regionRect.height / stageRect.height
    );

    regionScaleRatio *= 1.0 + SCALE_BUFFER;

    var needScale = regionScaleRatio > 1.0 ?
	this.mapStatus.getScale() / regionScaleRatio :
	this.mapStatus.getScale();

    return new app.MapRegionLocatorDestState(needScale, center);
  };

  return MapRegionLocatorCalculator;
});
