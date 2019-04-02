;
(function () {
  'use strict';

  // Creamos 'game' instancia de Chess, que permite obtener las posibles jugadas, las posiciones en el tablero, etc.
  var game = new Chess();

  // Creamos 'chessAI', que será el web worker que utilizaremos para simular nuestra "inteligencia artificial" y que nos devolverá su mejor jugada.
  var chessAI = new Worker("js/ai.js");

  // Aquí guardaremos nuestra instancia de 'chessBoard', para obtener la interfaz gráfica que necesitamos
  var board;

  // También necesitaremos donde guardar la configuración de nuestro tablero
  var boardConfig = {
    draggable: true //podremos tomar las piezas y colocarlas en otra posición
  };

  // Usamos esta variable para controlar cuando la AI está evaluando
  var thinking = false;

  // Guardamos aquí las selecciones jQuery de los elementos de la interfaz con los que interactuamos y mostramos información
  var $chMsg = $('#check-msg'), // Mensaje: "¡Jaque!"
    $gameOver = $('#game-over-msg'), // Mensaje: "Juego terminado"
    $searchDepth = $('#search-depth'), // Selector de profundidad de búsqueda de la AI
    $historyElement = $('#move-history'), // Historial de posiciones de la partida
    $positionCount = $('#position-count'), // Posiciones evaluadas
    $time = $('#time'), // Tiempo de evaluación
    $positionsPerS = $('#positions-per-s'), // Posiciones por segundo
    $reset = $('#reset'), // Botón de reinicio de juego
    $undo = $('#undo'), // Botón de deshacer
    $selectColor = $('#select-color'), // Selector de color
    $thinking = $('#thinking'); // Mensaje "Pensando..."

  // Color de la AI; por defecto es negras (black).
  var aiColor = 'black';

  // Funcion para reiniciar el juego
  var reset = function () {

    // Si la AI no está evaluando
    if(!thinking){
      // Reinicio de la interfaz de información
      $chMsg.hide();
      $historyElement.empty();
      $positionCount.text('0');
      $time.text('0s');
      $positionsPerS.text('0');

      // Tomamos el color elegido por el jugador Humano
      var selectedColor = $selectColor.find(':selected').val();

      // Asignamos a la AI el color contrario
      aiColor = selectedColor === 'white' ? 'black' : 'white';

      // Orientamos el tablero según el color elegido
      board.orientation(selectedColor);

      // Reiniciamos el tablero
      board.position('start');

      // Reiniciamos el juego
      game.reset();

      // Si el color de la AI es 'blancas', juega primero
      if (aiColor === 'white') {
        makeAIMove();
      }
    }    
  };

  // Al hacer click en el botón 'reset', reiniciamos el juego
  $reset.click(reset);

  // Funcion para deshacer una jugada
  var undo = function () {

    // Si la AI no está evaluando
    if(!thinking){

      // Deshacemos 2 jugadas atrás
      game.undo();
      game.undo();

      // Actualizo la vista del tablero
      board.position(game.fen());

      // Actualizo el historial de movimientos
      renderMoveHistory(game.history());
    }
  };

  // Al hacer click en el botón 'undo', deshacemos una jugada
  $undo.click(undo);

  // Mostramos el historial del juego hasta el momento
  var renderMoveHistory = function (moves) {

    // Si hay 'jaque'
    if (game.in_check() === true) {
      $chMsg.show();
    } else {
      $chMsg.hide();
    }

    // Borramos el historial viejo
    $historyElement.empty();

    // Llenamos con la información nueva
    for (var i = 0; i < moves.length; i = i + 2) {
      $historyElement.append('<div>' + moves[i] + ' ' + (moves[i + 1] ? moves[i + 1] : ' ') + '</div>')
    }

    // Movemos el scroll a la parte inferior, para mostrar la última jugada
    $historyElement.scrollTop($historyElement[0].scrollHeight);
  };

  // Función con la que nos comunicamos con la AI, para pedirle su mejor jugada
  var getAIMove = function () {

    // Si es el final del juego
    if (game.game_over()) {
      $chMsg.hide();

      // Si es tablas
      if (game.in_draw()) {
        $gameOver.text('Empate :-/ - Tablas').show();
      } else {
        // Gana el jugador humano
        $gameOver.text('¡Tú ganaste! - Juego terminado').show();
      }
      return false;
    }

    // Marco la variable como 'pensando'
    thinking = true;

    // Muestro el cartel 'Pensando...'
    $thinking.show();

    // Obtengo la profundidad
    var depth = parseInt($searchDepth.find(':selected').text());

    // Enviamos a la AI (web worker) las variables necesarias para que devuelva su evaluación
    chessAI.postMessage({
      aiColor: aiColor,
      depth: depth,
      fen: game.fen()
    });
  };

  // Recibimos de la AI el resultado de su evaluación
  chessAI.onmessage = function (oEvent) {

    // Quito la marca de la variable como 'pensando'
    thinking = false;
    
    // Oculto el cartel 'Pensando...'
    $thinking.hide();

    // Muestro la cantidad de posiciones evaluadas
    $positionCount.text(oEvent.data.positionCount);

    // Muestro el tiempo consumido por la evaluación
    $time.text(oEvent.data.moveTime + 's');

    // Muestro las posiciones evaluadas por segundo
    $positionsPerS.text(oEvent.data.positionsPerS);

    // Ejecuto el movimento de la AI
    game.move(oEvent.data.bestMove);

    // Actualizo la vista del tablero
    board.position(game.fen());

    // Actualizo el historial de movimientos
    renderMoveHistory(game.history());

    // Si es el final del juego
    if (game.game_over()) {
      $chMsg.hide();

      // Si es tablas
      if (game.in_draw()) {
        $gameOver.text('Empate :-/ - Tablas').show();
      } else {
        // Gana la AI
        $gameOver.text('¡Jaque mate! - La AI gana :-(').show();
      }

      return false;
    }
  };

  // Funciones para controlar qué casillas se resaltan con color (ej: para movimientos posibles)
  var colorSquares = {
    add: function (square) {
      var squareEl = $('#board .square-' + square);

      var background = '#a9a9a9';
      if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
      }

      squareEl.css('background', background);
    },
    remove: function () {
      $('#board .square-55d63').css('background', '');
    }
  };

  // Coloreamos las casillas para mostrar los posibles movimientos de cada pieza
  boardConfig.onMouseoverSquare = function (square, piece) {

    // Si la AI no está evaluando
    if(!thinking){
      var moves = game.moves({
        square: square,
        verbose: true
      });

      if (moves.length === 0) return;

      colorSquares.add(square);

      for (var i = 0; i < moves.length; i++) {
        colorSquares.add(moves[i].to);
      }
    }
  };

  // Quitamos el color de casillas con mouse out
  boardConfig.onMouseoutSquare = colorSquares.remove;

  // Al terminar la interacción con el tablero
  boardConfig.onSnapEnd = function () {
    board.position(game.fen());
  };

  // Al tomar una pieza del tablero
  boardConfig.onDragStart = function (source, piece, position, orientation) {

    // Sólo permitimos tomar las piezas del jugador humano
    var humanPieceSearch = aiColor === 'white' ? /^w/ : /^b/;

    // Si no se pueden tomar piezas
    if (game.in_checkmate() === true || game.in_draw() === true ||
      piece.search(humanPieceSearch) !== -1 || thinking) {
      return false;
    }
  };

  // Al soltar una pieza del tablero
  boardConfig.onDrop = function (source, target) {

    // Si la AI no está evaluando
    if(!thinking){
      // Ejecutamos el movimiento en el juego
      var move = game.move({
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

      // Actualizamos el historial
      renderMoveHistory(game.history());

      // Llamamos a la AI para que ejecute su jugada
      getAIMove();
    }
  };


  // Creamos el tablero
  board = ChessBoard('board', boardConfig);

  // Inicializamos el juego
  reset();  
})();