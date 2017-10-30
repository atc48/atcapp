(function (pkg, fac){
  pkg.StageLayerManager = fac(createjs, pkg);
})(atcapp, function(createjs, app) {

  function StageLayerManager(stage, stageSizeMan, mapLayerMan) {

    this.bgLayer  = new createjs.Container();
    this.mapLayer = mapLayerMan.container;
    this.toolLayer = new app.ToolLayer();

    stage.addChild(this.bgLayer);
    stage.addChild(this.mapLayer);
    stage.addChild(this.toolLayer);

    stageSizeMan.on("resize", _.bind(onStageSizeChange, this));

    function onStageSizeChange(e) {
      this.bgLayer.removeChildAt(0);
      this.bgLayer.addChild( __createBackground(stageSizeMan) );
      this.toolLayer.onStageResize(e.width, e.height);
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
