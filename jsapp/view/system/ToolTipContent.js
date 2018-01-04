(function (pkg, fac) {
  pkg.ToolTipContent = fac(createjs, pkg);
})(atcapp, function (createjs, app) {

  createjs.extend(ToolTipContent, createjs.Container);

  var PADDING = {
    left: 6, right: 7,
    top : 4, bottom: 6,
    descrMargin: 2
  };
  var FRAME_THICK = 1.0;
  var FRAME_COLOR = "#ffffff"  
  var BACK_COLOR = "#333";
  var BACK_ALPHA = 0.6;

  function ToolTipContent() {
    this.Container_constructor();
  }

  var p = ToolTipContent.prototype;

  p.init = function (labelText, descrText) {
    __.assert(labelText || descrText);

    var label = this._makeLabel(labelText);
    var descr = this._makeDescription(descrText, label);
    var bounds = this._getFrameBounds(label, descr);
    var mask  = this._makeMask(bounds);
    var frame = this._makeFrame(bounds);
    var back  = this._makeFrameBack(bounds);

    this.mask = mask;
    this.addChild( back, frame, label, descr );

    this.label = label;
    this.descr = descr;
    this._mask = mask;
    this.back  = back;
    this.bounds = bounds;
  };

  p._makeMask = function (bounds) {
    var mask = new createjs.Shape();
    mask.graphics
      .beginFill("#ff0000")
      .drawRect(-4, -4, bounds.width + 8, bounds.height + 8);
    return mask;
  };

  p._makeFrame = function (bounds) {
    var frame = new createjs.Shape();
    frame.graphics
      .setStrokeStyle(FRAME_THICK)
      .beginStroke(FRAME_COLOR)
      .drawRect(0, 0, bounds.width, bounds.height);
    return frame;
  };

  p._makeFrameBack = function (bounds) {
    var back = new createjs.Shape();
    back.graphics
      .setStrokeStyle(0.5)
      .beginFill(BACK_COLOR)
      .drawRect(0, 0, bounds.width, bounds.height);
    back.alpha = BACK_ALPHA;
    return back
  };  

  p._makeLabel = function (labelText) {
    if (!labelText) {
      return this._makeNoneShape();
    }
    return this._makeTextWith(labelText, {x:0, y:0}, 1);
  };

  p._makeDescription = function (descrText, label) {
    if (!descrText) {
      return this._makeNoneShape();
    }
    var labelBounds = label.getBounds();
    var yOffset = labelBounds.y + labelBounds.height + PADDING.descrMargin;
    return this._makeTextWith(descrText, {x:0, y: yOffset});
  };

  p._makeTextWith = function (text, offset, isLabel) {
    var font = isLabel ?
	app.COLOR.TOOLTIP.FONT_LABEL :
	app.COLOR.TOOLTIP.FONT_DESCR;
    var color = app.COLOR.FONT_COLOR;
    var label = new createjs.Text(text, font, color);
    label.x = PADDING.left + offset.x;
    label.y = PADDING.top  + offset.y;
    return label;
  };

  p._getFrameBounds = function (label, descr) {
    if (descr.isNone) {
      var labelBounds = label.getBounds();
      return new createjs.Rectangle(
	0, 0,
	label.x + labelBounds.width  + PADDING.right,
	label.y + labelBounds.height + PADDING.bottom
      );
    }
    var descrBounds = descr.getBounds();    
    return new createjs.Rectangle(
      0, 0,
      descr.x + descrBounds.width  + PADDING.right,
      descr.y + descrBounds.height + PADDING.bottom
    );
  };

  p._makeNoneShape = function () {
    var shape = new createjs.Shape();
    shape.isNone = true;
    shape.getBounds = function () {
      return new createjs.Rectangle(0,0,0,0);
    };
    return shape;
  };

  /**
   * animae_X
   */

  p.animate_0 = function () {
    this._mask.scaleX = this._mask.scaleY = 0;
    this.label.visible = this.descr.visible = false;
  }

  p.animate_1 = function () {
    var mask = this._mask;
    mask.scaleX += (1.0 - mask.scaleX) / 1.2;
    mask.scaleY = mask.scaleX;
    return mask.scaleY < 1.0 - 0.1;
  };

  p.animate_2 = function () {
    this._mask.scaleX = this._mask.scaleY = 1.0;
    this.back.visible = true;
    this.label.visible = this.descr.visible = true;    
    return 0;
  };

  p.animate_3 = function () {
    return 0;
  }

  p.clear = function () {
    this.removeAllChildren();
  };

  p.getBounds = function () {
    __.assert(this.bounds, "haven't started yet");
    return this.bounds;
  };
  
  return createjs.promote(ToolTipContent, "Container");
});
