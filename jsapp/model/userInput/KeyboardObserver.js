(function (pkg, fac) {
  pkg.KeyboardObserver = fac($, _, __, pkg);
})(atcapp, function ($, _, __, app) {

  createjs.extend(KeyboardObserver, app.Dispatcher);
  createjs.promote(KeyboardObserver, "Dispatcher");
  
  function KeyboardObserver() {
    this.Dispatcher_constructor();
    this.isMetaKeyDown = false;
  }

  var p = KeyboardObserver.prototype;

  p.init = function (canvasFocusObserver) {
    var self = this;
    var offFn = _.bind(self._off, self);
    
    $(function () {
      var $window = $(window);
      $window.keydown(function (e) {
	if (__IS_META_KEY(e)) {
	  self._on();
	}
      });
      $window.keyup(offFn);
    });
    
    canvasFocusObserver.off(offFn);
  };

  p._on = function () {
    if (this.isMetaKeyDown) { return; }
    this.isMetaKeyDown = true;
    this.fire("onMetaKey");
  };

  p._off = function () {
    if (!this.isMetaKeyDown) { return; }
    this.isMetaKeyDown = false;
    this.fire("offMetaKey");
  };

  p.getIsMetaKeyDown = function () {
    return this.isMetaKeyDown;
  }
  

  function __IS_META_KEY(e) {
    return e.ctrlKey || e.metaKey;
  }

  return KeyboardObserver;
});
