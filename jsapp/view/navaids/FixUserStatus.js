(function (pkg, fac) {
  pkg.FixUserStatus = fac(_, createjs, pkg);
})(atcapp, function (_, createjs, app) {

  createjs.extend(FixUserStatus, app.ViewItemUserStatus);

  function FixUserStatus(target, opt) {
    this.ViewItemUserStatus_constructor(target, opt);
    this.fix = target;
  }

  FixUserStatus.prototype.isEasyHit = function () {
    return !this.isDefault();
  };

  return createjs.promote(FixUserStatus, "ViewItemUserStatus");
});


