(function (pkg, fac) {
  pkg.ToolLayer = fac(_, createjs, pkg);
})(atcapp, function(_, createjs, app) {

  createjs.extend(ToolLayer, app.CoordinatedLayer);
  createjs.promote(ToolLayer, "CoordinatedLayer");


  function ToolLayer() {
    this.CoordinatedLayer_constructor();

    this.statusBarView = new app.StatusBarView();
    this.instantPanel = new atcapp.InstantPanel();

    this.addChild( this.statusBarView );
    this.addChild( this.instantPanel );
  }

  ToolLayer.prototype.setup = function (stageSize, statusBar) {
    this.stageSize = stageSize;

    var self = this;
    statusBar.on(function (e) {
      self.statusBarView.update( e.msg );
    });

    this.instantPanel.setup( stageSize );

    stageSize.on("resize", _.bind(this.onStageResize, this));
    this.onStageResize();
  };

  ToolLayer.prototype.onStageResize = function () {
    this.statusBarView.x = this.statusBarView.getMargin();
    this.statusBarView.y = this.stageSize.curHeight - this.statusBarView.getHeight();
  };

  return ToolLayer;
});
