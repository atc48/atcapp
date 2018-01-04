(function (pkg, fac) {
  pkg.ToolTipCommand = fac($, __, atcapp);
})(atcapp, function ($, __, app) {

  createjs.extend(ToolTipCommand, app.Dispatcher);

  var TYPES = ["show", "hide"];
  
  function ToolTipCommand() {
    this.Dispatcher_constructor({types: TYPES});
    this._curInfo = null;
  }

  var p = ToolTipCommand.prototype;

  p.fire = function (type, e) {
    if (type == "show") {
      this._fireShow(e);
    } else if (type == "hide") {
      this._fireHide(e);
    } else {
      __.assert(false);
    }
  };

  p._fireShow = function (e) {
    __.assert(e.is_ToolTipEvent);
    
    if (this._curInfo && this._curInfo.isEquals(e)) {
      return;
    }
    if (this._curInfo) {
      this._fireHide();
    }
    this._curInfo = new _EventInfo(e);
    this.Dispatcher_fire("show", e);
  };

  p._fireHide = function () {
    if (!this._curInfo) {
      return;
    }
    this._curInfo = null;
    this.Dispatcher_fire("hide");
  };

  function _EventInfo(e) {
    __.assert(e.target && e.content);
    this.e = e;
  }
  _EventInfo.prototype.isEquals = function (e) {
    return this.e.target == e.target && this.e.content == e.content;
  }

  return createjs.promote(ToolTipCommand, "Dispatcher");
});
