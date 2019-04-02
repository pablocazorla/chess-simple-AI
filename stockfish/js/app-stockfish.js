;
(function () {
  'use strict';

  var board,
    game = new Chess(),
    engine = new Worker('js/stockfish.js');

  var push = function (cmd) {
      console.log('PUSH -> ', cmd);
      engine.postMessage(cmd);
    },
    aiColor = 'black',
    depth = 15;

  engine.onmessage = function onmessage(event) {
    var line = event.data;
    console.log('PULL <- ', line);
    if (line == 'uciok') {
      //console.log('engine loaded');
    } else if (line == 'readyok') {
      //console.log('engine ready');
    } else {
      var match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbk])?/);
      if (match) {
        game.move({
          from: match[1],
          to: match[2],
          promotion: match[3]
        });
        thinkNextMove();
      }
    }
  };




  var thinkNextMove = function () {
    $('#move-history').text(game.pgn());
    board.position(game.fen());
    var turn = game.turn() == 'w' ? 'white' : 'black';
    if (!game.game_over()) {
      if (turn === aiColor) {
        var moves = '';
        var history = game.history({
          verbose: true
        });
        for (var i = 0; i < history.length; ++i) {
          var move = history[i];
          moves += ' ' + move.from + move.to + (move.promotion ? move.promotion : '');
        }
        push('position startpos moves' + moves);
        push('go depth ' + depth);
      }
    }
  };

  // chessBoard -----------------------

  var greySquare = function (square) {
      var squareEl = $('#board .square-' + square);

      var background = '#a9a9a9';
      if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
      }

      squareEl.css('background', background);
    },
    removeGreySquares = function () {
      $('#board .square-55d63').css('background', '');
    },
    onMouseoverSquare = function (square, piece) {
      var moves = game.moves({
        square: square,
        verbose: true
      });

      if (moves.length === 0) return;

      greySquare(square);

      for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
      }
    },
    onMouseoutSquare = function (square, piece) {
      removeGreySquares();
    },
    onSnapEnd = function () {
      board.position(game.fen());
    },
    onDragStart = function (source, piece, position, orientation) {
      var humanPieceSearch = aiColor === 'white' ? /^w/ : /^b/;
      if (game.in_checkmate() === true || game.in_draw() === true ||
        piece.search(humanPieceSearch) !== -1) {
        return false;
      }
    },
    onDrop = function (source, target) {

      var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
      });

      removeGreySquares();
      if (move === null) {
        return 'snapback';
      }

      
      window.setTimeout(thinkNextMove, 150);
    },
    reset = function () {
      board.position('start');
      game.reset();
    };

  board = ChessBoard('board', {
    draggable: true,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
  });

  reset();
  // END chessBoard -----------------------

})();