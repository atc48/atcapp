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

  p.preload = function (onCompleteFn) {
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

  p.getImage = function (id) {
    __.assert(this.hasPreloadCompleted, " preload has not completed");
    var img = this.imageMap[ id ];
    __.assert(img, "invalid image id. id=" + id);
    return img;
  };

  return Assets;
});
