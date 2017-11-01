atcapp.boot = function (canvasId) {
  var $stage = $("#" + canvasId);
  var stage = new createjs.Stage(canvasId);

  var uiCommand = new atcapp.UICommand();
  var keyObserver = new atcapp.KeyboardObserver( $(window) );
  
  var stageSizeMan = new atcapp.StageSizeManager(stage);
  var stageSize = stageSizeMan.getStageSize();
  var mapLayerMan = new atcapp.MapLayerManager(stageSize, uiCommand);
  var layerMan = new atcapp.StageLayerManager(stage, stageSize, mapLayerMan);

  var mapUserInputCommandSender = new atcapp.MapUserInputCommandSender(
    uiCommand,
    keyObserver,
    new atcapp.ZoomObserver($stage),
    new atcapp.LayerDragObserver()
  ).init(stage);

  stageSize.on("resize", function () {
    //__.log("resize: " + stage.canvas.width + ", " + stage.canvas.height );
    //__.log("        " + stageSize.curWidth + ", " + stageSize.curHeight );
  });
  
  // DEBUG
  var circle = new atcapp.Circle();
  circle.x = 100;
  circle.y = 100;
  stage.addChild(circle);
  // DEBUG

  /**
   * Initial Setting
   */
  var mapFix = new atcapp.MapFixCommandSender(uiCommand);
  mapFix.scaleMinBounds(20, 18).centerCoordination(137.5, 37.5).fix();
  
  stage.enableMouseOver();
  stage.update();

  createjs.Ticker.setFPS(25);
  createjs.Ticker.addEventListener("tick", function () {
    stage.update();
  });
}
