(function (pkg, fac) {
  pkg.MapRegionLocator = fac(_, atcapp);
})(atcapp, function (_, app) {

  function MapRegionLocator() {
  }

  var p = MapRegionLocator.prototype;

  p.init = function (calculator, animator) {
    __.assert(calculator && animator);

    this.calculator = calculator;
    this.animator   = animator;
  };

  p.locate = function (canposObjects) {
    __.assert(_.isArray(canposObjects));
    if (canposObjects.length <= 0) {
      return;
    }

    var canposes = _.map(canposObjects, _.bind(this._objToCanpos, this));
    var destState = this.calculator.calculate(canposes);
    this.animator.animateTo( destState );
  };

  p._objToCanpos = function (obj) {
    if (_.isFunction(obj.getCanpos)) {
      return obj.getCanpos();
    }
    if (_.isNumber(obj.x) && _.isNumber(obj.y)) {
      return new app.Canpos(obj.x, obj.y);
    }
    __.assert(false, "unknown obj=" + obj);
  };

  return MapRegionLocator;
});
