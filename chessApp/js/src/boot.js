$('document').ready(function () {
      "use strict";

      // VARIABLES
      var DEPTH = 3,
        AI_COLOR = 'black',
        HUMAN_COLOR = 'white',
        PGN = '',
        MESSAGE = '',
        THEME = 'a',
        PIECES = 'wikipedia',
        STATS = {
          P:'-',
          T:'-',
          PPS:'-'
        },

        // OBJECTS
        // Creamos 'GAME' instancia de Chess, que permite obtener las posibles jugadas, las posiciones en el tablero, etc.
        GAME = new Chess(),

        // Aquí guardaremos nuestra instancia de 'chessBoard', para obtener la interfaz gráfica que necesitamos
        BOARD,

        // Creamos 'CHESS_AI', que será el web worker que utilizaremos para simular nuestra "inteligencia artificial" y que nos devolverá su mejor jugada.
        //CHESS_AI = {},//new Worker("js/ai/ai.min.js"),

        // Usamos esta variable para controlar cuando la AI está evaluando
        THINKING = false;

      var STORE = {
        save: function () {
          var o = {
            DEPTH: DEPTH,
            AI_COLOR: AI_COLOR,
            PGN: PGN,
            MESSAGE:MESSAGE,
            THEME:THEME,
            PIECES:PIECES,
            STATS:STATS
          };
          localStorage.setItem('reinablanca', JSON.stringify(o));
        },
        restore: function(){
          var str = localStorage.getItem('reinablanca');
          if(str){
            var obj = JSON.parse(str);
            DEPTH = obj.DEPTH;
            AI_COLOR = obj.AI_COLOR;
            HUMAN_COLOR = obj.AI_COLOR === 'white' ? 'black' : 'white';
            PGN = obj.PGN;            
            MESSAGE = obj.MESSAGE;
            THEME = obj.THEME;
            PIECES = obj.PIECES;
            STATS = obj.STATS;
          }
        },
        clear: function(){
          localStorage.removeItem('reinablanca');
        }
      };

      STORE.restore();