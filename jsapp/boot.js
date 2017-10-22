atcapp.boot = function (canvasId) {
  var $stage = $("#" + canvasId);
  var stage = new createjs.Stage(canvasId);

  var uiCommand = new atcapp.UICommand();
  
  var stageSizeMan = new atcapp.StageSizeManager(stage);
  var mapLayerMan = new atcapp.MapLayerManager(stageSizeMan, uiCommand);
  var layerMan = new atcapp.StageLayerManager(stage, mapLayerMan);

  stageSizeMan.on("resize", function () {
    __.log("resize");
  });
  
  // DEBUG
  var circle = new atcapp.Circle();
  circle.x = 100;
  circle.y = 100;
  stage.addChild(circle);
  // DEBUG

  var zoomObser = new atcapp.ZoomObserver($stage, uiCommand);

  stage.enableMouseOver();
  stage.update();

  createjs.Ticker.setFPS(25);
  createjs.Ticker.addEventListener("tick", function () {
    stage.update();
  });
}
