(function (pkg, factory) {
  pkg.StageSizeManager = factory(window, _, $, createjs, pkg);
})(atcapp, function (window, _, $, createjs, app) {

  createjs.extend(StageSizeManager, app.Dispatcher);
  createjs.promote(StageSizeManager, "super");
  
  function StageSizeManager(stage) {
    this.super_constructor();
    
    var $window = $(window);
    var self = this;

    var deferer = new app.Deferer(onResize);
    $window.on('resize', _.bind(deferer.on, deferer));
    $window.trigger('resize');

    // TODO: dispatch size change.
    onResize();

    function onResize() {
      stage.canvas.width = $window.width();
      stage.canvas.height = $window.height();
      stage.update();
      self.fire("resize");
    }
  }

  return StageSizeManager;
});;
