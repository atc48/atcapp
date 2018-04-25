(function (pkg, fac) {
  pkg.IMG = fac(_);
})(atcapp, function (_) {

  var IMG = {
    TRIANGLE: "triangle.png",
    MAP_DRAG_BTN: "icons8-drag-filled-80.png",
    PARTICLE: "particle_base.png"
  };

  function __eachIdSrc(fn) {
    _.each(IMG, function(val, key) {
      if (!_.isString(val)) { return; }
      fn(key, val);
    });
  }

  var __hasSetup = false;

  IMG.setup = function (rootDir) {
    __.assert(!__hasSetup);
    __hasSetup = true;
    __.assert(_.isString(rootDir));
    __eachIdSrc(function(id, src) {
      IMG[id] = rootDir + src;
      IMG[id + "_"] = function () {
	return rootDir + src;
      };
    });
    return IMG;
  };

  IMG.getPreloadManifest = function () {
    __.assert(__hasSetup);
    var assets = [];
    __eachIdSrc(function(id, src) {
      assets.push( {id: id, src: src} );
    });
    return assets;
  };

  IMG.forEachIdSrc = function (fn) {
    __eachIdSrc(fn);
  };

  return IMG;
});
