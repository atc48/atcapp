(function (pkg, fac) {
  pkg.KeyboardObserver = fac($, __);
})(atcapp, function ($, __) {
  
  function KeyboardObserver($window) {
    __.assert($window && $window[0]);
    var self = this;
    this.isMetaKeyDown = false;
    $window.keydown(function (e) {
      if (__IS_META_KEY(e)) {
	self.isMetaKeyDown = true;
      }
    });
    $window.keyup(function () {
      self.isMetaKeyDown = false;
    });
  }

  function __IS_META_KEY(e) {
    return e.ctrlKey || e.metaKey || e.altKey;
  }

  return KeyboardObserver;
});
