(function (pkg, fac){
  pkg.CanposGraphicsWrapper = fac(_, __, pkg);
})(atcapp, function (_, __, app) {

  function CanposGraphicsWrapper(graphics) {
    __.assert(_.isObject(graphics));
    this.g = graphics;
  }

  var CANPOS_CONV_METHODS = [
    "moveTo", "lineTo"
  ];
  var OTHER_METHODS = [
    "setStrokeStyle", "beginStroke", "endStroke", "setStrokeDash"
  ];
  
  _.each(CANPOS_CONV_METHODS, function (methodName) {
    CanposGraphicsWrapper.prototype[methodName] = function (e, n) {
      return this._doWithCanpos(e, n, function (g, x, y) {
	g[methodName](x, y);
      });
    };
  });
  CanposGraphicsWrapper.prototype._doWithCanpos = function (east, north, fn) {
    var canpos = new app.Canpos.canposByCoord(east, north);
    fn(this.g, canpos.x, canpos.y);
    return this;
  }

  _.each(OTHER_METHODS, function (methodName) {
    CanposGraphicsWrapper.prototype[methodName] = function () {
      this.g[methodName].apply(this.g, arguments);
    };
  });


  return CanposGraphicsWrapper;
})
