(function (pkg, fac) {
  pkg.CanvasFocusObserver = fac(_, __, $, atcapp);
})(atcapp, function (_, __, $, app) {

  function CanvasFocusObserver(canvasId) {
    __.assert(_.isString(canvasId));
    this.dispatcher = new app.Dispatcher();
    this._isFocusOn = false;

    var self = this;
    var canvasSel = "#" + canvasId;
    $(function () {
      var $window = $(window);
      $window.blur(function () {
	self._onOff({trigger: "window.blur"});
      });
      $window.click(function (e) {
	var $target = $(e.target);
	var isCanvasClicked = $target.is(canvasSel) || !!$target.parents(canvasSel)[0];
	if (isCanvasClicked) {
	  self._onOn({trigger: $target});
	} else {
	  self._onOff({trigger: $target});
	}
      });
    });
  };

  var p = CanvasFocusObserver.prototype;

  p.change = function (fn) {
    this.on(fn);
    this.off(fn);
    return this;
  };

  p.on = function (fn) {
    this.dispatcher.on("on", fn);
    return this;
  }

  p.off = function (fn) {
    this.dispatcher.on("off", fn);
    return this;
  };

  p._onOff = function (opt) {
    this._onChg(false, opt);
  };

  p._onOn = function (opt) {
    this._onChg(true, opt);
  };

  p._onChg = function (isOn, opt) {
    if (this._isFocusOn == isOn) { return; }
    opt = opt || {}
    this._isFocusOn = isOn;
    this.dispatcher.fire( isOn ? "on" : "off" , _.extend(opt, {isFocus: isOn}));
  }

  return CanvasFocusObserver;
});
