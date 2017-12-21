(function (pkg, factory) {
  pkg.CodeFinder = factory(createjs, pkg);
})(atcapp, function(createjs, app) {

  function CodeFinder() {
    this.fixFinder = new app.DictMapFinder(
      app.DATA_FIXES_AND_ROUTES["fix_codes_dict_map"]
    );
  }

  CodeFinder.prototype.findFixCodes = function (prefix) {
    prefix = prefix.replace(/[\s　]/, "").toUpperCase();
    return this.fixFinder.findAll(prefix);
  }

  return CodeFinder;

});
