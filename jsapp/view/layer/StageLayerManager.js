(function (pkg, fac){
  pkg.StageLayerManager = fac(createjs, pkg);
})(atcapp, function(createjs, app) {

  function StageLayerManager(stage, mapLayerMan) {

    this.mapLayer = mapLayerMan.container;

    stage.addChild(this.mapLayer);
  }

  return StageLayerManager;
});
