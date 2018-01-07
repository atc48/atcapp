(function (pkg, factory) {
  pkg.CodeSearchBox = factory(createjs, pkg, _);
})(atcapp, function(createjs, app, _) {

  var IGNORE_CHARS    = /[^A-Za-z0-9]/;

  function CodeSearchBox($root, delegate) {
    this.$input = $root.find('input');
    this.$completion = $root.find('.completion');
  }

  CodeSearchBox.prototype.init = function (delegate) {
    __.assertDelegatable(delegate, ["findCompletionCodes", "onWordsUpdated", "filterWords"]);

    this.completion = new _CompletionBox( this.$completion );
    this.$input.on("keyup",    _.bind(this._onKeyUp, this));
    this.delegate = delegate;

    return this;
  };

  CodeSearchBox.prototype._onKeyUp = function (e) {
    this.completion.reset();

    var isEnterKey = e.keyCode == 13;

    var text = this.$input.val();
    if (text == this.lastText && !isEnterKey) {
      return;
    }
    this.lastText = text;

    var words = text.split( /[\s　]/ );
    if (words.length == 0) {
      return;
    }
    var wordsFinished = words.slice(0, -1);
    var lastWord = words.slice(-1)[0].toUpperCase();

    // ENTER key pressed
    if (isEnterKey) {
      this._updateWords( words, isEnterKey );
      return;
    }
    // SPACE input
    if (lastWord == "" || lastWord.match( IGNORE_CHARS )) {
      this._updateWords( words );
      return;
    }

    this._replaceToUpperCase();

    // last word completion is finished!
    var codes = this.delegate.findCompletionCodes( lastWord, wordsFinished );
    if (codes.length == 1 && codes[0] == lastWord && !!codes[0]) {
      this._updateWords( words );
      return;
    }

    this.completion.reset(codes);

    // example: "CHE", other completions exists so not determin all the words
    if (codes.length > 1) {
      this._updateWords( wordsFinished );
      return;
    }

    this._updateWords( words );
  };

  CodeSearchBox.prototype._updateWords = function (words, opt_forceUpdate, a) {
    words = this.delegate.filterWords( words );
    if (__wordsEquals(this.lastWords, words) && !opt_forceUpdate) {
      return;
    }
    this.lastWords = words;
    this.delegate.onWordsUpdated( words, {forceUpdate: opt_forceUpdate} );
  }

  CodeSearchBox.prototype._replaceToUpperCase = function () {
    var text = this.$input.val();
    if (text.match(/[a-z]/)) {
      this.$input.val( text.toUpperCase() );
    }
  };

  function __wordsEquals(left, right) {
    return _.isArray(left) && _.isArray(right) &&
      _.isEqual(__upcase(left), __upcase(right));
  }

  function __upcase(words) {
    if (_.isArray(words)) {
      return _.map(words, function (w) { return w.toUpperCase(); });
    }
    return words.toUpperCase();
  }

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
