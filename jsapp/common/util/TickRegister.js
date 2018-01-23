(function (pkg, fac) {
  pkg.TickRegister = fac(_, __, createjs);
})(atcapp, function (_, __, createjs) {

  function TickRegister(fn, thisArg) {
    __.assert(_.isFunction(fn) && _.isObject(thisArg));

    this.listener = _.bind(fn, thisArg);
    this.isRunning = false;
  }

  var p = TickRegister.prototype;

  p.start = function () {
    if (this.isRunning) { return; }
    this.isRunning = true;
    createjs.Ticker.addEventListener("tick", this.listener);
    return this;
  };

  p.stop = function () {
    if (!this.isRunning) { return; }
    this.isRunning = false;
    createjs.Ticker.removeEventListener("tick", this.listener);
    return this;
  };

  p.isRunning = function () {
    return this.isRunning;
  };

  return TickRegister;
  
});
