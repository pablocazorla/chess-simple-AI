// Importamos chess.min.js para tener disponible 'Chess'
importScripts('libs/chess.min.js');

// Creamos 'game' instancia de Chess, que permite obtener las posibles jugadas, las posiciones en el tablero, etc.
var game = new Chess(),

  // cantidad de web workers que utilizaremos para dividir el trabajo de evaluación
  numWorkers = 4,

  // Esta variable nos permitirá guardar la cantidad total de posiciones evaluadas
  positionCount = 0,

  // En esta array guardaremos las mejores posiciones obtenidas por cada web worker
  bestMoves = [],

  // En estas variables guardaremos el tiempo en el que se inicia y termina la evaluación de posiciones, y la diferencia, para conocer el tiempo total de evaluación y la performance (cantidad de posiciones por segundo evaluadas)
  startTime,
  endTime,
  moveTime,
  positionsPerS,

  // Con esta variable podemos saber cuantos web workers faltan que devuelvan sus resultados de evaluación
  thinking,

  // Función que se ejecuta cuando un web worker envía un mensaje con el resultado de su evaluación
  onResult = function (oEvent) {

    // Sumamos el número de posiciones evaluadas por el web worker
    positionCount += oEvent.data.positionCount;

    // Guardamos la mejor jugada devuelta
    bestMoves.push(oEvent.data.bestMove);

    // Un web worker menos 'pensando'
    thinking--;

    // Si todos los web workers han devuelto sus resultados
    if (thinking <= 0) {

      // tiempo en el que termina la evaluación
      endTime = new Date().getTime();

      // tiempo total (en segundos) que tardó la evaluación
      moveTime = (endTime - startTime) / 1000;

      // Posiciones por segundo evaluadas
      positionsPerS = Math.round(positionCount / moveTime);

      // Seleccionamos la mejor jugada de las propuestas por cada web worker
      var maxValue = -999999999999999,
        bestMove = null;

      bestMoves.forEach(function (m) {
        if (m.val > maxValue) {
          maxValue = m.val;
          bestMove = m.mov;
        }
      });

      /* Usamos esta función del web worker para devolver los resultados:
        positionCount: cantidad total de posiciones evaluadas
        moveTime: tiempo total (en segundos) que tardó la evaluación
        positionsPerS: posiciones por segundo evaluadas
        bestMove: mejor jugada obtenida
      */
      postMessage({
        positionCount: positionCount,
        moveTime: moveTime,
        positionsPerS: positionsPerS,
        bestMove: bestMove
      });
    }
  };

// Array en el que almacenamos los web workers
var workers = [];

// Creamos los web workers
for (var i = 0; i < numWorkers; i++) {
  var newWorker = new Worker("ai-calc.js");

  // Asignamos 'onResult' para que se ejecute cuando se envíe un mensaje
  newWorker.onmessage = onResult;

  // Guardamos el web worker
  workers.push(newWorker);
}


var move = function (aiColor, depth, fen) {


};

// Función utilizada por el web worker para recibir mensajes
onmessage = function (oEvent) {

  // Actualizamos 'game' a la posición actual
  game.load(oEvent.data.fen);

  // Usamos esta función para dividir el listado de posiciones entre los web workers
  var chunkArray = function (myArray, chunk_size) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];

    for (index = 0; index < arrayLength; index += chunk_size) {
      myChunk = myArray.slice(index, index + chunk_size);
      // Do something if you want with the group
      tempArray.push(myChunk);
    }
    return tempArray;
  };

  // Obtenemos todas las jugadas posibles
  var possibleMoves = game.moves();

  // Mezclamos el listado para dar una cierta 'variabilidad' en la evaluación, de manera que no se repitan siempre las mismas evaluaciones
  possibleMoves.sort(function (a, b) {
    return 0.5 - Math.random();
  });

  // Obtenemos un array con los listados para cada worker
  var arrayOfPositions = chunkArray(possibleMoves, Math.ceil(possibleMoves.length / numWorkers));

  // Asignamos valores iniciales a las variables, antes de llamar a los workers para evaluación
  positionCount = 0;
  bestMoves = [];
  startTime = new Date().getTime();
  thinking = numWorkers;

  workers.forEach(function (w, j) {

    // Enviamos al web worker las variables necesarias para que devuelva su evaluación
    w.postMessage({
      aiColor: oEvent.data.aiColor === 'white' ? 'w' : 'b',
      depth: oEvent.data.depth,
      fen: oEvent.data.fen,
      possibleMoves: arrayOfPositions[j]
    });
  });
};