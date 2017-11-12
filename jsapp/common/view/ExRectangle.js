(function (pkg, fac) {
  pkg.ExRectangle = fac(_, __, createjs);
})(atcapp, function (_, __, createjs) {

  createjs.extend(ExRectangle, createjs.Rectangle);
  createjs.promote(ExRectangle, "super");

  function ExRectangle(rect) {
    rect = rect || {};
    this.super_constructor(rect.x, rect.y, rect.width, rect.height);
  }

  var p = ExRectangle.prototype;

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

  return ExRectangle;
  
});
