(function (pkg, fac) {
  pkg.AnimateQueue = fac(_, __, createjs);
})(atcapp, function (_, __, createjs) {

  function AnimateQueue(processes, opt) {
    __.assert(_.isArray(processes) && processes.length > 0);
    this._processes = processes;
    this._curIdx = 0;
    this._tickerListener = null;

    opt = opt || {};
    _.each(["onStart", "onEachTick"], function (optKey) {
      opt[optKey] = opt[optKey] || _.noop;
      __.assert(_.isFunction(opt[optKey]));
    });
    this.opt = opt;
  }

  AnimateQueue.prototype.start = function () {
    this.reset();

    this.opt.onStart();

    this._tickerListener = _.bind(this._onTick, this)
    createjs.Ticker.addEventListener("tick", this._tickerListener);

    return this;
  };

  AnimateQueue.prototype.reset = function () {
    if (!this._isRunning()) { return; }

    createjs.Ticker.removeEventListener("tick", this._tickerListener);
    this._tickerListener = null;

    this._curIdx = 0;

    return this;
  };

  AnimateQueue.prototype._onTick = function (e) {
    this.opt.onEachTick();

    var process = this._processes[ this._curIdx ];
    var continueLoop = process() || false;

    if (!continueLoop) {
      this._curIdx += 1;
      if (this._curIdx >= this._processes.length) {
	this.reset();
      }
    }
  }

  AnimateQueue.prototype._isRunning = function () {
    return !!this._tickerListener;
  };

  AnimateQueue.newMaker = function (opt) {
    return new _Maker(opt);
  };

  function _Maker (opt) {
    this.opt = opt;
    this._processes = [];
  }

  _Maker.prototype.enq = _Maker.prototype.enqueue = function (fn) {
    __.assert(_.isFunction(fn));
    this._processes.push( fn );
    return this;
  };
  
  _Maker.prototype.make = function () {
    return new AnimateQueue(this._processes, this.opt);
  }

  return AnimateQueue;
});
