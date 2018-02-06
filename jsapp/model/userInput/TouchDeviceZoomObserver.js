(function (pkg, fac) {
  pkg.TouchDeviceZoomObserver = fac(_, __, createjs, atcapp);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(TouchDeviceZoomObserver, app.Dispatcher);

  var IS_DEBUG = false; // change event types for no-gesture local debug

  var EVENT = {
    start:  "gesturestart",
    change: "gesturechange",
    end:    "gestureend"
  };

  function TouchDeviceZoomObserver($stage, $window) {
    this.Dispatcher_constructor({types: ["zoom"]});

    if ( ("on" + EVENT.start) in window) {
      $stage.on(EVENT.start,  _.bind(this._gestureStart,  this));
      $stage.on(EVENT.change, _.bind(this._gestureChange, this));
      $window.on(EVENT.end,   _.bind(this._gestureEnd,    this));
    }
  }

  var p = TouchDeviceZoomObserver.prototype;

  p._gestureStart = function (jqEvt) {
    this.curScale = __evtToScale(jqEvt);
  };

  p._gestureChange = function (jqEvt) {
    if (!this.curScale) { return; }
    var scale = __evtToScale(jqEvt);
    if (!scale) { this.curScale = null; return; }

    var scaleMult = scale / this.curScale;
    var event = __makeEvent("zoom", jqEvt, scaleMult);

    this.curScale = scale;
    this.fire("zoom", event);
  };

  p._gestureEnd = function (jqEvt) {
    this.curScale = null;
  };

  function __evtToScale(jqEvt) {
    return jqEvt.originalEvent.scale || null;
  };

  function __makeEvent(evtName, jqEvt, scaleMult) {
    return {
      type: evtName,
      scaleMult: scaleMult,
      preventDefault: function () {
	jqEvt.preventDefault();
      }
    }
  };

  if (IS_DEBUG) {
    // convert "gesture*" event to "touch*" for local debug
    EVENT = _.each(EVENT, function (val, key) {
      EVENT[key] = val.replace("gesture", "touch").replace("change", "move");
    });
    __evtToScale = function (jqEvt) {
      return jqEvt.originalEvent.touches[0].clientY;
    };

    __.log("TouchDeviceZoomObserver: debug-mode: replaced gesture trigger to touch events" );
  }

  return createjs.promote(TouchDeviceZoomObserver, "Dispatcher");
});
