(function (pkg, fac) {
  pkg.BrowserDepends = fac();
})(atcapp, function () {

  function BrowserDepends() {
  }

  BrowserDepends.MOUSE_WHEEL_EVENT = (function () {
    if ('onwheel' in document) { return 'wheel'; }
    if ('onmousewheel' in document) { return 'mousewheel'; }
    return 'DOMMouseScroll';
  })();

  return BrowserDepends;

});
