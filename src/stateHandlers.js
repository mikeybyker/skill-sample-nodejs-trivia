const Alexa = require('alexa-sdk');
const constants = require('./constants');
const helpers = require('./helpers');

const stateHandlers = {
  newSession : {
    LaunchRequest: function () {
      this.handler.state = constants.states.START;
      this.emitWithState('StartGame', true);
    },
    'AMAZON.StartOverIntent': function() {
      this.handler.state = constants.states.START;
      this.emitWithState('StartGame', true);
    },
    'AMAZON.HelpIntent': function() {
      this.handler.state = constants.states.HELP;
      this.emitWithState('helpTheUser', true);
    },
    Unhandled: function () {
      const speechOutput = this.t('START_UNHANDLED');
      this.emit(':ask', speechOutput, speechOutput);
    }
  },
  startState : Alexa.CreateStateHandler(constants.states.START, {
    StartGame: function (newGame) {
      console.log('-------------------- StartGame');
      const speechOutput = newGame ? `${this.t('NEW_GAME_MESSAGE', this.t('GAME_NAME'))}${this.t('WELCOME_MESSAGE', constants.GAME_LENGTH)}` : '';
      const translatedQuestions = helpers.translate.call(this, 'QUESTIONS');

      if(constants.GAME_LENGTH > translatedQuestions.length){
        throw new Error('Invalid Game Length: Not enough questons.');
      }

      const indices = helpers.populateGameQuestions(translatedQuestions, constants.GAME_LENGTH);
      this.handler.state = constants.states.TRIVIA;
      helpers.nextQuestion.call(this, 0, indices, translatedQuestions, 0, speechOutput);
    }
  }),
  triviaState : Alexa.CreateStateHandler(constants.states.TRIVIA, {
    AnswerIntent: function () {
      helpers.handleUserGuess.call(this, false);
    },
    DontKnowIntent: function () {
      helpers.handleUserGuess.call(this, true);
    },
    'AMAZON.StartOverIntent': function () {
      this.handler.state = constants.states.START;
      this.emitWithState('StartGame', false);
    },
    'AMAZON.RepeatIntent': function () {
      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptText']);
    },
    'AMAZON.HelpIntent': function () {
      this.handler.state = constants.states.HELP;
      this.emitWithState('helpTheUser', false);
    },
    'AMAZON.StopIntent': function () {
      this.handler.state = constants.states.HELP;
      const speechOutput = this.t('STOP_MESSAGE');
      this.emit(':ask', speechOutput, speechOutput);
    },
    'AMAZON.CancelIntent': function () {
      this.emit(':tell', this.t('CANCEL_MESSAGE'));
    },
    Unhandled: function () {
      const speechOutput = this.t('TRIVIA_UNHANDLED', constants.ANSWER_COUNT.toString());
      this.emit(':ask', speechOutput, speechOutput);
    },
    SessionEndedRequest: function () {
      console.log('Session ended in trivia state: ' + this.event.request.reason);
    }
  }),
  helpState: Alexa.CreateStateHandler(constants.states.HELP, {
    helpTheUser: function (newGame) {
      const askMessage = newGame ? this.t('ASK_MESSAGE_START') : `${this.t('REPEAT_QUESTION_MESSAGE')}${this.t('STOP_MESSAGE')}`;
      const speechOutput = `${this.t('HELP_MESSAGE', constants.GAME_LENGTH)}${askMessage}`;
      const repromptText = `${this.t('HELP_REPROMPT')}${askMessage}`;
      this.emit(':ask', speechOutput, repromptText);
    },
    'AMAZON.StartOverIntent': function () {
      this.handler.state = constants.states.START;
      this.emitWithState('StartGame', false);
    },
    'AMAZON.RepeatIntent': function () {
      const newGame = helpers.isNewGame(this.attributes);
      this.emitWithState('helpTheUser', newGame);
    },
    'AMAZON.HelpIntent': function() {
      const newGame = helpers.isNewGame(this.attributes);
      this.emitWithState('helpTheUser', newGame);
    },
    'AMAZON.YesIntent': function() {
      if (!helpers.isNewGame(this.attributes)) {
        this.handler.state = constants.states.TRIVIA;
        this.emitWithState('AMAZON.RepeatIntent');
      } else {
        this.handler.state = constants.states.START;
        this.emitWithState('StartGame', false);
      }
    },
    'AMAZON.NoIntent': function() {
      const speechOutput = this.t('NO_MESSAGE');
      this.emit(':tell', speechOutput);
    },
    'AMAZON.StopIntent': function () {
      const speechOutput = this.t('STOP_MESSAGE');
      this.emit(':ask', speechOutput, speechOutput);
    },
    'AMAZON.CancelIntent': function () {
      this.emit(':tell', this.t('CANCEL_MESSAGE'));
    },
    Unhandled: function () {
      const speechOutput = this.t('HELP_UNHANDLED');
      this.emit(':ask', speechOutput, speechOutput);
    },
    SessionEndedRequest: function () {
      console.log(`Session ended in help state: ${this.event.request.reason}`);
    }
  })
};

module.exports = stateHandlers;
