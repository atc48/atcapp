var atcapp = {};

var __ = {
  assert: function (flag, opt_message) {
    if (flag) { return; }
    if(window.console) {
      console.log('Assertion Failure');
      if(opt_message) {
	console.log('Message: ' + opt_message);
      }
      if(console.trace) {
	console.trace();
      }
      if(Error().stack) {
	console.log(Error().stack);
      }
    }
    debugger;
  },
  log: function (msg) {
    if (console && console.log) {
      console.log(msg);
    }
  }
};
