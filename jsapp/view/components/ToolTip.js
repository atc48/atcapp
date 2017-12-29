(function (pkg, fac) {
  pkg.ToolTip = fac(createjs, pkg);
})(atcapp, function (createjs, app) {

  createjs.extend(ToolTip, app.ExContainer);

  var PADDING = {
    left: 6, right: 7,
    top : 4, bottom: 6
  };
  var FRAME_THICK = 1.0;
  var FRAME_COLOR = "#ffffff"  
  var BACK_COLOR = "#333";
  var BACK_ALPHA = 0.6;

  function ToolTip() {
    this.ExContainer_constructor();

    var wrapper = new createjs.Container();
    var mask, frame, back, label;
    var self = this;

    var showAnimeQ = app.AnimateQueue.newMaker({
      onStart: function () {
	wrapper.removeAllChildren();

	label = self._makeLabel();
	var bounds = self._getFrameBounds(label);
	mask  = self._makeMask(bounds);
	frame = self._makeFrame(bounds);
	back  = self._makeFrameBack(bounds);

	mask.scaleX = mask.scaleY = 0;
	label.visible = false;
	
	wrapper.mask = mask;
	wrapper.addChild( back, frame, label );	
      }
    }).enq(function () {
      mask.scaleX += (1.0 - mask.scaleX) / 1.2;
      mask.scaleY = mask.scaleX;
      return mask.scaleY < 1.0 - 0.1;
    }).enq(function () {
      mask.scaleX = mask.scaleY = 1.0;
      back.visible = true;
    }).enq(function () {
      label.visible = true;
      return true;
    }).make();

      
    // DEBUG CODE
    setInterval(function () {
      showAnimeQ.start();
    }, 3000);
    this.x = this.y = 200;

    this.addChild( wrapper );
  }

  ToolTip.prototype._makeMask = function (bounds) {
    var mask = new createjs.Shape();
    mask.graphics
      .beginFill("#ff0000")
      .drawRect(-4, -4, bounds.width + 8, bounds.height + 8);
    return mask;
  };

  ToolTip.prototype._makeFrame = function (bounds) {
    var frame = new createjs.Shape();
    frame.graphics
      .setStrokeStyle(FRAME_THICK)
      .beginStroke(FRAME_COLOR)
      .drawRect(0, 0, bounds.width, bounds.height);
    return frame;
  };

  ToolTip.prototype._makeFrameBack = function (bounds) {
    var back = new createjs.Shape();
    back.graphics
      .setStrokeStyle(0.5)
      .beginFill(BACK_COLOR)
      .drawRect(0, 0, bounds.width, bounds.height);
    back.alpha = BACK_ALPHA;
    return back
  };  

  ToolTip.prototype._makeLabel = function () {
    var font = app.COLOR.TEXT_FONT, color = app.COLOR.FONT_COLOR;
    var label = new createjs.Text("hello world", font, color);
    label.text = "HELLO WORLD\nARE YOU SURE";
    label.x = PADDING.left;
    label.y = PADDING.top;
    return label;
  };

  ToolTip.prototype._getFrameBounds = function (label) {
    var labelBounds = label.getBounds();
    return new createjs.Rectangle(
      0, 0,
      labelBounds.width  + PADDING.left + PADDING.right,
      labelBounds.height + PADDING.top  + PADDING.bottom
    );
  };
  
  return createjs.promote(ToolTip, "ExContainer");
});
