import axios from "axios";
const uUtils = require("../utils/universalUtils.js");
const baseUrl = "http://localhost:9090/api";
// const token = localStorage.getItem("currentUserToken");

export const fetchPalette = (
  beEnv,
  langQ,
  langA,
  formulaTopics,
  formulaDifficulty,
  iterations = 1
) => {
  let baseString = `${baseUrl}/palette?`;
  let envString = `envir=${beEnv}`;
  let langString = `&questionLanguage=${langQ}&answerLanguage=${langA}`;
  let topicsString =
    formulaTopics && formulaTopics.length
      ? `&topics=${formulaTopics.join(",")}`
      : "";
  let difficultyString = `&difficulty=${formulaDifficulty}`;
  let iterationsString = `&iterations=${iterations}`;

  return axios
    .get(
      baseString +
        envString +
        langString +
        topicsString +
        difficultyString +
        iterationsString
      // ,{headers: { Authorization: `BEARER ${token}` }}
    )
    .then((res) => {
      let responseObjArr = res.data;
      console.log(`Received ${responseObjArr.length}`);
      return responseObjArr.map((responseObj) => formatCuestion(responseObj));
    })
    .catch((err) => {
      console.log("fetchPalette ERROR", err);
      return [];
    });
};

export const formatCuestion = (datum) => {
  let question = datum.questionSentenceArr[0];
  let answers = datum.answerSentenceArr;

  let cuestion = { question, answers, datum, allAnswers: [] };

  return cuestion;
};
