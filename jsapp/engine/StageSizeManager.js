(function (pkg, factory) {
  pkg.StageSizeManager = factory(window, _, $, createjs, pkg);
})(atcapp, function (window, _, $, createjs, app) {

  createjs.extend(StageSizeManager, app.Dispatcher);
  createjs.promote(StageSizeManager, "super");
  
  function StageSizeManager(stage) {
    this.super_constructor();

    var $window = $(window);
    var self = this;
    this.curWidth  = stage.canvas.width;
    this.curHeight = stage.canvas.height;

    var deferer = new app.Deferer(onResize);
    $window.on('resize', _.bind(deferer.on, deferer));
    $window.trigger('resize');

    // TODO: dispatch size change.
    onResize();

    function onResize() {
      this.curWidth  = stage.canvas.width  = $window.width();
      this.curHeight = stage.canvas.height = $window.height();
      stage.update();
      self.fire("resize");
    }
  }

  return StageSizeManager;
});;
