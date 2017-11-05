(function (pkg, factory) {
  pkg.ExContainer = factory(_, __, createjs);
})(atcapp, function (_, __, createjs) {

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
    var msg = this.override__hoverMsg(e);
    if (!msg) { return; }
    __hoverMsger.setMsg(msg, this.id);
    // TODO: implement popup
  }
  ExContainer.prototype.__mouseOut = function (e) {
    __hoverMsger.delMsg(this.id);
    // TODO: implement popup
  }
  
  return ExContainer;
});
