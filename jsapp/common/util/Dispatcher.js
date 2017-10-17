(function (pkg, factory) {
  pkg.Dispatcher = factory();
})(atcapp, function () {

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
    function(type, event) {
      if (typeof type === 'function') {
	event = type;
	type = NONAME_TYPE;
      }
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
