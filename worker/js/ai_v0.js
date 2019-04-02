importScripts('libs/chess.min.js');

var game = new Chess();

var positionCount = 0,
  startTime, endTime, moveTime, positionsPerS;

var evaluateBoard = function (board, color) {
  // Sets the value for each piece using standard piece value
  var pieceValue = {
    'p': 100,
    'n': 350,
    'b': 350,
    'r': 525,
    'q': 1000,
    'k': 10000
  };

  var reverseArray = function (array) {
    return array.slice().reverse();
  };

  var positionValue = {
    pw: [
      [9.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0, 9.0],
      [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
      [1.0, 1.0, 2.0, 4.0, 4.0, 2.0, 1.0, 1.0],
      [0.5, 0.5, 1.0, 3.5, 3.5, 1.0, 0.5, 0.5],
      [0.0, 0.0, 0.0, 3.0, 3.0, 0.0, 0.0, 0.0],
      [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
      [0.5, 1.0, 1.0, -3.0, -3.0, 1.0, 1.0, 0.5],
      [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    ],
    nw: [
      [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
      [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
      [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
      [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
      [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
      [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
      [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
      [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
    ],
    bw: [
      [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
      [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
      [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
      [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
      [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
      [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
      [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
      [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
    ],
    rw: [
      [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
      [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
      [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
      [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
      [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
      [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
      [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0]
    ],
    qw: [
      [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
      [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
      [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
      [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
      [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
      [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
      [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
      [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
    ],
    kw: [
      [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
      [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
      [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
      [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
      [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
      [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
      [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
      [2.0, 4.0, 1.0, 0.0, 0.0, 1.0, 4.0, 2.0]
    ]
  };

  positionValue.pb = reverseArray(positionValue.pw);
  positionValue.nb = reverseArray(positionValue.nw);
  positionValue.bb = reverseArray(positionValue.bw);
  positionValue.rb = reverseArray(positionValue.rw);
  positionValue.qb = reverseArray(positionValue.qw);
  positionValue.kb = reverseArray(positionValue.kw);

  // Loop through all pieces on the board and sum up total
  var value = 0;
  board.forEach(function (row, rowIndex) {

    row.forEach(function (piece, colIndex) {
      if (piece) {
        var pValue = 10 * positionValue[piece['type'] + piece['color']][rowIndex][colIndex];
        // Subtract piece value if it is opponent's piece
        value += (pieceValue[piece['type']] + pValue) * (piece['color'] === color ? 1 : -1);
      }
    });
  });

  return value;
};


var calcBestMove = function (depth, game, playerColor, alpha, beta, isMaximizingPlayer) {
  positionCount++;
  // Base case: evaluate board
  var value;
  if (depth === 0) {
    value = evaluateBoard(game.board(), playerColor);
    return [value, null]
  }

  // Recursive case: search possible moves
  var bestMove = null; // best move not set yet
  var possibleMoves = game.moves();
  // Set random order for possible moves
  possibleMoves.sort(function (a, b) {
    return 0.5 - Math.random()
  });
  // Set a default best move value
  var bestMoveValue = isMaximizingPlayer ? Number.NEGATIVE_INFINITY :
    Number.POSITIVE_INFINITY;
  // Search through all possible moves
  for (var i = 0; i < possibleMoves.length; i++) {
    var move = possibleMoves[i];
    // Make the move, but undo before exiting loop
    game.move(move);
    // Recursively get the value from this move
    value = calcBestMove(depth - 1, game, playerColor, alpha, beta, !isMaximizingPlayer)[0];
    // Log the value of this move
    // console.log(isMaximizingPlayer ? 'Max: ' : 'Min: ', depth, move, value,
    //   bestMove, bestMoveValue);

    if (isMaximizingPlayer) {
      // Look for moves that maximize position
      if (value > bestMoveValue) {
        bestMoveValue = value;
        bestMove = move;
      }
      alpha = Math.max(alpha, value);
    } else {
      // Look for moves that minimize position
      if (value < bestMoveValue) {
        bestMoveValue = value;
        bestMove = move;
      }
      beta = Math.min(beta, value);
    }
    // Undo previous move
    game.undo();
    // Check for alpha beta pruning
    if (beta <= alpha) {
      //console.log('Prune', alpha, beta);
      break;
    }
  }
  // Log the best move at the current depth
  // console.log(
  //   "Depth: " + depth + " | Best Move: " + bestMove + " | " + bestMoveValue
  // );
  // Return the best move, or the only move
  //return [bestMoveValue, bestMove || possibleMoves[0]];
  return [bestMoveValue, bestMove || possibleMoves[0]];
};

var move = function (aiColor, depth) {
  var aiCol = aiColor === "white" ? "w" : "b";

  positionCount = 0;
  startTime = new Date().getTime();

  var bestMove = calcBestMove(depth, game, aiCol, -999999, 999999, true)[1];

  endTime = new Date().getTime();
  moveTime = (endTime - startTime) / 1000;
  positionsPerS = Math.round(positionCount / moveTime);

  postMessage({
    positionCount: positionCount,
    moveTime: moveTime,
    positionsPerS: positionsPerS,
    bestMove: bestMove
  });
};


onmessage = function (oEvent) {

  game.load(oEvent.data.fen);

  move(oEvent.data.aiColor, oEvent.data.depth);
};