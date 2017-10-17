(function (pkg, factory) {
  pkg.Deferer = factory(window);
})(atcapp, function (window) {

  var DEFAULT_DELAY = 100;

  function Deferer(fn, opt_delay, opt_maxDelay) {
    this.fn = fn;
    this.delay = opt_delay || DEFAULT_DELAY;
    this.timerId = undefined;
    // TODO: opt_maxDelay
  }

  Deferer.prototype.on = function () {
    window.clearTimeout(this.timerId);
    this.timerId = setTimeout(this.fn, this.delay);
  }

  return Deferer;
});
