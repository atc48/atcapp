(function (pkg, fac) {
  pkg.StatusBar = fac(createjs, _, __, pkg);
})(atcapp, function (createjs, _, __, app) {
  
  createjs.extend(StatusBar, app.Dispatcher);
  createjs.promote(StatusBar, "Dispatcher");

  var DEFAULT_MSG = "Welcome to ATC48"
  var __guard = Math.random();

  function StatusBar(guard) {
    __.assert(guard == __guard);
    this.Dispatcher_constructor();

    var self = this;
    var _id = null;

    _.delay(function () {
      self.setMsg( DEFAULT_MSG );
    });
    
    this.setMsg = function (msg, opt_id) {
      _id = opt_id || null;
      self.msg = msg;
      self.fire({msg: msg});
    };
    this.delMsg = function (id) {
      if (id && id == _id) {
	self.msg = null;
      }
      self.fire({msg: null});
    };
  }

  var __instance;
  StatusBar.getInstance = function () {
    if (!__instance) {
      __instance = new StatusBar(__guard);
    }
    return __instance;
  };
  
  return StatusBar;
});
