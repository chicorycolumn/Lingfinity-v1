import { createContext, useState, useEffect, useRef } from "react";
const dataU = require("../utils/dataUtils.js");
const dispU = require("../utils/displayUtils.js");
const getUtils = require("../utils/getUtils.js");
const efUtils = require("../utils/efficiencyUtils.js");
const uUtils = require("../utils/universalUtils.js");
const executors = require("../utils/executors.js").executors;

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const [round, setRound] = useState();
  const roundActive = useRef(false);
  const [cuestion, setCuestion] = useState({});
  const [cuestionIndex, setCuestionIndex] = useState(0);
  const [playerCuestionIndex, setPlayerCuestionIndex] = useState(0);
  const [cuestionIsFinished, setCuestionIsFinished] = useState();
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [scoreJustReceived, setScoreJustReceived] = useState(0);
  const [optionsHaveChanged, setOptionsHaveChanged] = useState();
  const [useDummyData, setUseDummyData] = useState();

  // Display Controlling States
  const [showStart, setShowStart] = useState(true);
  const [showRound, setShowRound] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // // Load JSON Data
  // useEffect(() => {}, []);

  // Set a Single Cuestion
  useEffect(() => {
    if (round && round.roundLength) {
      if (round.roundLength > cuestionIndex) {
        if (round?.datums.length <= cuestionIndex) {
          dispU.startSpinner("purple");
          document.getElementById("submitAnswerButton").disabled = true;
          document.getElementById("writeAnswerField").disabled = true;
        } else {
          setCuestion((prevCuestion) => {
            return round.datums[cuestionIndex];
          });
        }
      } else {
        if (cuestionIndex === 0) {
          alert("Something went wrong, no questions generated for this round.");
        } else {
          setShowSummary(true);
        }
      }
    }
    return () => {
      dispU.stopSpinner();
      if (round?.datums.length >= cuestionIndex) {
        document.getElementById("submitAnswerButton").disabled = false;
        document.getElementById("writeAnswerField").disabled = false;
        document.getElementById("writeAnswerField").focus();
      }
    };
  }, [round, cuestionIndex]);

  const setQuiz = (datums) => {
    dispU.stopSpinner();
    setRound((prev) => {
      if (!prev) {
        return {
          title: "Title here",
          datums,
          ignorePunctuation: true,
          roundLength: useDummyData ? 2 : 10,
        };
      }

      let updatedRound = {};
      Object.keys(prev).forEach((roundKey) => {
        let value = prev[roundKey];
        if (Array.isArray(value)) {
          value = [...value];
        }

        updatedRound[roundKey] = value;
      });

      updatedRound["datums"].push(...datums);

      return updatedRound;
    });
    setShowStart(false);
    setShowRound(true);
  };

  const fetchPaletteBattery = (args, datumsTotalLength, checkTimeout) => {
    console.log(`Fetch question #${datumsTotalLength + 1}`);
    getUtils.fetchPalette(...args).then((res) => {
      if (!roundActive.current) {
        console.log("You exited quiz.");
        return;
      }

      if (res?.err?.code === "ERR_NETWORK") {
        dispU.stopSpinner();
        alert("Sorry, could not connect to API to get quiz for you.");
        return;
      }

      let { datums } = res;
      if (datums.length) {
        console.log(`Got question #${datumsTotalLength + 1}`);
        console.log("");
        setQuiz(datums);
        datumsTotalLength += datums.length;
      }

      if (checkTimeout("fetchPalette")) {
        return;
      }

      if (datumsTotalLength < 10) {
        fetchPaletteBattery(args, datumsTotalLength, checkTimeout);
      }
    });
  };

  // Start Quiz
  const startQuiz = (filename) => {
    roundActive.current = true;

    let beEnv = "prod";
    let langQ = "POL";
    let langA = "ENG";
    let formulaTopics = null;
    let formulaDifficulty = null;

    if (useDummyData) {
      let dummyDatums = [
        {
          question:
            "No więc, przypuszczam (🍲, thought) że prawda jest taka, że ta młoda (🍲, age) i miła pilotka je zioła (🍲, food)!",
          answers: ["The pilot eats herbs."],
          datum: {
            questionSentenceArr: ["Pilotka je zioła (🍲, food)."],
            answerSentenceArr: ["The pilot eats herbs."],
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

    let startTime = Date.now();
    let timeLimitSeconds = 120;

    const checkTimeout = efUtils.curryCheckTimeout(
      startTime,
      timeLimitSeconds,
      dispU.stopSpinner
    );

    let datumsTotalLength = 0;
    dispU.startSpinner("fuchsia");
    fetchPaletteBattery(
      [beEnv, langQ, langA, formulaTopics, formulaDifficulty],
      datumsTotalLength,
      checkTimeout
    );
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
    roundActive.current = false;
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
