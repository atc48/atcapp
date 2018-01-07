(function (pkg, factory) {
  pkg.ExternalInitializer = factory(__, createjs, pkg);
})(atcapp, function(__, createjs, app) {

  function ExternalInitializer($stage, $fixSearch) {
    this.fixSearchBox = new app.CodeSearchBox( $fixSearch );

    __setupInputFormFocus($stage, [$fixSearch.find('input')]);
    __setupFixSearchOpener($fixSearch);
  }

  var p = ExternalInitializer.prototype;

  p.init = function (codeFinder, mapItemCommand) {
    this.searchBoxMan = new app.SearchBoxManager(
      this.fixSearchBox, codeFinder, mapItemCommand);
  };

  // disable focusing input field after stage click
  function __setupInputFormFocus($stage, $inputs) {
    var $focusingTarget = null;
    _.each($inputs, function ($input) {
      $input.
	focusin( function () { $focusingTarget = $(this); }).
	focusout(function () { $focusingTarget = null;    });
    });
    $stage.click(function () {
      if (!$focusingTarget) { return; }
      $focusingTarget.blur(); // focus out;
    });
  }

  function __setupFixSearchOpener($fixSearch) {
    var MARGIN_LEFT = 20;
    var MAX_WIDTH   = 600;
    var originWidth = parseInt( $fixSearch.css("width") );
    var marginRight = parseInt( $fixSearch.css("right") );
    __.assert(_.isNumber(originWidth) && originWidth > 0 &&
	      _.isNumber(marginRight) && marginRight > 0);

    var $window = $(window);
    var isFocusIn = false;
    var lastWidth = undefined;

    $fixSearch.find('input').
      focusin(function () {
	isFocusIn = true;
	updateWidth();
      }).
      focusout(function () {
	isFocusIn = false;
	updateWidth();
      });
    $window.resize(updateWidth);

    function updateWidth() {
      if (isFocusIn) {
	var wideWidth = Math.min(
	  $window.width() - marginRight - MARGIN_LEFT,
	  MAX_WIDTH
	);
	_up( wideWidth );
      } else {
	_up( originWidth );	
      }
      
      function _up(w) {
	__.assert(_.isNumber(w) && !_.isNaN(w));
	if (lastWidth == w) { return; }
	lastWidth = w;
	$fixSearch.css("width", w + "px");
      }
    }
  }

  return ExternalInitializer;

});
