const _ = require('lodash');
const constants = require('./constants');

const randomInt = ( min, max ) => Math.floor(Math.random() * (max - min + 1) + min);
const randomPosition = ( max ) => randomInt(0, max - 1);

const answerString = (answers, count, pretty = false, sep = '\r\n') => {
  return answers
    .slice(0, count)
    .reduce((acc, cur, index) => {
      let initial = acc ? `${acc} ` : '';
      return `${initial}${pretty ? sep : ''}${index+1}. ${answers[index]}.`;
    }, '');
};

const isNewGame = (attributes) => (attributes['speechOutput'] && attributes['repromptText']) ? false : true;

const getUserAnswer = (intent, count) => isAnswerSlotValid(intent, count) ? parseInt(intent.slots.Answer.value) : null;

const isCorrect = (userAnswer, correctAnswerIndex) => (userAnswer - 1) === correctAnswerIndex;

const populateGameQuestions = (translatedQuestions, count) => _(translatedQuestions)
  .map((q, index) => index)
  .sampleSize(count).value();

// Alt
/*
function populateGameQuestions(translatedQuestions, count) {
  const indicies = translatedQuestions.map((currentValue, index) => index);
  // or Object.keys(translatedQuestions); // ["0", "1", "2"...]; // note strings
  return _.sampleSize(indicies, count);
}
*/

const shuffle = (arr) => arr.sort(() => (Math.random() - 0.5));

const swap = (arr, from, to) => {
  const copied = [...arr];
  if(to > arr.length - 1){
    to = arr.length - 1;
  }
  copied[from] = copied.splice(to, 1, copied[from])[0];
  return copied;
};

// Shuffle the answer options
const shuffleAnswers = (answers, max) => {
  const limited = answers.slice(0, max);  // shallow copy of first :max answers
  const correct = limited.shift();        // correct is always the first
  const shuffled = shuffle(limited);      // shuffle the rest
  shuffled.unshift(correct);              // put the correct one back in
  return shuffled;
};

const lookupQuestion = (question) => {
  const text = Object.keys(question)[0];
  const answers = question[text];
  const correct = answers[0];
  return {
    text,
    answers,
    correct
  };
};

const isAnswerSlotValid = (intent, maxAnswers = 4) => {
  const answerSlotFilled = intent && intent.slots && intent.slots.Answer && intent.slots.Answer.value; 
  const answerSlotIsInt = answerSlotFilled && !isNaN(parseInt(intent.slots.Answer.value));
  return answerSlotIsInt && parseInt(intent.slots.Answer.value) < (maxAnswers + 1) && parseInt(intent.slots.Answer.value) > 0;
};

const getCurrentQuestion = (indices, questionNumber, questions, score) => {
  const correctAnswerIndex = randomPosition(constants.ANSWER_COUNT);
  // console.log('getCurrentQuestion', indices, questionNumber, correctAnswerIndex);
  const questionObj = questions[indices[questionNumber]];
 
  if(!questionObj){
    throw new Error('Bad question data');
  }

  const text = Object.keys(questionObj)[0];
  const correct = questionObj[text][0];
  const shuffled = shuffleAnswers(questionObj[text], constants.ANSWER_COUNT);
  const answers = swap(shuffled, 0, correctAnswerIndex);
  console.log('answers ::: ', answers);

  return { questionNumber, answers, text, correct, correctAnswerIndex, score };
}

function translate(key, keySeparator = '#'){
  return this.t(key, { keySeparator });
}

function getResponses(question, speech, count) {
  const answers = answerString(question.answers, count);
  const answersPretty = answerString(question.answers, count, true); // for Echo Show etc.
  const rootText = `${this.t('TELL_QUESTION_MESSAGE', question.questionNumber + 1, question.text)}`;
  const repromptText = `${rootText} ${answers}`;
  const cardContent = `${rootText} ${answersPretty}`;
  const scoreIs = question.questionNumber > 0 ? this.t('SCORE_IS_MESSAGE', question.score) : '';
  const speechOutput = `${speech}${scoreIs}${repromptText}`;
  return {
    repromptText,
    cardContent,
    speechOutput
  };
};

function nextQuestion(questionNumber, indices, questions, score, speech = ''){
  let question; 
  try {
    question = getCurrentQuestion(indices, questionNumber, questions, score);
  }
  catch (e) {
    console.log('Error! Could not create question. ', e);
  }

  const { repromptText, cardContent, speechOutput } = getResponses.call(this, question, speech, constants.ANSWER_COUNT);

  Object.assign(this.attributes, {
    speechOutput: repromptText,
    repromptText,
    questionNumber,
    correctAnswerIndex: question.correctAnswerIndex,
    indices,
    score
  });

  this.emit(':askWithCard', speechOutput, repromptText, this.t('GAME_NAME'), cardContent, constants.imageObj || {});
}

function handleUserGuess(userGaveUp) {

  const { indices, correctAnswerIndex } = this.attributes;
  let { score, questionNumber } = this.attributes;

  const userAnswer = getUserAnswer(this.event.request.intent, constants.ANSWER_COUNT);

  let speechOutput = '', speechOutputAnalysis = '';
  const complete = questionNumber === constants.GAME_LENGTH - 1;
  const userCorrect = isCorrect(userAnswer, correctAnswerIndex);
  const translatedQuestions = translate.call(this, 'QUESTIONS');  

  if (userCorrect) {
    score++;
    console.log('handleUserGuess : User Correct. Score: ', score);
    speechOutputAnalysis = this.t('ANSWER_CORRECT_MESSAGE');
  } else {
    console.log('handleUserGuess : User wrong');
    const initial = userGaveUp ? '' : this.t('ANSWER_WRONG_MESSAGE');
    const question = lookupQuestion(translatedQuestions[indices[questionNumber]]);
    speechOutputAnalysis = `${initial}${this.t('CORRECT_ANSWER_MESSAGE', correctAnswerIndex + 1, question.correct)}`; 
  }

  if (complete) {
    // Finished
    console.log(' ----------------------- GAME OVER -------------------------', userCorrect);
    speechOutput = userGaveUp ? '' : this.t('ANSWER_IS_MESSAGE');
    const farewell = this.t('GAME_OVER_MESSAGE', score, constants.GAME_LENGTH);
    speechOutput += speechOutputAnalysis + farewell;
    this.emit(':tellWithCard', speechOutput, this.t('GAME_NAME'), farewell, constants.imageObj || {});
  } else {
    // next question
    questionNumber += 1;
    let speechOutput = userGaveUp ? '' : this.t('ANSWER_IS_MESSAGE') + speechOutputAnalysis;
    nextQuestion.call(this, questionNumber, indices, translatedQuestions, score, speechOutput);
  }
}

module.exports = {
  isNewGame,
  populateGameQuestions,
  translate,
  nextQuestion,
  handleUserGuess
};
