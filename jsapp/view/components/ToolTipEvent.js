(function (pkg, fac) {
  pkg.ToolTipEvent = fac(_, __);
})(atcapp, function (_, __) {

  function ToolTipEvent(target, content) {
    this.is_ToolTipEvent = true;
    __.assert(target && content);

    this.target = target;
    this.content = content;
    this.opt = {};
  };

  var p = ToolTipEvent.prototype;

  p.setOpt = function (key, val) {
    __.assert(_.isString(key));
    this.opt[key] = val;
    return this;
  };

  ToolTipEvent.createWithText = function (target, label, descr) {
    var content = new _TextContent(label, descr);
    return new ToolTipEvent(target, content);
  };

  function _TextContent(label, descr) {
    __.assert(label || descr);
    this.label = label;
    this.descr = descr;
  }

  return ToolTipEvent;
});
