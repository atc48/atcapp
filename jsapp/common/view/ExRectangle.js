(function (pkg, fac) {
  pkg.ExRectangle = fac(_, __, createjs, atcapp);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(ExRectangle, createjs.Rectangle);

  function ExRectangle(rect) {
    __.assert(!rect || _.isObject(rect));
    rect = rect || {};
    this.Rectangle_constructor(rect.x, rect.y, rect.width, rect.height);
  }

  var p = ExRectangle.prototype;

  p.assert = function () {
    __.assert(_.isNumber(this.x) && _.isNumber(this.y) &&
	      _.isNumber(this.width) && _.isNumber(this.height) &&
	      !_.isNaN(this.x && this.y && this.width && this.height) &&
	      this.width >= 0 && this.height >= 0,
	      this);
    return this;
  };

  p.getCenter = function () {
    return new createjs.Point(
      this.x + this.width  / 2.0,
      this.y + this.height / 2.0
    );
  };

  p.contactPointFrom = function (p) {
    var center = this.getCenter();
    return center;
  };

  p.getLeftTopCanpos = function () {
    return new app.Canpos(this.x, this.y);
  };

  p.getRightBtmCanpos = function () {
    return new app.Canpos(this.x + this.width, this.y + this.height);
  };

  ExRectangle.regionByCanposes = function (canposes, opt_margin) {
    __.assert(_.isArray(canposes) && canposes.length > 0);
    var margin = opt_margin || 0;
    var left, right, top, bottom;
    left = top     = Number.MAX_VALUE;
    right = bottom = -left;

    _.each(canposes, function (c) {
      __.assert(_.isNumber(c.x) && _.isNumber(c.y));
      left   = Math.min(c.x, left);
      top    = Math.min(c.y, top );
      right  = Math.max(c.x, right);
      bottom = Math.max(c.y, bottom);
    });

    var rect = new ExRectangle({
      x: left - margin,
      y: top  - margin,
      width : right  - left + margin * 2,
      height: bottom - top  + margin * 2
    });

    __.assert(rect.width >= 0 && rect.height >= 0);

    return rect;
  };


  function __test() {
    testWith(20,30, 40,50, 10, 10,20,40,40);
    testWith(40,50, 20,30, 10, 10,20,40,40);
    testWith(40,50, 20,30, undefined, 20,30,20,20);
    __.log("ExRectangle.__test: ok!");

    function testWith(ax, ay, bx, by, m, x, y, w, h) {
      var rect = ExRectangle.regionByCanposes(
	[new app.Canpos(ax,ay), new app.Canpos(bx,by)], m );
      __.assert(rect.x == x && rect.y == y &&
		rect.width == w && rect.height == h);
      __.assert(rect.getLeftTopCanpos().x == x && rect.getLeftTopCanpos().y == y &&
		rect.getRightBtmCanpos().x == x + w && rect.getRightBtmCanpos().y == y + h);
    }
  }
  //_.delay(__test, 0);

  return createjs.promote(ExRectangle, "Rectangle");
  
});
