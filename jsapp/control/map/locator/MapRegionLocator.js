(function (pkg, fac) {
  pkg.MapRegionLocator = fac(atcapp);
})(atcapp, function (app) {

  function MapRegionLocator() {
  }

  var p = MapRegionLocator.prototype;

  p.init = function (calculator, animator) {
    __.assert(calculator && animator);

    this.calculator = calculator;
    this.animator   = animator;
  };

  p.locate = function (canposList) {
    __.assert(_.isArray(canposList));

    var destState = this.calculator.calculate(canposList);
    this.animator.animateTo( destState );
  };

  return MapRegionLocator;
});
