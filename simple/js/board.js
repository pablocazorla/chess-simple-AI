var chessBoard = function (game, chessAI) {
  'use strict';

  var board,
    aiColor = 'black';

  var $chMsg = $('#check-msg'),
    $gameOver = $('#game-over-msg'),
    $searchDepth = $('#search-depth'),
    $historyElement = $('#move-history'),
    $positionCount = $('#position-count'),
    $time = $('#time'),
    $positionsPerS = $('#positions-per-s'),
    $reset = $('#reset'),
    $selectColor = $('#select-color'),
    $thinking = $('#thinking');


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
    makeAIMove = function () {
      if (game.game_over()) {
        $chMsg.hide();
        $gameOver.text('Human win - Game over').show();
        return false;
      }
      if (chessAI) {
        $thinking.show();
        setTimeout(function () {
          var positionCount = 0,
            depth = parseInt($searchDepth.find(':selected').text()),
            d = new Date().getTime(),
            chessAImovement = chessAI.move(aiColor, depth, game),
            bestMove = chessAImovement.bestMove,
            positionCount = chessAImovement.positionCount,
            d2 = new Date().getTime(),
            moveTime = (d2 - d),
            positionsPerS = Math.round(positionCount * 1000 / moveTime);

          $thinking.hide();
          $positionCount.text(positionCount);
          $time.text(moveTime / 1000 + 's');
          $positionsPerS.text(positionsPerS);

          //
          game.move(bestMove);
          board.position(game.fen());
          renderMoveHistory(game.history());
          if (game.game_over()) {
            $chMsg.hide();
            $gameOver.text('AI win - Game over').show();
            return false;
          }
        }, 100);

      }
    },
    onSnapEnd = function () {
      board.position(game.fen());
    },
    renderMoveHistory = function (moves) {

      if (game.in_check() === true) {
        $chMsg.show();
      } else {
        $chMsg.hide();
      }

      $historyElement.empty();
      for (var i = 0; i < moves.length; i = i + 2) {
        $historyElement.append('<div>' + moves[i] + ' ' + (moves[i + 1] ? moves[i + 1] : ' ') + '</div>')
      }
      $historyElement.scrollTop($historyElement[0].scrollHeight);

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

      renderMoveHistory(game.history());
      window.setTimeout(makeAIMove, 250);
    },

    reset = function () {
      $chMsg.hide();
      $historyElement.empty();
      $positionCount.text('0');
      $time.text('0s');
      $positionsPerS.text('0');

      var selectedColor = $selectColor.find(':selected').val();



      aiColor = selectedColor === 'white' ? 'black' : 'white';



      board.orientation(selectedColor);
      board.position('start');
      game.reset();

      if (aiColor === 'white') {
        makeAIMove();
      }
    };



  board = ChessBoard('board', {
    draggable: true,
    //position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
  });

  reset();

  $reset.click(reset);

  return board;
};