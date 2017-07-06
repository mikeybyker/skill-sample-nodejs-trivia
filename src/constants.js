'use strict';

module.exports = Object.freeze({    
  appId : 'amzn1.ask.skill.0b0fe5c7-9b3e-4be1-94d4-4dba6d46c669',

  ANSWER_COUNT: 4,   // The number of possible answers per trivia question.
  GAME_LENGTH: 5,    // The number of questions per trivia game.

  // For Cards. Use jpg or png < 2MB
  imageObj : {
    smallImageUrl: 'https://s3-eu-west-1.amazonaws.com/sinister-waltz/sinister_waltz_small.png', // Displayed on smaller screens   720px x 480px  (w*h)
    largeImageUrl: 'https://s3-eu-west-1.amazonaws.com/sinister-waltz/sinister_waltz_large.png'  // Displayed on larger screens    1200px x 800px (w*h)
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
