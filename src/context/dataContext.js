import { createContext, useState, useEffect } from "react";

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const [quizs, setQuizs] = useState([]);
  const [cuestion, setCuestion] = useState({});
  const [cuestionIndex, setCuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [marks, setMarks] = useState(0);

  // Display Controlling States
  const [showStart, setShowStart] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Load JSON Data
  useEffect(() => {
    fetch("quiz.json")
      .then((res) => res.json())
      .then((data) => setQuizs(data));
  }, []);

  // Set a Single Cuestion
  useEffect(() => {
    if (quizs.length > cuestionIndex) {
      setCuestion(quizs[cuestionIndex]);
    }
  }, [quizs, cuestionIndex]);

  // Start Quiz
  const startQuiz = () => {
    setShowStart(false);
    setShowQuiz(true);
  };

  const stripSentence = (s) => {
    return s
      ? s
          .toLowerCase()
          .split("")
          .filter((char) => /\p{Script=Latin}/u.test(char))
          .join("")
      : "";
  };

  const validateAnswer = (correctArr, proposedStr) => {
    correctArr = correctArr.map((c) => stripSentence(c));
    proposedStr = stripSentence(proposedStr);
    return correctArr.includes(proposedStr);
  };

  // Check Answer
  const checkAnswer = (event, selected) => {
    let isCorrect = validateAnswer(cuestion.answerSentenceArr, selected);

    if (!selectedAnswer) {
      setCorrectAnswers(cuestion.answerSentenceArr);
      setSelectedAnswer(selected);

      if (isCorrect) {
        event.target.classList.add("bg-success");
        setMarks(marks + 5);
      } else {
        event.target.classList.add("bg-danger");
      }
    }
  };

  // Next Cuestion
  const nextCuestion = () => {
    setCorrectAnswers([]);
    setSelectedAnswer("");
    const wrongBtn = document.querySelector("button.bg-danger");
    wrongBtn?.classList.remove("bg-danger");
    const rightBtn = document.querySelector("button.bg-success");
    rightBtn?.classList.remove("bg-success");
    setCuestionIndex(cuestionIndex + 1);
  };

  // Show Result
  const showTheResult = () => {
    setShowResult(true);
    setShowStart(false);
    setShowQuiz(false);
  };

  // Start Over
  const startOver = () => {
    setShowStart(false);
    setShowResult(false);
    setShowQuiz(true);
    setCorrectAnswers([]);
    setSelectedAnswer("");
    setCuestionIndex(0);
    setMarks(0);
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
        showQuiz,
        cuestion,
        quizs,
        checkAnswer,
        correctAnswers,
        selectedAnswer,
        cuestionIndex,
        nextCuestion,
        showTheResult,
        showResult,
        marks,
        startOver,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
