(function (pkg, fac) {
  pkg.MapRegionLocatorAnimator = fac(__);
})(atcapp, function (__) {

  function MapRegionLocatorAnimator() {
  }

  var p = MapRegionLocatorAnimator.prototype;

  p.init = function (uiCommand) {
    __.assert(uiCommand);

    this.uiCommand = uiCommand;
  };

  p.animateTo = function (destState) {
    // TODO:
  };

  return MapRegionLocatorAnimator;
});
