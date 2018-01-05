(function (pkg, fac) {
  pkg.MapRegionLocatorDestState = fac(atcapp);
})(atcapp, function (app) {

  function MapRegionLocatorDestState(scale, center) {
    __.assert(_.isNumber(scale) && _.isObject(center));

    this.scale = scale;
    this.center = center;
  }

  var p = MapRegionLocatorDestState.prototype;

  p.getScale = function () {
    return this.scale;
  };

  p.getCenterCanpos = function () {
    return this.center;
  };

  return MapRegionLocatorDestState;
});
