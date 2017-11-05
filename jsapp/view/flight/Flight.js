(function (pkg, fac) {
  pkg.Flight = fac(createjs, pkg);
})(atcapp, function (createjs, app) {

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
    this.x = data.x();
    this.y = data.y();
    this.rotation = data.heading();
    this.alpha = 0.5;
    this.scaleX = this.scaleY = 0.01;
    return this;
  };

  return Flight;
});
