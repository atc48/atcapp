(function (pkg, fac) {
  pkg.BrowserConfig = fac(_, __, createjs, atcapp);
})(atcapp, function (_, __, createjs, app) {

  function BrowserConfig() {
    var ua = new _UA();
    this.ua = ua;
    this.isTouchDevice = window.ontouchstart !== undefined;
  }

  var p = BrowserConfig.prototype;

  p.getScrollDeltaFilter = function () {
    return this.ua.isMac &&
      function (delta) { return -delta; } ||
      function (delta) { return  delta; };
  };

  p.getMouseWheelEventName = function () {
    if ('onwheel' in document) { return 'wheel'; }
    if ('onmousewheel' in document) { return 'mousewheel'; }
    return 'DOMMouseScroll';
  }

  function _UA() {
    var raw = window.navigator.userAgent.toLowerCase();

    this.toString = function () { return raw; }
    this.isMac = (function () {
      return _is('mac') && _is('os') && _not('iphone') && _not('ipad');
    })();
    function  _is(key) { return raw.indexOf(key) >= 0; }
    function _not(key) { return !_is(key); }
  }
  
  return BrowserConfig;
});
