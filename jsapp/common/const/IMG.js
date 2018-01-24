(function (pkg, fac) {
  pkg.IMG = fac(_);
})(atcapp, function (_) {

  var ROOT_DIR = "/atcapp/img/";

  var IMG_MAP = _.mapObject({
    TRIANGLE: "triangle.png",
    MAP_DRAG_BTN: "icons8-drag-filled-80.png",
    PARTICLE: "particle_base.png"
  }, function (path) {
    return ROOT_DIR + path;
  });

  var IMG = _.clone(IMG_MAP);

  function __eachIdSrc(fn) {
    _.each(IMG_MAP, function(val, key) {
      if (!_.isString(val)) { return; }
      fn(key, val);
    });
  }

  IMG.getPreloadManifest = function () {
    var assets = [];
    __eachIdSrc(function(id, src) {
      assets.push( {id: id, src: src} );
    });
    return assets;
  };

  __eachIdSrc(function (id, src) {
    IMG[id + "_"] = function () {
      return src;
    };
  });

  return IMG;
});
