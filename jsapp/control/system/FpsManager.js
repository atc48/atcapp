(function (pkg, fac) {
  pkg.FpsManager = fac(createjs, _, __, pkg);
})(atcapp, function (createjs, _, __, app) {

  var ACTIVE_FPS   =  25;
  var DEACTIVE_FPS =  1;
  var STAGE_UPDATE_MINIMUM_INTERVAL = 1000 / ACTIVE_FPS;

  var DEACTIVATE_DELAY = 1000;
  var Ticker = createjs.Ticker;

  var __log = function(msg) { __.log(msg); };

  function FpsManager(stage) {
    this.stage = stage;
    Ticker.framerate = DEACTIVE_FPS;
    Ticker.addEventListener("tick", _.bind(onTick, this));
    this.deactDeferer = new app.Deferer(_.bind(deactivate, this), DEACTIVATE_DELAY);

    function onTick() {
      this.update();
    }
    function deactivate() {
      Ticker.framerate = DEACTIVE_FPS;
      //__log("FpsMan: FPS=" + Ticker.getTicks());
    }
  }

  FpsManager.prototype.setup = function (stage, uiCommand) {
    __.assert(!this._hasSetup); this._hasSetup = true;
    var activateFn = _.bind(this.activate, this);
    var updateFn   = _.bind(this.update, this);

    _.each(["mapMove", "zoom"], function (type) {
      uiCommand.on(type, activateFn);
    });
    _.each(["mousedown", "mouseover", "pressmove", "pressup"], function (type) {
      stage.addEventListener(type, updateFn);
    });
  };

  FpsManager.prototype.activate = function () {
    Ticker.framerate = ACTIVE_FPS;
    //__log("FpsMan: FPS=" + Ticker.getFPS());
    this.update();
    this.deactDeferer.on();
    
    return this;
  };

  var __justUpdated = false;
  function __disableJustUpdatedFlag() {
    __justUpdated = false;
  }

  FpsManager.prototype.update = function () {
    if (__justUpdated) {
      //__log("FpsManager: update skipped.");
      return;
    }
    __justUpdated =true;
    
    this.stage.update();
    
    _.delay(__disableJustUpdatedFlag, STAGE_UPDATE_MINIMUM_INTERVAL);
    //__log("FpsMan: stage.update()");
  };

  return FpsManager;

});
