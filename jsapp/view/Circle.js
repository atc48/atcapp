(function (pkg, factory) {
  pkg.Circle = factory(createjs, pkg);
})(atcapp, function(createjs, app) {

  createjs.extend(Circle, app.ExContainer);
  createjs.promote(Circle, "ExContainer");

  var DEFAULT_COLOR = app.COLOR.NORMAL;
  var DEFAULT_SIZE = 4;

  function Circle(opt) {
    this.ExContainer_constructor({hover: 1});
    opt = opt || {};

    var color = opt["color"] || DEFAULT_COLOR;
    var size  = opt["size"] || DEFAULT_SIZE;
    var pos = size / 2;

    var shape = new createjs.Shape();
    shape.graphics.beginFill(color).drawCircle(pos, pos, size);
    this.addChild(shape);

    this.color = color;
    this.size  = size;
  }

  Circle.prototype.hoverMsg = function (e) {
    return "I am Circle. (x,y)=" + this.mouseX +
      ", color=" + this.color + ", size=" + this.size;
  };
  
  return Circle;
});
