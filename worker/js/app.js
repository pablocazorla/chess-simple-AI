;
(function () {
  'use strict';

    

  var chessAI = new Worker("js/ai.js");

  var game = new Chess();
  chessBoard(game,chessAI);

// myWorker.onmessage = function (oEvent) {
//   console.log(oEvent.data);
// };

// myWorker.postMessage("pablo");
   
// })();

/*



postMessage("I\'m working before postMessage(\'ali\').");

onmessage = function (oEvent) {
  postMessage({'aaa':'david'});
};

*/
})();