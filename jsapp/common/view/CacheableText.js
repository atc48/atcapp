(function (pkg, fac) {
  pkg.CacheableText = fac(_, __, createjs);
})(atcapp, function (_, __, createjs) {

  createjs.extend(CacheableText, createjs.Text);
  createjs.promote(CacheableText, "Text");

  function CacheableText(a, b, c) {
    this.Text_constructor(a, b, c);
  }

  CacheableText.prototype.doCache = function () {
    var bounds = this.getBounds();
    this.cache(bounds.x, bounds.y, bounds.width, bounds.height);
    return this;
  };

  return CacheableText;
});
