(function (pkg, factory) {
  pkg.Dispatcher = factory(__);
})(atcapp, function (__) {

  var NONAME_TYPE = "noNameType";
  
  var Dispatcher = function () {
    this.__listeners = new Array();
  };
  Dispatcher.prototype.addEventListener =
    Dispatcher.prototype.on =
    function(type, eventHandler) {
      if (typeof type === 'function') {
	type = NONAME_TYPE;
	eventHandler = type;
      }
      __.assert(typeof type === 'string' && typeof eventHandler === 'function');
      var listener = {
	type:         type,
	eventHandler: eventHandler
      };
      this.__listeners.push( listener );
    }
  
  /**
   * @args (type, event) or (event)
   */
  Dispatcher.prototype.dispatchEvent =
    Dispatcher.prototype.fire =
    function(type, opt_event) {
      var event = opt_event;
      if (typeof type === 'function') {
	event = type;
	type = NONAME_TYPE;
      }
      __.assert(typeof type === 'string');
      if (event === null && typeof type !== 'string') {
	event = type;
	type  = event.type;
      }
      for (var i = 0; i < this.__listeners.length; i++) {
	if (type == this.__listeners[i].type) {
	  this.__listeners[i].eventHandler(event);
	}
      }
    }
  
  return Dispatcher;
});
