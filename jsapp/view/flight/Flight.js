(function (pkg, fac) {
  pkg.Flight = fac(_, __, createjs, pkg);
})(atcapp, function (_, __, createjs, app) {

  createjs.extend(Flight, app.ExContainer);
  createjs.promote(Flight, "ExContainer");

  function Flight() {
    this.ExContainer_constructor({hover: true});
    this.addChild( this.targetSymbol = new app.TargetSymbol() );
    //this.addChild( new app.Circle() );
  }

  Flight.prototype.override__hoverMsg = function (e) {
    return this.id;
  };

  Flight.prototype.updateData = function (data) {
    __.assert(_.isObject(data));
    this.x = data.x();
    this.y = data.y();
    this.alpha = 0.5;
    this.targetSymbol.updateData(data);
    return this;
  };

  Flight.prototype.highlight = function () {
    this.targetSymbol.highlight();
  };

  return Flight;
});
