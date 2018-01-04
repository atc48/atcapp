(function (pkg, factory) {
  pkg.Dispatcher = factory(_, __);
})(atcapp, function (_, __) {

  var NONAME_TYPE = "noNameType";
  
  var Dispatcher = function (opt) {
    opt = opt || {};
    this.__listeners = new Array();
    this.__isValidType = function (type) {
      if (!opt.types) { return true; }
      return _.contains(opt.types, type);
    }
  };
  Dispatcher.prototype.addEventListener =
    Dispatcher.prototype.on =
    function(type, eventHandler) {
      if (typeof type === 'function') {
	eventHandler = type;
	type = NONAME_TYPE;
      }
      __.assert(typeof type === 'string' && typeof eventHandler === 'function');
      __.assert(this.__isValidType(type));
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
      if (typeof type === 'object') {
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
