(function (pkg, factory) {
  pkg.ToolTipManager = factory(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  var DEFAULT_DISTANCE = {top: 12, bottom: 12};

  function ToolTipManager() {
  };

  var p = ToolTipManager.prototype;

  p.setup = function (toolTip, toolTipCommand, layer, stageSize, stageMouse) {
    __.assert(toolTip && toolTipCommand && layer && stageSize && stageMouse);

    toolTipCommand.on("show", _.bind(this._show, this));
    toolTipCommand.on("hide", _.bind(this._hide, this));

    var self = this;
    toolTip.addEventListener("mouseout", _.bind(this._hide, this));

    this.toolTip = toolTip;
    this.layer   = layer;
    this.stageSize = stageSize;
    this.stageMouse = stageMouse;
    this._isShowing = false;
    this._calcPosition = this._calcPositionByFixed;
  };

  p._show = function (e) {
    __.assert(e.is_ToolTipEvent);
    if (this._isShowing) { this._hide(); }
    this._isShowing = true;

    var target = e.target;
    var content = __filterContent(e.content);

    this.toolTip.setContent(content.label, content.descr);

    var pos = this._calcPosition(
      target, _.extend(DEFAULT_DISTANCE, e.opt.distance || {}));
   
    this.toolTip.x = Math.round(pos.x);
    this.toolTip.y = Math.round(pos.y);

    this.layer.addChild( this.toolTip );
  }

  p._hide = function () {
    if (!this._isShowing) { return; }
    if (this.toolTip.isToolTipMouseOver) { return; }
    this._isShowing = false;

    this.layer.removeChild( this.toolTip );
  };

  p._calcPositionByFixed = function (target, distance) {
    var bounds = this.toolTip.getBounds();
    
    var pos = new _Pos(target);
    pos.x = - bounds.width / 2;
    pos.y = - bounds.height - distance.top;

    if (pos.global().y < 0) {
      pos.y = distance.bottom;
    }
    if (pos.global().x < 0) {
      pos.x = pos.x - 1 * pos.global().x + 2;
    }
    if (pos.global().x + bounds.width > this.stageSize.curWidth) {
      pos.x = pos.x - (pos.global().x + bounds.width - this.stageSize.curWidth + 2);
    }

    return pos.global();
  }

  function __filterContent(raw) {
    var ret = {};
    if (_.isString(raw)) {
      return {descr: raw};
    }
    if (_.isObject(raw)) {
      return raw;
    }
    __.assert("unknown tool tip content. raw=" + raw);
  }

  function _Pos(target) {
    this.global = function () {
      return target.localToGlobal(this.x, this.y);
    };
  }

  return ToolTipManager;
});
