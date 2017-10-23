(function (pkg, fac){
  pkg.StageLayerManager = fac(createjs, pkg);
})(atcapp, function(createjs, app) {

  function StageLayerManager(stage, stageSizeMan, mapLayerMan) {

    this.bgLayer  = new createjs.Container();
    this.mapLayer = mapLayerMan.container;

    stage.addChild(this.bgLayer);
    stage.addChild(this.mapLayer);

    stageSizeMan.on("resize", _.bind(onStageSizeChange, this));

    function onStageSizeChange(e) {
      this.bgLayer.removeChildAt(0);
      this.bgLayer.addChild( __createBackground(stageSizeMan) );
    }
  }

  function __createBackground(stageSizeMan) {
    var shape = new createjs.Shape();
    shape.graphics
      .beginFill(app.COLOR.BACKGROUND)
      .drawRect(0, 0, stageSizeMan.curWidth, stageSizeMan.curHeight);
    return shape;
  }

  return StageLayerManager;
});
