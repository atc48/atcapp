(function (pkg, fac) {
  pkg.MapRegionLocatorCalculator = fac(__, atcapp);
})(atcapp, function (__, app) {

  function MapRegionLocatorCalculator() {
  }

  var p = MapRegionLocatorCalculator.prototype;

  p.init = function (mapStatus) {
    __.assert(mapStatus);

    this.mapStatus = mapStatus;
  };

  p.calculate = function () {
    // TODO:
    return new app.MapRegionLocatorDestState();
  };

  return MapRegionLocatorCalculator;
});
