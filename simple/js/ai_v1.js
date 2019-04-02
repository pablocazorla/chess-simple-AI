var chessAI = (function () {
  'use strict';

  var AI = {};

  var positionCount = 0;

  var evaluateBoard = function (board, aiCol) {

    var getPieceValue = function (piece, x, y) {

      var reverseArray = function (array) {
        return array.slice().reverse();
      };

      var pawnEvalWhite = [
        [9.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0],
        [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
        [1.0, 1.0, 2.0, 4.0, 4.0, 2.0, 1.0, 1.0],
        [0.5, 0.5, 1.0, 3.5, 3.5, 1.0, 0.5, 0.5],
        [0.0, 0.0, 0.0, 3.0, 3.0, 0.0, 0.0, 0.0],
        [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
        [0.5, 1.0, 1.0, -3.0, -3.0, 1.0, 1.0, 0.5],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
      ];
      var pawnEvalBlack = reverseArray(pawnEvalWhite);
      var knightEval = [
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
        [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
        [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
        [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
        [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
        [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
        [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
      ];
      var bishopEvalWhite = [
        [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
        [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
        [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
        [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
        [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
        [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
        [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
        [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
      ];
      var bishopEvalBlack = reverseArray(bishopEvalWhite);
      var rookEvalWhite = [
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0]
      ];
      var rookEvalBlack = reverseArray(rookEvalWhite);
      var evalQueen = [
        [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
        [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
        [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
        [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
        [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
        [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
        [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
        [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
      ];
      var kingEvalWhite = [

        [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
        [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
        [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
        [2.0, 4.0, 1.0, 0.0, 0.0, 1.0, 4.0, 2.0]
      ];
      var kingEvalBlack = reverseArray(kingEvalWhite);

      if (piece === null) {
        return 0;
      }
      var getAbsoluteValue = function (piece, isWhite, x, y) {
        if (piece.type === 'p') {
          return 10 + (isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x]);
        } else if (piece.type === 'r') {
          return 50 + (isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x]);
        } else if (piece.type === 'n') {
          return 30 + knightEval[y][x];
        } else if (piece.type === 'b') {
          return 35 + (isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x]);
        } else if (piece.type === 'q') {
          return 90 + evalQueen[y][x];
        } else if (piece.type === 'k') {
          return 900 + (isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x]);
        }
        throw "Unknown piece type: " + piece.type;
      };

      var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x, y);
      return piece.color === aiCol ? -absoluteValue : absoluteValue;
    };

    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i, j);
      }
    }
    return totalEvaluation;
  };

  // MINIMAX
  var minimax = function (aiCol, depth, game, alpha, beta, isMaximisingPlayer) {

    positionCount++;
    if (depth === 0) {
      return -evaluateBoard(game.board(), aiCol);
    }

    var newGameMoves = game.moves();

    if (isMaximisingPlayer) {
      var bestMove = -9999;
      for (var i = 0; i < newGameMoves.length; i++) {
        game.move(newGameMoves[i]);
        bestMove = Math.max(bestMove, minimax(aiCol, depth - 1, game, alpha, beta, !isMaximisingPlayer));
        game.undo();

        // PODA
        alpha = Math.max(alpha, bestMove);        
        if (beta <= alpha) {
          return bestMove;
        }
      }
      return bestMove;
    } else {
      var bestMove = 9999;
      for (var i = 0; i < newGameMoves.length; i++) {
        game.move(newGameMoves[i]);
        bestMove = Math.min(bestMove, minimax(aiCol, depth - 1, game, alpha, beta, !isMaximisingPlayer));
        game.undo();

        // PODA
        beta = Math.min(beta, bestMove);
        if (beta <= alpha) {
          return bestMove;
        }
      }
      return bestMove;
    }
  };

  var minimaxRoot = function (aiCol, depth, game, isMaximisingPlayer) {

    var newGameMoves = game.moves();

    newGameMoves.sort(function(a, b){return 0.5 - Math.random()});

    var bestMove = -9999;
    var bestMoveFound;

    for (var i = 0; i < newGameMoves.length; i++) {
      var newGameMove = newGameMoves[i]
      game.move(newGameMove);

      var value = minimax(aiCol, depth - 1, game, -10000, 10000, !isMaximisingPlayer);
      game.undo();
      if (value >= bestMove) {
        bestMove = value;
        bestMoveFound = newGameMove;
        console.log('bestMove:',bestMoveFound);
      }
    }
    
    return bestMoveFound;
  };























  AI.move = function (aiColor, depth, game) {
    // AZAR
    //var newGameMoves = game.moves();
    //return newGameMoves[Math.floor(Math.random() * newGameMoves.length)];
    // END AZAR

    // SIMPLE
    // var newGameMoves = game.moves();
    // var bestMove = null,
    //   aiCol = aiColor === 'white' ? 'w':'b';
    // //use any negative large number
    // var bestValue = -9999;
    // for (var i = 0; i < newGameMoves.length; i++) {
    //   var newGameMove = newGameMoves[i];
    //   game.move(newGameMove);
    //   //take the negative as AI plays as black
    //   var boardValue = -evaluateBoard(game.board(),aiCol);
    //   game.undo();
    //   if (boardValue > bestValue) {
    //     bestValue = boardValue;
    //     bestMove = newGameMove
    //   }
    // }
    // return bestMove;
    // END SIMPLE

    var aiCol = aiColor === 'white' ? 'w' : 'b';

 


    positionCount = 0;
    var bestMove = minimaxRoot(aiCol, depth, game, true);
   
    return {
      positionCount: positionCount,
      bestMove: bestMove
    };
  };

  return AI;
})();