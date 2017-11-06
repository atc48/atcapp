(function (pkg, factory) {
  pkg.Deferer = factory(window);
})(atcapp, function (window) {

  var DEFAULT_DELAY = 100;

  function Deferer(fn, opt_delay, opt_maxDelay) {
    this.fn = _.bind(function () {
      this.timerId = null;
      this.waitStartedTime = null;
      fn();
    }, this);
    this.delay = opt_delay || DEFAULT_DELAY;
    this.maxDelay = opt_maxDelay || 999999;
  }

  Deferer.prototype.on = function () {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
      if (__unixTime() - this.waitStartedTime > this.maxDelay) {
	this.fn();
	return;
      }
    } else {
      this.waitStartedTime = __unixTime();
    }
    this.timerId = setTimeout(this.fn, this.delay);
  };

  function __unixTime() {
    return new Date().getTime();
  }

  return Deferer;
});
