(function (pkg, fac) {
  pkg.MapRegionLocatorAnimator = fac(_, __, atcapp);
})(atcapp, function (_, __, app) {

  function MapRegionLocatorAnimator() {
  }

  var POS_INCR_DIVIDE = 4;
  var SCALE_INCR_DIVIDE = 2;

  var p = MapRegionLocatorAnimator.prototype;

  p.init = function (uiCommand, mapStatus) {
    __.assert(uiCommand && mapStatus);

    this.uiCommand = uiCommand;
    this.mapStatus = mapStatus;
    this.animateQueue = app.AnimateQueue.newMaker().
      enq(_.bind(this._onTickUntil, this)).make();

    // stop animation if interrupted
    this.uiCommand.on("mapMove", _.bind(this._onInterrupted, this));
    this.uiCommand.on("zoom",    _.bind(this._onInterrupted, this));
  };

  p.animateTo = function (destState) {
    this.destState = destState;
    this.animateQueue.start();
  };

  p._onTickUntil = function () {
    if (!this.destState) { // interruption occured!
      return false;
    }

    var curScale  = this.mapStatus.getScale();
    var dstScale = this.destState.getScale();
    var nextScale = curScale + (dstScale - curScale) / SCALE_INCR_DIVIDE;

    var curCenter = this.mapStatus.getCanposRectangle().getCenter();
    var dstCenter = this.destState.getCenterCanpos();
    var nextCenter = new app.Canpos(
      curCenter.x + (dstCenter.x - curCenter.x) / POS_INCR_DIVIDE,
      curCenter.y + (dstCenter.y - curCenter.y) / POS_INCR_DIVIDE
    );

    var continueConds = [
      Math.abs(dstScale - nextScale)       > 2,
      Math.abs(dstCenter.x - nextCenter.x) > 1,
      Math.abs(dstCenter.y - nextCenter.y) > 1
    ];
    // All false then Stop Loop
    
    var isContinue = _.find(continueConds, function(b) { return !!b; });

    var event = isContinue && {
      canpos: nextCenter,
      scale : nextScale
    } || {
      canpos: dstCenter,
      scale : dstScale
    };

    this.firing = true;
    this.uiCommand.fire("mapFix", event);
    this.firing = false;

    return isContinue;
  };

  p._onInterrupted = function () {
    if (!this.destState) { return; }
    if (this.firing) { return; }
    this.destState = null;
  };

  return MapRegionLocatorAnimator;
});
