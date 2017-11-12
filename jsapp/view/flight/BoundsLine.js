(function (pkg, fac) {
  pkg.BoundsLine = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(BoundsLine, createjs.Shape);
  createjs.promote(BoundsLine, "super");

  var LINE_COLOR = app.COLOR.DATA_BLOCK.LINE_COLOR;
  var ALPHA = 0.5;;

  function BoundsLine() {
    this.super_constructor();
    this.alpha = ALPHA;
  }

  BoundsLine.prototype.update = function (bounds) {
    this.graphics.clear();
    if (!bounds) { return; }
    bounds = new app.ExRectangle(bounds);
    var center = bounds.getCenter();

    this.graphics
      .beginStroke(LINE_COLOR)
      .moveTo(0,0)
      .lineTo(center.x, center.y);
  };

  return BoundsLine;
});

