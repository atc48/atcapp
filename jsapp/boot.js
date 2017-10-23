atcapp.boot = function (canvasId) {
  var $stage = $("#" + canvasId);
  var stage = new createjs.Stage(canvasId);

  var uiCommand = new atcapp.UICommand();
  var keyObserver = new atcapp.KeyboardObserver( $(window) );
  var zoomObser = new atcapp.ZoomObserver($stage, uiCommand, keyObserver);
  var dragObser = new atcapp.LayerDragObserver(uiCommand, keyObserver);
  
  var stageSizeMan = new atcapp.StageSizeManager(stage);
  var mapLayerMan = new atcapp.MapLayerManager(stageSizeMan, uiCommand);
  var layerMan = new atcapp.StageLayerManager(stage, stageSizeMan, mapLayerMan);

  dragObser.setup("mapDrag", stage);

  stageSizeMan.on("resize", function () {
    //__.log("resize: " + stage.canvas.width + ", " + stage.canvas.height );
    //__.log("        " + stageSizeMan.curWidth + ", " + stageSizeMan.curHeight );
  });
  
  // DEBUG
  var circle = new atcapp.Circle();
  circle.x = 100;
  circle.y = 100;
  stage.addChild(circle);
  // DEBUG

  stage.enableMouseOver();
  stage.update();

  createjs.Ticker.setFPS(25);
  createjs.Ticker.addEventListener("tick", function () {
    stage.update();
  });
}
