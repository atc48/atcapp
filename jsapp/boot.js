atcapp.boot = function (canvasId) {
  var $stage = $("#" + canvasId);
  var stage = new createjs.Stage(canvasId);
  var fpsManager = new atcapp.FpsManager(stage);

  var uiCommand = new atcapp.UICommand();
  var keyObserver = new atcapp.KeyboardObserver( $(window) );
  var zoomObserver = new atcapp.ZoomObserver($stage);
  var layerDragObserver = new atcapp.LayerDragObserver();

  var flightDataProvider = new atcapp.FlightDataProvider();

  var stageSizeMan = new atcapp.StageSizeManager(stage);
  var stageSize = stageSizeMan.getStageSize();
  var flightLayerMan = new atcapp.FlightLayerManager(flightDataProvider);
  var mapLayerMan = new atcapp.MapLayerManager(stageSize, uiCommand, flightLayerMan);
  var layerMan = new atcapp.StageLayerManager(stage, stageSize, mapLayerMan);

  atcapp.ExContainer.setHoverMessenger( atcapp.StatusBar.getInstance() );

  var mapUserInputCommandSender = new atcapp.MapUserInputCommandSender(
    uiCommand,
    keyObserver,
    zoomObserver,
    layerDragObserver
  ).init(stage);

  stageSize.on("resize", function () {
    //__.log("resize: " + stage.canvas.width + ", " + stage.canvas.height );
    //__.log("        " + stageSize.curWidth + ", " + stageSize.curHeight );
  });

  fpsManager.setup(stage, uiCommand);
  
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

  return {
    flightDataProvider: flightDataProvider
  };
}
