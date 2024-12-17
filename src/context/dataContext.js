import { createContext, useState, useEffect } from "react";
const dataU = require("../utils/dataUtils.js");
const getUtils = require("../utils/getUtils.js");
const uUtils = require("../utils/universalUtils.js");
const executors = require("../utils/executors.js").executors;

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const [round, setRound] = useState();
  const [cuestion, setCuestion] = useState({});
  const [cuestionIndex, setCuestionIndex] = useState(0);
  const [playerCuestionIndex, setPlayerCuestionIndex] = useState(0);
  const [cuestionIsFinished, setCuestionIsFinished] = useState();
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [scoreJustReceived, setScoreJustReceived] = useState(0);
  const [optionsHaveChanged, setOptionsHaveChanged] = useState();
  const [useDummyData, setUseDummyData] = useState(true);

  // Display Controlling States
  const [showStart, setShowStart] = useState(true);
  const [showRound, setShowRound] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // // Load JSON Data
  // useEffect(() => {}, []);

  // Set a Single Cuestion
  useEffect(() => {
    if (round) {
      if (round?.datums.length > cuestionIndex) {
        setCuestion((prevCuestion) => {
          return round.datums[cuestionIndex];
        });
      } else {
        if (cuestionIndex === 0) {
          alert("Something went wrong, no questions generated for this round.");
        } else {
          setShowSummary(true);
        }
      }
    }
  }, [round, cuestionIndex]);

  const setQuiz = (datums) => {
    setRound({ title: "Title here", datums, ignorePunctuation: true });
    setShowStart(false);
    setShowRound(true);
  };

  // Start Quiz
  const startQuiz = (filename) => {
    let beEnv = "prod";
    let langQ = "POL";
    let langA = "ENG";
    let formulaTopics = null;
    let formulaDifficulty = null;
    let iterations = 4;

    if (useDummyData) {
      let dummyDatums = [
        {
          question: "Sekretarka je melony.",
          answers: ["The secretary eats melons."],
          datum: {
            questionSentenceArr: ["Sekretarka je melony."],
            answerSentenceArr: ["The secretary eats melons."],
          },
          allAnswers: [],
        },
        {
          question: "Śledcza je kukurydze.",
          answers: [
            "The detective eats maize.",
            "The detective eats corn.",
            "The investigator eats maize.",
            "The investigator eats corn.",
          ],
          datum: {
            questionSentenceArr: ["Śledcza je kukurydze."],
            answerSentenceArr: [
              "The detective eats maize.",
              "The detective eats corn.",
              "The investigator eats maize.",
              "The investigator eats corn.",
            ],
          },
          allAnswers: [],
        },
      ];
      setQuiz(dummyDatums);
      return;
    }

    getUtils
      .fetchPalette(
        beEnv,
        langQ,
        langA,
        formulaTopics,
        formulaDifficulty,
        iterations
      )
      .then((datums) => {
        setQuiz(datums);
      });
  };

  // Check Answer
  const checkAnswer = (event, selected, putativeScore, modifiers, cuestion) => {
    let answers = cuestion.answers;
    let halfMarkAnswers = cuestion.halfMarkAnswers;
    let allAnswers = cuestion.allAnswers || [];
    let [mark, answerYouMatched] = dataU.validateAnswer(
      selected,
      answers,
      halfMarkAnswers,
      modifiers,
      allAnswers
    );

    cuestion["yourAnswer"] = selected;
    cuestion["yourMark"] = mark;
    cuestion["answerYouMatched"] = answerYouMatched;
    cuestion["answers"].sort(
      (a, b) => Number(b === answerYouMatched) - Number(a === answerYouMatched)
    );

    if (!selectedAnswer) {
      setCuestionIsFinished(true);
      setSelectedAnswer(selected);

      const incrementScores = (scoreToAdd, multiplier = 1) => {
        scoreToAdd = Math.ceil(scoreToAdd * multiplier);
        setScoreJustReceived(scoreToAdd);
        setScore((prev) => prev + scoreToAdd);
        setTotalCorrect((prev) => prev + multiplier);
      };

      if (mark) {
        incrementScores(putativeScore, mark);
      }
    }
  };

  // Next Cuestion
  const moveForward = () => {
    // Go to next cuestion
    setCuestionIsFinished();
    setScoreJustReceived(0);
    setSelectedAnswer("");
    if (optionsHaveChanged) {
      setCuestionIndex(0);
      setOptionsHaveChanged();
      setTimeout(() => {
        setCuestionIndex((prev) => prev + 1);
      }, 250);
    } else {
      setCuestionIndex((prev) => prev + 1);
      setPlayerCuestionIndex((prev) => prev + 1);
    }
  };

  // Start Over
  const returnToStart = () => {
    setShowRound(false);
    setShowSummary(false);
    setRound();
    setCuestion();
    setShowStart(true);
    setCuestionIsFinished();
    setSelectedAnswer("");
    setCuestionIndex(0);
    setPlayerCuestionIndex(0);
    setScore(0);
    setTotalCorrect(0);
    const wrongBtn = document.querySelector("button.bg-danger");
    wrongBtn?.classList.remove("bg-danger");
    const rightBtn = document.querySelector("button.bg-success");
    rightBtn?.classList.remove("bg-success");
  };

  return (
    <DataContext.Provider
      value={{
        startQuiz,
        showStart,
        showRound,
        showSummary,
        cuestion,
        round,
        setRound,
        checkAnswer,
        cuestionIsFinished,
        cuestionIndex,
        playerCuestionIndex,
        moveForward,
        score,
        returnToStart,
        scoreJustReceived,
        totalCorrect,
        setOptionsHaveChanged,
        useDummyData,
        setUseDummyData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
