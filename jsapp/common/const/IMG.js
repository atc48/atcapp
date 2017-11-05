(function (pkg, fac) {
  pkg.IMG = fac(_);
})(atcapp, function (_) {

  var ROOT_DIR = "/atcapp/img/";

  var IMG = _.mapObject({
    TRIANGLE: "triangle.png",
    DOT     : "dot.png"
  }, dir);

  function dir(path) {
    return ROOT_DIR + path;
  }

  return IMG;
});
