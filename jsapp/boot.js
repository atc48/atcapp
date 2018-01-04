atcapp.boot = function (canvasId, fixSearchId) {
  var $stage = $("#" + canvasId);
  var $fixSearch = $('#' + fixSearchId);
  
  var stage = new createjs.Stage(canvasId);
  var fpsManager = new atcapp.FpsManager(stage);

  var uiCommand = new atcapp.UICommand();
  var mapItemCommand = new atcapp.MapItemCommand();
  var toolTipCommand = new atcapp.ToolTipCommand();

  var keyObserver = new atcapp.KeyboardObserver( $(window) );
  var zoomObserver = new atcapp.ZoomObserver($stage);
  var layerDragObserver = new atcapp.LayerDragObserver();

  var flightDataProvider = new atcapp.FlightDataProvider();

  var stageSizeMan = new atcapp.StageSizeManager(stage);
  var stageSize = stageSizeMan.getStageSize();
  var stageMouse = new atcapp.StageMouse(stage);
  var flightLayerMan = new atcapp.FlightLayerManager();
  var mapLayerMan = new atcapp.MapLayerManager(stageSize, uiCommand, flightLayerMan, layerDragObserver);
  var layerMan = new atcapp.StageLayerManager(stage, stageSize, mapLayerMan);
  var mapStatus = mapLayerMan.getMapStatus();
  var mapUserInputCommandSender = new atcapp.MapUserInputCommandSender();
  var fixDistributor = new atcapp.FixDistributor();
  var fixMap = new atcapp.FixMap();
  var codeFinder = new atcapp.CodeFinder();
  var toolTip = new atcapp.ToolTip();
  var toolTipMan = new atcapp.ToolTipManager();

  var externalInit = new atcapp.ExternalInitializer($fixSearch);
  var mapItemHilighter = new atcapp.MapItemHilighter();
  // All the external classes must be initialized in ExternalInitializer.

  externalInit.init(codeFinder, mapItemCommand);
  fixDistributor.init( mapStatus );
  fixMap.init( fixDistributor.getFixMapObject() );

  mapLayerMan.navaidsLayer.init( fixDistributor, mapStatus );

  var mapDragPanelBtn = layerMan.toolLayer.instantPanel.getMapDragButtonDelegate();
  layerMan.toolLayer.setup( stageSizeMan.getStageSize() );
  layerDragObserver.setupUiBtn( mapDragPanelBtn );
  zoomObserver.setupUiBtn( mapDragPanelBtn );

  mapItemHilighter.init(mapItemCommand, fixMap, fixDistributor);

  mapStatus.on("change", function () {
    //__.log("change");
  });
  mapStatus.on("gridChanged", function (e) {
    //__.log(e.diff.get());
    //__.log(e.gridMap.getGrids().length);
  });

  atcapp.ExContainer.setHoverMessenger( atcapp.StatusBar.getInstance() );
  atcapp.ExContainer.setupToolTipMessenger( toolTipCommand );

  mapUserInputCommandSender.setup(uiCommand, zoomObserver, layerDragObserver);
  layerDragObserver.setup(
    mapLayerMan.getMapDraggableLayer(), keyObserver, mapDragPanelBtn);
  zoomObserver.setup(keyObserver);

  stageSize.on("resize", function () {
    //__.log("resize: " + stage.canvas.width + ", " + stage.canvas.height );
    //__.log("        " + stageSize.curWidth + ", " + stageSize.curHeight );
  });

  fpsManager.setup(stage, uiCommand);
  flightLayerMan.setup(flightDataProvider, mapStatus, layerDragObserver, stageSize);
  toolTipMan.setup(toolTip, toolTipCommand, layerMan.toolTipLayer,
		   stageSize, stageMouse);

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
