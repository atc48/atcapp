(function (pkg, fac) {
  pkg.DebugWatch = fac();
})(atcapp, function () {

  function DebugWatch() {
    this.reset();
  }

  var p = DebugWatch.prototype;

  p.start = p.restart = function () {
    if (this._isRunning) { return this; }
    this._isRunning = true;

    this._startedTime = Date.now();

    return this;
  };

  p.stop = function () {
    if (!this._isRunning) { return this; }
    this._isRunning = false;

    var elapsed = Date.now() - this._startedTime;

    this._timeStacked += elapsed;

    return this;
  };

  p.reset = function () {
    this._timeStacked = 0;
    this._isRunning = false;

    return this;
  };

  p.elapsed = p.elapsedTime = p.timeElapsed = function () {
    if (this._isRunning) {
      this.stop().start();
    }
    return this._timeStacked;
  };

  return DebugWatch;
});
  
