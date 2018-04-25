(function (pkg, fac) {
  pkg.Assets = fac(_, __, createjs, atcapp);
})(atcapp, function (_, __, createjs, app) {

  var __instance = null;
  var __guard = {};

  function Assets(guard) {
    __.assert(guard === __guard);
  }

  Assets.getInstance = function () {
    if (!__instance) {
      __instance = new Assets(__guard);
    }
    return __instance;
  };

  Assets.getImage = function (id) {
    return Assets.getInstance().getImage(id);
  };

  var p = Assets.prototype;

  p.preload = function (onCompleteFn, opt_pathTo64Map) {
    if (opt_pathTo64Map) {
      this.loader = new _Base64Loader(opt_pathTo64Map);
    } else {
      this.loader = new _AssetsLoader();
    }
    
    this.loader.preload(onCompleteFn);
    return this;
  };

  p.getImage = function  (id) {
    var img = this.loader.getImage(id);
    __.assert(img, "invalid image id. id=" + id);
    return img;
  };

  function _AssetsLoader() {
  }

  var pLoader = _AssetsLoader.prototype;

  pLoader.preload = function (onCompleteFn) {
    var queue = new createjs.LoadQueue(true);
    var manifest = app.IMG.getPreloadManifest();

    queue.loadManifest(manifest);
    queue.addEventListener("complete", onCompleteAll);
    queue.addEventListener("fileload", onEachLoad);
    queue.load();

    var self = this;
    var imageMap = {};
    this.imageMap = imageMap;

    return this;

    function onEachLoad(event) {
      if (event.item.type == "image") {
	imageMap[ event.item.id ] = event.result;
	return;
      }
      __.assert(false, "unknown type");
    }

    function onCompleteAll(event) {
      queue.removeEventListener("complete", onCompleteAll);
      queue.removeEventListener("fileload", onEachLoad);
      self.hasPreloadCompleted = true;
      onCompleteFn();
    }
  };

  pLoader.getImage = function (id) {
    __.assert(this.hasPreloadCompleted, " preload has not completed");
    return this.imageMap[ id ];
  };

  function _Base64Loader(pathTo64Map) {
    __.assert(_.isObject(pathTo64Map));
    this.pathTo64Map = pathTo64Map;
  }

  var bLoader = _Base64Loader.prototype;

  bLoader.preload = function (onCompleteFn) {
    var pathTo64Map = this.pathTo64Map;
    var imageMap = {};
    app.IMG.forEachIdSrc(function (id, src) {
      var data64 = pathTo64Map[ src ];
      var imgObj = document.createElement("IMG");
      imgObj.setAttribute('src', data64);
      imageMap[ id ] = imgObj;
    });
    this.imageMap = imageMap;
    _.defer(onCompleteFn);
  };

  bLoader.getImage = function (id) {
    return this.imageMap[id];
  };

  return Assets;
});
