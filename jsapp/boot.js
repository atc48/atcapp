atcapp.boot = function (canvasId) {
  var stage = new createjs.Stage(canvasId);

  var mapLayerMan = new atcapp.MapLayerManager();
  var layerMan = new atcapp.StageLayerManager(stage, mapLayerMan);
  var stageMan = new atcapp.StageSizeManager(stage);

  stageMan.on("resize", function () {
    __.log("resize");
  });
  
  // DEBUG
  var circle = new atcapp.Circle();
  circle.x = 100;
  circle.y = 100;
  stage.addChild(circle);
  // DEBUG

  stage.enableMouseOver();
  stage.update();
}
