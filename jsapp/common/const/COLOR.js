atcapp.COLOR = (function (){
  var MAP_USER_STATE_COLOR = {
    DEFAULT:  "#fafafa",
    ACTIVE:   "#fcfcfc",
    HILIGHT:  "skyblue",
    HOVER:    "#fefefe",
    SELECTED: "#ffffff"
  };

  var _FONT = "Arial";

  var C = {
    BACKGROUND: "#242424",
    NORMAL: "#ffffff",
    WORLDMAP: "#3a3a3a",
    MAPGRID: {_10: "#1a1a1a",
	      __5: "#1f1f1f",
	      __1: "#212121"},
    FIR_BDY: { color: "#ffffff",
	       alpha: 0.2,
	       dash: [2, 4]},
    SECTOR:  { color: "#555",
	       alpha: 0.8},
    SIMBOL: {
      ALPHA: 0.7,
      NORMAL:   "#fbffff",//"#00c8c8",//"aqua",//"#F0F8FF",
      ACTIVE:   "yellow",
      DEACTIVE: "#B0C4DE",
      HIGHLIGHT: "red"
    },
    FONT: _FONT,
    FONT_COLOR: "#aaaaaa",
    FONT_SIZE: "14px",
    TEXT_FONT: "14px " + _FONT,
    NAVAIDS: {
      COLOR: "#666",
      FONT: "11px " + _FONT,
      FONT_SCALE: 1.0
    },
    NOP: null
  };

  C.DATA_BLOCK = {
    FONT: C.FONT,
    COLOR: C.FONT_COLOR,
    LINE_COLOR: "#aaaaaa"
  };

  C.MAP_USER_STATE_COLOR = MAP_USER_STATE_COLOR;

  return C;
})();

