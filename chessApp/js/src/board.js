// BOARD

// Configuración de nuestro tablero
var boardConfig = {
  draggable: true //podremos tomar las piezas y colocarlas en otra posición
};

// Funcion para reiniciar el juego
var newGame = function () {

  // Si la AI no está evaluando
  if (!THINKING) {
    // Reinicio de la interfaz de información
    UI.Info.Messages.set(null);
    UI.Info.Historial.set(null);
    UI.Info.Stats.set({
      positionCount:'-',
      time:'-',
      positionsPerS:'-'
    });

    BOARD.clear();
    // Orientamos el tablero según el color elegido
    BOARD.orientation(HUMAN_COLOR);

    // Reiniciamos el tablero
    BOARD.position('start');

    // Reiniciamos el juego
    GAME.reset();

    STORE.save();

    // Reiniciamos la AI
    CHESS_AI.post({
      newGame: true
    });
  }
};

// Funcion para deshacer una jugada
var undo = function () {

  // Si la AI no está evaluando
  if (!THINKING && !GAME.game_over()) {

    // Deshacemos 2 jugadas atrás
    GAME.undo();
    GAME.undo();

    // Actualizo la vista del tablero
    BOARD.position(GAME.fen());

    // Actualizo el historial de movimientos
    UI.Info.Historial.set(GAME.history());
  }
};




// Función con la que nos comunicamos con la AI, para pedirle su mejor jugada
var getAIMove = function () {

  // Si es el final del juego
  if (GAME.game_over()) {
    // Si es tablas
    if (GAME.in_draw() || GAME.insufficient_material()) {
      UI.Info.Messages.set('draw');
      STORE.clear();
    } else {
      // Gana el jugador humano
      UI.Info.Messages.set('checkmate-'+HUMAN_COLOR);
      STORE.clear();
    }
    return false;
  }

  // Marco la variable como 'pensando'
  THINKING = true;

  // Muestro el cartel 'Evaluando...'
  UI.Info.Messages.set('think');

  // Enviamos a la AI (web worker) las variables necesarias para que devuelva su evaluación
  CHESS_AI.post({
    aiColor: AI_COLOR,
    depth: DEPTH,
    fen: GAME.fen()
  });
};

//Recibimos de la AI el resultado de su evaluación
CHESS_AI.get(function (data) {

  // Quito la marca de la variable como 'pensando'
  THINKING = false;  

  UI.Info.Stats.set({
    // Muestro la cantidad de posiciones evaluadas
    positionCount: data.positionCount,
    // Muestro el tiempo consumido por la evaluación
    time: ( Math.round( data.moveTime * 10 )) / 10 + 's',
    // Muestro las posiciones evaluadas por segundo
    positionsPerS: data.positionsPerS
  });

  // Ejecuto el movimento de la AI
  GAME.move(data.bestMove);

  // Actualizo la vista del tablero
  BOARD.position(GAME.fen());

  // Actualizo el historial de movimientos
  UI.Info.Historial.set(GAME.history());

  // Si es el final del juego
  if (GAME.game_over()) {
    // Si es tablas
    if (GAME.in_draw() || GAME.insufficient_material()) {
      UI.Info.Messages.set('draw');
      STORE.clear();
    } else {
      // Gana la AI
      UI.Info.Messages.set('checkmate-'+AI_COLOR);
      STORE.clear();
    }
    return false;
  }
  // Si hay 'jaque'
  if (GAME.in_check() === true) {
    UI.Info.Messages.set('check');
  } else {
    // Oculto el cartel 'Pensando...'
    UI.Info.Messages.set(null);
  }
});

// Funciones para controlar qué casillas se resaltan con color (ej: para movimientos posibles)
var colorSquares = {
  current: function (square) {
    $('#board .square-' + square).addClass('current');
  },
  add: function (square) {
    $('#board .square-' + square).addClass('possible');
  },
  remove: function () {
    $('#board .square-55d63').removeClass('possible').removeClass('current');
  }
};

// Coloreamos las casillas para mostrar los posibles movimientos de cada pieza
boardConfig.onMouseoverSquare = function (square, piece) {

  // Si la AI no está evaluando
  if (!THINKING) {
    
    var moves = GAME.moves({
      square: square,
      verbose: true
    });

    if (moves.length === 0) return;

    colorSquares.current(square);

    for (var i = 0; i < moves.length; i++) {
      colorSquares.add(moves[i].to);
    }
  }
};

// Quitamos el color de casillas con mouse out
boardConfig.onMouseoutSquare = colorSquares.remove;

// Al terminar la interacción con el tablero
boardConfig.onSnapEnd = function () {
  BOARD.position(GAME.fen());
};

// Al tomar una pieza del tablero
boardConfig.onDragStart = function (source, piece, position, orientation) {

  // Sólo permitimos tomar las piezas del jugador humano
  var humanPieceSearch = AI_COLOR === 'white' ? /^w/ : /^b/;

  // Si no se pueden tomar piezas
  if (GAME.in_checkmate() === true || GAME.in_draw() === true ||
    piece.search(humanPieceSearch) !== -1 || THINKING) {
    return false;
  }
};

// Al soltar una pieza del tablero
boardConfig.onDrop = function (source, target) {

  // Si la AI no está evaluando
  if (!THINKING) {
    // Ejecutamos el movimiento en el juego
    var move = GAME.move({
      from: source,
      to: target,
      promotion: 'q' // por defecto, los peones promocinan a 'dama'
    });

    // Removemos casillas resaltadas
    colorSquares.remove();

    // Si no es posible ese movimiento
    if (move === null) {
      return 'snapback';
    }

    // Si hay 'jaque'
    if (GAME.in_check() === true) {
      UI.Info.Messages.set('check');
    } else {
      UI.Info.Messages.set(null);
    }

    // Actualizamos el historial
    UI.Info.Historial.set(GAME.history());

    // Llamamos a la AI para que ejecute su jugada
    getAIMove();
  }
};

var setPieceTheme = function(){
  
  if(BOARD){
    BOARD.destroy();
  }
  boardConfig.pieceTheme = 'img/chesspieces/'+PIECES+'/{piece}.png';

  // Creamos el tablero
  BOARD = ChessBoard('board', boardConfig);
  // Actualizo la vista del tablero
  BOARD.position(GAME.fen());
};


setPieceTheme();

if(PGN !== ''){

  GAME.load_pgn(PGN);

  // Actualizo la vista del tablero
  BOARD.position(GAME.fen());

  // Orientamos el tablero según el color elegido
  BOARD.orientation(HUMAN_COLOR);

  // Actualizamos el historial
  UI.Info.Historial.set(GAME.history());

  // Actualizamos el mensaje
  UI.Info.Messages.set(MESSAGE);

  UI.Info.Stats.set({
    positionCount: STATS.P,
    time: STATS.T,
    positionsPerS: STATS.PPS
  });
}else{
  // Inicializamos el juego
  newGame();
}

