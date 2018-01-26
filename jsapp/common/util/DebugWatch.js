(function (pkg, fac) {
  pkg.DebugWatch = fac(_, __);
})(atcapp, function (_, __) {

  function DebugWatch(opt) {
    this.opt = opt || {};
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

  p.getMsg = function () {
    return "[" + this.opt.prefix + "] " + this.elapsed();
  };

  p.showDebug = function () {
    var msg = this.getMsg();
    __.debug(msg);
    return msg;
  };


  DebugWatch.Multi = (function () {

    var DEFAULT_NUM = 10;

    function _Multi(prefix, opt_num) {
      prefix = (prefix || "") + "_";
      var num = opt_num || DEFAULT_NUM;
      __.assert(_.isString(prefix) && _.isNumber(num));
      this.watches = init(num, {prefix:prefix}, this);
    }

    function init(num, opt, self) {
      var i = 0, watches = [];
      for (i=1; i<=num; i++) {
	watches.push( initWatch(i, opt, self) );
      }
      return watches;
    }

    function initWatch(n, opt, self) {
      var opt = _.clone(opt);
      opt.prefix = (opt.prefix || "") + n;
      var watch = new DebugWatch(opt);
      _.each(_.functions(DebugWatch.prototype), function (fnName) {
	self[fnName + n] = _.bind(watch[fnName], watch);
      });
      return watch;
    }

    _Multi.prototype.showDebug = function () {
      var res = "";
      _.each(this.watches, function (watch) {
	if (watch._timeStacked > 0) {
	  res += watch.showDebug() + "\n";
	}
      });
      return res;
    };

    return _Multi;
  })();


  return DebugWatch;
});
  
