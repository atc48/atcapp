(function (pkg, factory) {
  pkg.CodeSearchBox = factory(createjs, pkg, _);
})(atcapp, function(createjs, app, _) {

  var IGNORE_CHARS = /[^A-Za-z0-9]/

  function CodeSearchBox($root, delegate) {
    this.$input = $root.find('input');
    this.$completion = $root.find('.completion');
  }

  CodeSearchBox.prototype.init = function (delegate) {
    __.assert(_.isObject(delegate) && _.isFunction(delegate["findCompletionCodes"]) &&
	      _.isFunction(delegate["onWordsUpdated"]) );
    
    this.completion = new _CompletionBox( this.$completion );
    this.$input.on("keyup",    _.bind(this._onKeyUp, this));
    this.delegate = delegate;
  };

  CodeSearchBox.prototype._onKeyUp = function (e) {
    this.completion.reset();

    var text = this.$input.val();
    var words = text.split( /[\s　]/ );
    if (words.length == 0) {
      return;
    }
    var wordsFinished = words.slice(0, -1);
    var lastWord = words.slice(-1)[0].toUpperCase();

    // ENTER key pressed or
    // SPACE input
    if (e.keyCode == 13 ||
	lastWord == "" || lastWord.match( IGNORE_CHARS )) {
      this._updateWords( words );
      return;
    }

    // processing INPUT
    this._updateWords( wordsFinished );

    this._toUpperCase();

    var codes = this.delegate.findCompletionCodes( lastWord, wordsFinished );
    if (codes.length == 1 && codes[0] == lastWord && !!codes[0]) {
      this._updateWords( words );
      return;
    }
    this.completion.reset(codes);
  };

  CodeSearchBox.prototype._updateWords = function (words) {
    words = __filterWords( words );
    if (_.isEqual(this.lastWords, words)) {
      return;
    }
    this.lastWords = words;
    this.delegate.onWordsUpdated( words );
  }

  function __filterWords( words ){
    words = _.map(words, function (w) { return w.replace(IGNORE_CHARS, "").toUpperCase(); });
    words = _.reject(words, function (w) { return !w; });
    return words;
  }

  CodeSearchBox.prototype._toUpperCase = function () {
    var text = this.$input.val();
    if (text.match(/[a-z]/)) {
      this.$input.val( text.toUpperCase() );
    }
  };

  function _CompletionBox($completion) {
    this.$completion = $completion;
    this.NUM_MAX_COMPLETION = 40;
  }

  _CompletionBox.prototype.reset = function (codes) {
    this.$completion.hide();

    if (!codes || codes.length <= 0) { return; }
    codes = codes.slice(0, this.NUM_MAX_COMPLETION);
    var codesHtml = _.map(codes, function (code) {
      return "<code>" + code.replace(/[<>]/, "") + "</code>";
    }).join(" ");
    this.$completion.empty().html( codesHtml ).show();
  };
  
  return CodeSearchBox;

});
