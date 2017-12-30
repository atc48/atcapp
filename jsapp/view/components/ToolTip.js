(function (pkg, fac) {
  pkg.ToolTip = fac(createjs, pkg);
})(atcapp, function (createjs, app) {

  createjs.extend(ToolTip, app.ExContainer);


  function ToolTip() {
    this.ExContainer_constructor();

    var content = new app.ToolTipContent();
    var mask, frame, back, label, descr;
    var self = this;

    var showAnimeQ = app.AnimateQueue.newMaker({
      onStart: function () {
	content.clear();
	content.init(self._labelText, self._descrText);
	content.animate_0();
      }
    }).enq(function () {
      return content.animate_1();
    }).enq(function () {
      return content.animate_2();
    }).enq(function () {
      return content.animate_3();
    }).make();
      
    this.addChild( content );
    this.showAnimeQ = showAnimeQ;

    // DEBUG CODE
    this.x = this.y = 200;
    setInterval(function () {
      self.setContent("ADNAP", "FIX\n11111N99999E");
    }, 3000);
  }

  var p = ToolTip.prototype;

  p.setContent = function (label, descr) {
    this._labelText = label;
    this._descrText = descr;

    this.showAnimeQ.start();
  };

  return createjs.promote(ToolTip, "ExContainer");
});
