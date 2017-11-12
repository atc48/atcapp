(function (pkg, factory) {
  pkg.StageSizeManager = factory(window, _, $, createjs, pkg);
})(atcapp, function (window, _, $, createjs, app) {

  createjs.extend(StageSizeManager, app.Dispatcher);
  createjs.promote(StageSizeManager, "super");
  
  function StageSizeManager(stage) {
    this.super_constructor();

    var $window = $(window);
    var self = this;
    this.stageSize = new _StageSize().update(
      stage.canvas.width,
      stage.canvas.height
    );

    var deferer = new app.Deferer(onResize);
    $window.on('resize', _.bind(deferer.on, deferer));
    $window.trigger('resize');

    onResize();

    this.getStageSize = function () {
      return this.stageSize;
    };

    function onResize() {
      self.stageSize.update(
	stage.canvas.width  = $window.width(),
	stage.canvas.height = $window.height()
      );
      stage.update();
    }
  }

  createjs.extend(_StageSize, app.Dispatcher);
  createjs.promote(_StageSize, "super");

  function _StageSize() {
    this.super_constructor();
    this.update = function (w, h) {
      this.curWidth  = w;
      this.curHeight = h;
      this.fire("resize", {type: "StageSize.resize",
			   width: this.curWidth, height: this.curHeight});
      return this;
    }
  }

  return StageSizeManager;
});;
