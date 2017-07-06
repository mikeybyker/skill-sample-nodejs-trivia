'use strict';
const Alexa = require('alexa-sdk');
const constants = require('./constants');
const helpers = require('./helpers');
const languageString = require('./language');
const stateHandlers = require('./stateHandlers');

exports.handler = function(event, context, callback) {
  let alexa = Alexa.handler(event, context);
  alexa.appId = constants.appId;
  alexa.resources = languageString
  alexa.registerHandlers (
    stateHandlers.newSession,
    stateHandlers.startState,
    stateHandlers.triviaState,
    stateHandlers.helpState
  );
  alexa.execute();
};

// Add your questions in ./questions.js
// Edit app messages in ./language.js
// Add your own appId and quiz settings in ./constants.js
// Add your function name to ../publish.bat
