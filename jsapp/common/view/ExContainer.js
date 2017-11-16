(function (pkg, factory) {
  pkg.ExContainer = factory(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(ExContainer, createjs.Container);
  createjs.promote(ExContainer, "Container");

  var __idInc = 0;

  function ExContainer(opt) {
    this.Container_constructor();
    opt = opt || {};
    if (opt["hover"]) {
      this.addEventListener("mouseover", this.__mouseOver);
      this.addEventListener("mouseout",  this.__mouseOut);
      this.cursor = "pointer";
    }
    if (opt["drag"]) {
      this._dragger = new app.ViewDragger(this);
    }
    this.id = opt["id"] || ("ExContainer_id_" + __idInc++);
  }

  ExContainer.prototype.override__hoverMsg = function (e) {
    return null; // define at child class.
  };
  ExContainer.prototype.override__popupMsg = function (e) {
    return null;
  };
  
  var __hoverMsger = { // messenger interface
    setMsg: function (msg, id) { console && console.log && console.log(msg); },
    delMsg: function (id)      { console && console.log && console.log("no-msg") }
  };
  ExContainer.setHoverMessenger = function (hoverMsger) {
    __.assert(_.isObject(hoverMsger) &&
	      _.isFunction(hoverMsger.setMsg) && _.isFunction(hoverMsger.delMsg));
    __hoverMsger = hoverMsger;
  };

  ExContainer.prototype.__mouseOver = function (e) {
    var self = e.currentTarget;
    var msg = self.override__hoverMsg(e);
    if (!msg) { return; }
    __hoverMsger.setMsg(msg, self.id);
    // TODO: implement popup
  }
  ExContainer.prototype.__mouseOut = function (e) {
    var self = e.currentTarget;
    __hoverMsger.delMsg(self.id);
    // TODO: implement popup
  }
  
  return ExContainer;
});
