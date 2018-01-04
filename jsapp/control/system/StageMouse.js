(function (pkg, fac) {
  pkg.StageMouse = fac();
})(atcapp, function () {

  function StageMouse(stage) {
    this.stage = stage;
  };

  StageMouse.prototype.getGlobal = function () {
    return {
      x: this.stage.mouseX,
      y: this.stage.mouseY
    };
  };

  return StageMouse;

});
