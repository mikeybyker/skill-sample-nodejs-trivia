'use strict';

module.exports = Object.freeze({    
  appId : 'YOUR_APP_ID',

  ANSWER_COUNT: 4,   // The number of possible answers per trivia question.
  GAME_LENGTH: 5,    // The number of questions per trivia game.

  // For Cards. Use jpg or png < 2MB
  imageObj : {
    smallImageUrl: 'small.png', // Displayed on smaller screens   720px x 480px  (w*h)
    largeImageUrl: 'large.png'  // Displayed on larger screens    1200px x 800px (w*h)
  },

  /*
   *  States:
   *  TRIVIA:   Asking trivia questions.
   *  START:    Entry point, start the game.
   *  HELP:     The user is asking for help.
   */
  states : {
      START : '_STARTMODE',
      TRIVIA : '_TRIVIAMODE',
      HELP : '_HELPMODE'
  }
});
