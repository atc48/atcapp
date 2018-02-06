(function (pkg, fac) {
  pkg.TouchDeviceDragObserver = fac(_, __, createjs, atcapp);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(TouchDeviceDragObserver, app.Dispatcher);

  function TouchDeviceDragObserver($stage, $window) {
    this.Dispatcher_constructor({types: ["drag"]});

    if ("ontouchstart" in window) {
      $stage.on("touchstart",  _.bind(this._touchStart, this));
      $stage.on("touchmove",   _.bind(this._touchMove,  this));
      $window.on("touchend",     _.bind(this._touchEnd,   this));
      $window.on("touchcancel",  _.bind(this._touchEnd,   this));
    }
    if ("ongesturestart" in window) {
      $window.on("gesturestart", _.bind(this._touchEnd,   this));
    }
  }

  var p = TouchDeviceDragObserver.prototype;

  p._touchStart = function (jQEvt) {
    var touch = __topTouch(jQEvt);
    if (!touch) { return; }

    this.curTouch = touch;
  };

  p._touchMove = function (jQEvt) {
    if (!this.curTouch) { return; }
    var touch = __findSameTouch(jQEvt, this.curTouch);
    if (!touch) {
      this.curTouch = null;
      return;
    }
    var isMultiTouch = jQEvt.originalEvent.touches.length > 1;
    var offset = __makeTouchDiff(this.curTouch, touch);
    var event  = __makeDragEvent("drag", jQEvt, offset, isMultiTouch);
    this.curTouch = touch;

    this.fire("drag", event);
  };

  p._touchEnd = function (e) {
    this.curTouch = null;
  };

  function __topTouch(jQEvt) {
    return jQEvt && jQEvt.originalEvent &&
      jQEvt.originalEvent.touches &&
      jQEvt.originalEvent.touches[0] ||
      null;
  }

  function __findSameTouch(jQEvt, touch) {
    return _.find( jQEvt.originalEvent.touches, function (eachTouch) {
      return eachTouch.identifier == touch.identifier;
    });
  }

  function __makeDragEvent(evtName, jQEvt, offset, isMultiTouch) {
    return {
      type: evtName,
      moveX: offset.x,
      moveY: offset.y,
      offset: offset,
      isMultiTouch: isMultiTouch,
      isSingleTouch: !isMultiTouch,
      preventDefault: function () {
	jQEvt.preventDefault();
      }
    };
  }

  function __makeTouchDiff(from, to) {
    return {
      x: to.clientX - from.clientX,
      y: to.clientY - from.clientY
    };
  };

  return createjs.promote(TouchDeviceDragObserver, "Dispatcher");
});
