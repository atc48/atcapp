(function (pkg, fac) {
  pkg.Debugger = fac(__);
})(atcapp, function (__) {

  var __$area = $("<div />");
  var __timeZero = Date.now();

  function Debugger() {}

  Debugger.init = function ($textarea) {
    __$area = $textarea[0] && $textarea || __$area;
    Debugger.clear();
    Debugger.hasInit = true;
    return Debugger;
  };

  Debugger.log = function (msg) {
    if (!Debugger.hasInit) { return; }

    var text = __$area.val() + (__$area.val() && "\n" || "") + __mkNewLine(msg);

    __$area.val( text );

    __$area.animate({scrollTop: __$area[0].scrollHeight}, 'fast');

    return Debugger;
  };

  Debugger.clear = function () {
    __$area.val("");
  };

  function __mkNewLine(msg) {
    var prefix = "[" + __mkTimeElapsedExp() + "] ";
    return prefix + msg;
  }

  function __getElapsedSecs() {
    return Date.now() - __timeZero;
  }

  function __mkTimeElapsedExp() {
    var elapsedMsec = __getElapsedSecs();
    var msec = Math.round((elapsedMsec % 1) * 100);

    var elapsed = Math.floor(elapsedMsec / 1000);
    var secs = elapsed % 60;
    var mins = (elapsed - secs) / 60;

    return mins + ":" + two(secs) + "." + two(msec);

    function two(n) {
      if (n < 10) { return "0" + n; }
      return n;
    }
  }

  return Debugger;
});
