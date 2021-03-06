atcapp.boot = function (canvasId, fixSearchId, debuggerId, opt_appOptRaw) {

  atcapp.Debugger.init( $('#' + debuggerId) ).log("getting into the app...");

  var stage = new createjs.Stage(canvasId);
  var stageSizeMan = new atcapp.StageSizeManager(stage);
  var appOpt = new atcapp.AppOption(opt_appOptRaw);
  var urlConfig = new atcapp.UrlConfig(appOpt);

  _.delay(function () {
    __.debug("assets preloading...");
    atcapp.IMG.setup( urlConfig.getAssetsDirPath() );
    atcapp.Assets.getInstance().preload(
      onPreloadFinish,
      appOpt.assetsPathToBase64Map().getOrNull()
    );
  }, 0);

  function onPreloadFinish() {
    __.debug("assets preload finished.");
    gotoBoot();
  }

  function gotoBoot() {
    atcapp._boot(canvasId, fixSearchId, stage, stageSizeMan, appOpt, urlConfig);
    atcapp._boot = null;
  }
};

atcapp._boot = function (canvasId, fixSearchId, stage, stageSizeMan, appOpt, urlConfig) {
  __.debug("booting...");

  var $stage = $("#" + canvasId);
  var $fixSearch = $('#' + fixSearchId);
  var $window = $(window);

  /**
   * Initiate Instances
   */

  var browserConfig = new atcapp.BrowserConfig();

  var fpsManager = new atcapp.FpsManager(stage);
  var canvasFocusObserver = new atcapp.CanvasFocusObserver(canvasId);

  var uiCommand = new atcapp.UICommand();
  var mapItemCommand = new atcapp.MapItemCommand();
  var toolTipCommand = new atcapp.ToolTipCommand();

  var keyObserver = new atcapp.KeyboardObserver();
  var zoomObserver = new atcapp.ZoomObserver($stage);
  var layerDragObserver = new atcapp.LayerDragObserver();
  var touchDragObserver = new atcapp.TouchDeviceDragObserver($stage, $window);
  var touchZoomObserver = new atcapp.TouchDeviceZoomObserver($stage, $window);

  touchDragObserver.on("drag", function (e) {
    //e.preventDefault();
    //__.log(e);
  });
  touchZoomObserver.on("zoom", function (e) {
    //e.preventDefault();
    //__.log(e);
  });

  var flightDataProvider = new atcapp.FlightDataProvider();

  var statusBar = atcapp.StatusBar.getInstance();
  var stageSize = stageSizeMan.getStageSize();
  var stageMouse = new atcapp.StageMouse(stage);
  var flightLayerMan = new atcapp.FlightLayerManager();
  var flightViewCoordinator = new atcapp.FlightViewCoordinator();
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

  var flightsApi = new atcapp.FlightsApi();

  /**
   * External
   */
  // All the external classes must be initialized in ExternalInitializer.
  var externalInit = new atcapp.ExternalInitializer($stage, $fixSearch);

  /**
   * Prepare Common
   **/

  atcapp.Fix.prepareCommon(mapStatus);
  atcapp.ExContainer.setHoverMessenger( statusBar );
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
  layerMan.toolLayer.setup( stageSize, statusBar );

  mapItemHilighter.init(mapItemCommand, fixMap, fixDistributor, mapRegionLocator);

  mapUserInputCommandSender.setup(uiCommand, zoomObserver, layerDragObserver);
  layerDragObserver.setup(
    mapLayerMan.getMapDraggableLayer(), keyObserver, mapDragPanelBtn, touchDragObserver);
  zoomObserver.setup(keyObserver, mapDragPanelBtn, browserConfig.getScrollDeltaFilter(), browserConfig.getMouseWheelEventName(), touchZoomObserver);

  fpsManager.setup(stage, uiCommand);
  flightLayerMan.setup(flightDataProvider, mapStatus, layerDragObserver, flightViewCoordinator);
  flightViewCoordinator.setup(mapStatus, stageSize);
  toolTipMan.setup(toolTip, toolTipCommand, layerMan.toolTipLayer,
		   stageSize, stageMouse);

  mapRegionLocator.init( mapRegionLocatorCalculator, mapRegionLocatorAnimator );
  mapRegionLocatorCalculator.init( mapStatus );
  mapRegionLocatorAnimator.init( uiCommand, mapStatus );

  flightsApi.init(urlConfig);
  
  /**
   * Initial Setting
   */
  var mapFix = new atcapp.MapFixCommandSender(uiCommand);
  mapFix.scaleMinBounds(20, 18).centerCoordination(137.5, 37.5).fix();

  stage.enableMouseOver();
  stage.update();

  __.debug("boot finished, welcome to the ATC48.");

  /**
   * Start Delayed Processes
   */
  __.debug("flights loding...");
  flightsApi.load(function (data) {
    __.debug("flights load succeeded.");
    flightDataProvider.update(data);
    __.debug("flights update finished.");
  }, function (errorReason) {
    __.debug("flights load failed: reason=" + errorReason);
  });

  return {
    // add some objects as an external interface if need.
  };
};
