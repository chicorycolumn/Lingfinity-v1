const uUtils = require("./universalUtils.js");

export const makeCuestion = (quiz, prevCuestion, cuestionIndex = 0) => {
  let datum = quiz.datums[cuestionIndex];

  let question = datum.questionSentenceArr[0];
  let answers = datum.answerSentenceArr;

  let cuestion = { question, answers, datum, allAnswers: [] };

  return cuestion;
};
