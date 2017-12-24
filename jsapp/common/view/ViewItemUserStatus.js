(function (pkg, fac) {
  pkg.ViewItemUserStatus = fac(_, createjs, pkg);
})(atcapp, function (_, createjs, app) {

  createjs.extend(ViewItemUserStatus, app.Dispatcher);

  var STATES = {
    DEFAULT:  new _State("Default",  0),
    ACTIVE:   new _State("Active",   1),
    HILIGHT:  new _State("Hilight",  1),
    HOVER:    new _State("Hover",    1),    
    SELECTED: new _State("Selected", 1)
  };
  // SELECTED: single selected (mostly Selected by click)
  // ACTIVE:   state after user selected or hilighted
  
  // Transitions ideally must be:
  //   Default => Hilight  => Active
  //   Default => Selected => Active

  var __hasInit = false;

  function ViewItemUserStatus(target, opt) {
    this.Dispatcher_constructor();
    __.assert(_.isObject(target) && _.isObject(opt));
    this.target = target;
    this.opt = opt;
    this._state = STATES.DEFAULT;

    if (!__hasInit) {
      __hasInit = true;
      _.each(_.keys(STATES), function (key) {
	STATES[key].setup( app.COLOR.MAP_USER_STATE_COLOR[key.toUpperCase()] );
      });
    }
  }

  ViewItemUserStatus.prototype.update = function (stateKey) {
    var state = STATES[ stateKey.toUpperCase() ];
    __.assert(state);
    if (this._state == state) {
      return;
    }
    this._state = state;
    this.fire("up", {target: this.target});
  };

  ViewItemUserStatus.prototype.getColor = function () {
    if (this.isDefault() && this.opt["defaultColor"]) {
      return this.opt["defaultColor"];
    };
    return this._state.color;
  };

  ViewItemUserStatus.prototype.isFullVisible = function () {
    return this._state.isFullVisible;
  };

  ViewItemUserStatus.prototype.getStateKey = function () {
    return this._state.key.toUpperCase();
  };

  /**
   * defines: isDefault(), isSelected(), isHilight(), isActive()
   */
  _.each(STATES, function (eachState) {
    ViewItemUserStatus.prototype["is" + eachState.key] = function () {
      return eachState == this._state;
    };
  });

  function _State(key, isFullVisible) {
    this.key   = key;
    this.isFullVisible = !!isFullVisible;
    this.setup = function (color) {
      __.assert(color);
      this.color = color;
    }
  }

  return createjs.promote(ViewItemUserStatus, "Dispatcher");
});


