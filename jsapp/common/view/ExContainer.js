(function (pkg, factory) {
  pkg.ExContainer = factory(_, createjs);
})(atcapp, function (_, createjs) {

  createjs.extend(ExContainer, createjs.Container);
  createjs.promote(ExContainer, "Container");

  var __idInc = 0;

  function ExContainer(opt) {
    this.Container_constructor();
    opt = opt || {};
    if (opt["hover"]) {
      this.addEventListener("mouseover", _.bind(this.__mouseOver, this));
      this.addEventListener("mouseout",  _.bind(this.__mouseOut, this));
      this.cursor = "pointer";
    }
    this.id = opt["id"] || ("ExContainer_id_" + __idInc++);
  }

  ExContainer.prototype.hoverMsg = function (e) {
    return null; // define at child class.
  };
  ExContainer.prototype.popupMsg = function (e) {
    return null;
  };
  
  var __hoverMsger = { // messenger interface
    putHoverMsg: function (msg, id) { console && console.log && console.log(msg); },
    delHoverMsg: function (id)      { console && console.log && console.log("no-msg") }
  };
  ExContainer.setHoverMessenger = function (hoverMsger) {
    __hoverMsger = hoverMsger;
  };

  ExContainer.prototype.__mouseOver = function (e) {
    __hoverMsger.putHoverMsg(this.hoverMsg(e), this.id);
    // TODO: implement popup
  }
  ExContainer.prototype.__mouseOut = function (e) {
    __hoverMsger.delHoverMsg(this.hoverMsg(e), this.id);
    // TODO: implement popup
  }
  
  return ExContainer;
});
