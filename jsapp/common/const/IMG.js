(function (pkg, fac) {
  pkg.IMG = fac(_);
})(atcapp, function (_) {

  var ROOT_DIR = "/atcapp/img/";

  var IMG = _.mapObject({
    TRIANGLE: "triangle.png",
    MAP_DRAG_BTN: "icons8-drag-filled-80.png",
    PARTICLE: "particle_base.png",
    DOT     : "dot.png"
  }, dir);

  function dir(path) {
    return ROOT_DIR + path;
  }

  _.each(_.keys(IMG), function (key) {
    IMG[key + "_"] = function () {
      return IMG[key];
    };
  });

  return IMG;
});
