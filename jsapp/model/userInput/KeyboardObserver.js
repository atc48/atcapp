(function (pkg, fac) {
  pkg.KeyboardObserver = fac($, __, pkg);
})(atcapp, function ($, __, app) {

  createjs.extend(KeyboardObserver, app.Dispatcher);
  createjs.promote(KeyboardObserver, "Dispatcher");
  
  function KeyboardObserver($window) {
    this.Dispatcher_constructor();

    __.assert($window && $window[0]);
    var self = this;
    this.isMetaKeyDown = false;
    $window.keydown(function (e) {
      if (__IS_META_KEY(e)) {
	self.isMetaKeyDown = true;
	self.fire("onMetaKey");
      }
    });
    $window.keyup(function () {
      self.isMetaKeyDown = false;
      self.fire("offMetaKey");
    });
    this.getIsMetaKeyDown = function () {
      return self.isMetaKeyDown;
    }
  }

  function __IS_META_KEY(e) {
    return e.ctrlKey || e.metaKey || e.altKey;
  }

  return KeyboardObserver;
});
