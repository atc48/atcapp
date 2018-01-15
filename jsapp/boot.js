atcapp.boot = function (canvasId, fixSearchId) {
  var $stage = $("#" + canvasId);
  var $fixSearch = $('#' + fixSearchId);

  /**
   * Initiate Instances
   */
  
  var stage = new createjs.Stage(canvasId);
  var fpsManager = new atcapp.FpsManager(stage);
  var canvasFocusObserver = new atcapp.CanvasFocusObserver(canvasId);

  var uiCommand = new atcapp.UICommand();
  var mapItemCommand = new atcapp.MapItemCommand();
  var toolTipCommand = new atcapp.ToolTipCommand();

  var keyObserver = new atcapp.KeyboardObserver();
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
  var mapRegionLocator = new atcapp.MapRegionLocator();
  var mapRegionLocatorCalculator = new atcapp.MapRegionLocatorCalculator();
  var mapRegionLocatorAnimator = new atcapp.MapRegionLocatorAnimator();
  var mapItemHilighter = new atcapp.MapItemHilighter();

  /**
   * External
   */
  // All the external classes must be initialized in ExternalInitializer.
  var externalInit = new atcapp.ExternalInitializer($stage, $fixSearch);

  /**
   * Prepare Common
   **/

  atcapp.Fix.prepareCommon(mapStatus);
  atcapp.ExContainer.setHoverMessenger( atcapp.StatusBar.getInstance() );
  atcapp.ExContainer.setupToolTipMessenger( toolTipCommand );

  /**
   * Init
   **/

  externalInit.init(codeFinder, mapItemCommand);
  fixDistributor.init( mapStatus );
  fixMap.init( fixDistributor.getFixMapObject() );
  keyObserver.init( canvasFocusObserver );

  mapLayerMan.navaidsLayer.init( fixDistributor, mapStatus );

  var mapDragPanelBtn = layerMan.toolLayer.instantPanel.getMapDragButtonDelegate();
  layerMan.toolLayer.setup( stageSizeMan.getStageSize() );
  layerDragObserver.setupUiBtn( mapDragPanelBtn );
  zoomObserver.setupUiBtn( mapDragPanelBtn );

  mapItemHilighter.init(mapItemCommand, fixMap, fixDistributor, mapRegionLocator);

  mapUserInputCommandSender.setup(uiCommand, zoomObserver, layerDragObserver);
  layerDragObserver.setup(
    mapLayerMan.getMapDraggableLayer(), keyObserver, mapDragPanelBtn);
  zoomObserver.setup(keyObserver);

  fpsManager.setup(stage, uiCommand);
  flightLayerMan.setup(flightDataProvider, mapStatus, layerDragObserver, stageSize);
  toolTipMan.setup(toolTip, toolTipCommand, layerMan.toolTipLayer,
		   stageSize, stageMouse);

  mapRegionLocator.init( mapRegionLocatorCalculator, mapRegionLocatorAnimator );
  mapRegionLocatorCalculator.init( mapStatus );
  mapRegionLocatorAnimator.init( uiCommand, mapStatus );
  
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
