(function (pkg, fac){
  pkg.StageLayerManager = fac(createjs, pkg);
})(atcapp, function(createjs, app) {

  function StageLayerManager(stage, stageSize, mapLayerMan) {

    stage.addChild( this.bgLayer  = new createjs.Container() );
    stage.addChild( this.mapLayer = mapLayerMan.container );
    stage.addChild( this.toolLayer = new app.ToolLayer() );

    stageSize.on("resize", _.bind(onStageSizeChange, this));

    function onStageSizeChange(e) {
      this.bgLayer.removeChildAt(0);
      this.bgLayer.addChild( __createBackground(stageSize) );
    }
  }

  function __createBackground(stageSize) {
    var shape = new createjs.Shape();
    shape.graphics
      .beginFill(app.COLOR.BACKGROUND)
      .drawRect(0, 0, stageSize.curWidth, stageSize.curHeight);
    return shape;
  }

  return StageLayerManager;
});
