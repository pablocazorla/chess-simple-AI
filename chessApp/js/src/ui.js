// UI
var UI = {};

// Elements
UI.Presentation = (function () {
  var shown = true, // <- Set to TRUE
    P = {
      elem: $('#presentation'),
      animElems: $('#presentation .an-top'),
      toggle: function () {
        if (shown) {
          shown = false;
          this.elem.removeClass('shown');
          setTimeout(function () {
            P.animElems.removeClass('ready');
          }, 600);
        } else {
          shown = true;
          this.elem.addClass('shown');
          setTimeout(function () {
            P.animElems.addClass('ready');
          }, 500);
        }
      }
    };
  P.elem.click(function () {
    P.toggle();
  });
  setTimeout(function () {
    P.animElems.addClass('ready');
  }, 50);
  return P;
})();

var CHANGED_COLOR = false;

UI.Menu = (function () {
  var shown = false,
    M = {
      elem: $('#menu'),
      animElems: $('#menu .an-left'),
      toggle: function () {
        if (shown) {
          shown = false;
          this.elem.removeClass('shown');
          M.animElems.removeClass('ready');
          setTimeout(function () {
            if (CHANGED_COLOR) {
              CHANGED_COLOR = false;
              getAIMove();
            }
          }, 800);
        } else {
          if (!THINKING) {
            shown = true;
            this.elem.addClass('shown');
            setTimeout(function () {
              M.animElems.addClass('ready');
            }, 300);
          }
        }
      }
    };
  return M;
})();

$('.toggle-menu').click(function () {
  UI.Menu.toggle();
});
$('.toggle-presentation').click(function () {
  UI.Presentation.toggle();
});

UI.Options = {};

UI.Options.Theme = (function () {
  var $container = $('#board-container');
  var O = {
    elems: $('#opt-theme .th-box'),
    set: function (theme) {
      this.elems.removeClass('current').filter('.th-box-' + theme).addClass('current');
      THEME = theme;
      $container.removeClass('theme-a').removeClass('theme-b').addClass('theme-'+THEME);
      STORE.save();
    }
  };
  O.elems.filter('.th-box-a').click(function () {
    O.set('a');
  });
  O.elems.filter('.th-box-b').click(function () {
    O.set('b');
  });
  return O;
})();
UI.Options.Pieces = (function () {
  var O = {
    elems: $('#opt-pieces .btn-op-col'),
    set: function (pieces) {
      this.elems.removeClass('current').filter('.b-' + pieces).addClass('current');
      if(pieces !== PIECES){        
        PIECES = pieces;
        STORE.save();
        setPieceTheme();
      }
    }
  };
  O.elems.filter('.b-wikipedia').click(function () {
    O.set('wikipedia');
  });
  O.elems.filter('.b-freepik').click(function () {
    O.set('freepik');
  });
  return O;
})();

UI.Options.Color = (function () {
  var O = {
    elems: $('#opt-color .btn-op-col'),
    set: function (color) {
      this.elems.removeClass('current').filter('.' + color).addClass('current');
      HUMAN_COLOR = color;
      AI_COLOR = color === 'white' ? 'black' : 'white';
      if (BOARD) {
        // Orientamos el tablero según el color elegido
        BOARD.orientation(HUMAN_COLOR);
      }
      STORE.save();
    }
  };
  O.elems.filter('.white').click(function () {
    O.set('white');
    CHANGED_COLOR = true;
  });
  O.elems.filter('.black').click(function () {
    O.set('black');
    CHANGED_COLOR = true;
  });
  return O;
})();

UI.Options.Depth = (function () {
  var O = {
    elems: $('#opt-depth .btn-op-depth'),
    set: function (depth) {
      this.elems.removeClass('current').filter('.v' + depth).addClass('current');
      DEPTH = depth;
      STORE.save();
    }
  };
  O.elems.click(function () {
    var depth = parseInt($(this).text(), 10);
    O.set(depth);
  });
  return O;
})();

UI.Info = {};

UI.Info.Messages = (function () {
  var O = {
    elems: $('#msg .mesg'),
    container: $('#board-container'),
    set: function (msg) {
      MESSAGE = msg;
      this.elems.hide();
      this.container.removeClass('think');
      if (msg) {
        MESSAGE = msg;
        this.elems.filter('.msg-' + msg).show();
        if (msg === 'think') {
          this.container.addClass('think');
        }
      }
      STORE.save();
    }
  };
  return O;
})();

UI.Info.Stats = (function () {
  var $pCount = $('#position-count'),
    $time = $('#time'),
    $pps = $('#positions-per-s'),
    O = {
      set: function (obj) {
        $pCount.text(obj.positionCount);
        $time.text(obj.time);
        $pps.text(obj.positionsPerS);
        STATS.P = obj.positionCount;
        STATS.T = obj.time;
        STATS.PPS = obj.positionsPerS;
      }
    };
  return O;
})();

UI.Info.Historial = (function () {
  var $history = $('#move-history'),
    O = {
      set: function (h) {
        var txt = '';
        if (h) {
          for (var i = 0; i < h.length; i++) {
            txt += h[i];
            if (i < (h.length - 1)) {
              txt += ', ';
            }
          }
        }
        $history.text(txt).scrollTop($history[0].scrollHeight);
        PGN = GAME.pgn();
        STORE.save();
      }
    };
  return O;
})();

UI.newGame = (function () {
  var O = {
    set: function () {
      newGame();
      if (HUMAN_COLOR === 'black') {
        CHANGED_COLOR = true;
      } else {
        CHANGED_COLOR = false;
      }
    }
  };
  $('#btn-new-game').click(function () {
    O.set();
  });
  return O;
})();

UI.undo = (function () {
  var O = {
    set: function () {
      undo();
    }
  };
  $('#btn-undo').click(function () {
    O.set();
  });
  return O;
})();

////////////////////////////////////////////////
UI.Options.Theme.set(THEME);
UI.Options.Pieces.set(PIECES);
UI.Options.Color.set(HUMAN_COLOR);
UI.Options.Depth.set(DEPTH);