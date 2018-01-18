(function (pkg, fac) {
  pkg.JsonApiLoader = fac(atcapp);
})(atcapp, function (app) {

  createjs.extend(JsonApiLoader, app.AbstractApiLoader);

  function JsonApiLoader() {
    this.AbstractApiLoader_constructor();
  }

  var p = JsonApiLoader.prototype;

  /**
   * Example:
   *   var apiLoader = new app.JsonApiLoader();
   *   apiLoader.
   *   apiUrl( this.apiUrl ).
   *   success(success).
   *   error(error).
   *   // params(params).
   *   load();
   */
  
  p.load = function () {
    var apiUrl   = this.__apiUrl;
    var postData = this.__params || null;
    var onSuccess = this.__onSuccess;
    var onError   = this.__onError;

    __.assert(apiUrl && onSuccess && onError);
    
    // 通信実行
    $.ajax({
      type:"post",
      url: apiUrl,
      data: postData,
      contentType: 'application/json',
      dataType: "json",
      success: function(data) { // 200 OK
	if (data.error) {
	  onError(data.error);
	  return;
	}
	onSuccess(data);
      },
      error: function() { // HTTP Error
	onError(null);
      }
    });

    return this;
  };
  
  return createjs.promote(JsonApiLoader, "AbstractApiLoader");

});
