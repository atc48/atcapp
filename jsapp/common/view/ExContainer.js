(function (pkg, factory) {
  pkg.ExContainer = factory(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(ExContainer, createjs.Container);

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

  
  ExContainer.prototype.__mouseOver = function (e) {
    var self = e.currentTarget;

    var hoverMsg = self.override__hoverMsg(e);
    if (hoverMsg) {
      __hoverMsger.setMsg(hoverMsg, self.id);
    }

    var toolTipEvent = self.override__getToolTipEvent();
    if (toolTipEvent) {
      __toolTipMsger.show(toolTipEvent);
    }
  };

  ExContainer.prototype.__mouseOut = function (e) {
    var self = e.currentTarget;
    __hoverMsger.delMsg(self.id);
    __toolTipMsger.hide();
  }

  /**
   * Global Messenger
   */

  ExContainer.prototype.override__hoverMsg = function (e) {
    return null; // define at child class.
  };
  
  var __hoverMsger = { // messenger interface
    setMsg: _.noop,
    delMsg: _.noop
  };

  ExContainer.setHoverMessenger = function (hoverMsger) {
    __.assert(_.isObject(hoverMsger) &&
	      _.isFunction(hoverMsger.setMsg) && _.isFunction(hoverMsger.delMsg));
    __hoverMsger = hoverMsger;
  };

  /**
   * ToolTip
   */

  ExContainer.prototype.override__getToolTipEvent = function () {
    return null;
  };

  ExContainer.setupToolTipMessenger = function (toolTipCommand) {
    __.assert(toolTipCommand);
    __toolTipMsger = {
      show: function (e) {
	toolTipCommand.fire("show", e);
      },
      hide: function () {
	toolTipCommand.fire("hide");
      }
    };
  };

  var __toolTipMsger = {
    show: _.noop,
    hide: _.noop
  };

  return createjs.promote(ExContainer, "Container");
});
