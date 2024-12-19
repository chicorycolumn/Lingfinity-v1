import React, { useContext, useState, useEffect } from "react";
import DataContext from "../context/dataContext";
import Question from "./Cogs/Question.jsx";
const dispU = require("../utils/displayUtils.js");

const Quiz = () => {
  const {
    showRound,
    showSummary,
    cuestion,
    round,
    score,
    scoreJustReceived,
    checkAnswer,
    cuestionIsFinished,
    playerCuestionIndex,
    moveForward,
    returnToStart,
    totalCorrect,
    setRound,
    setOptionsHaveChanged,
  } = useContext(DataContext);

  const [startTime, setStartTime] = useState(new Date());
  const [showOptions, setShowOptions] = useState();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (showRound) {
      document.getElementById("writeAnswerField").focus();
      setStartTime(new Date());
    }
  }, [showRound, playerCuestionIndex]);

  useEffect(() => {
    const listenForEnter = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        exitQuiz(true);
      }
    };

    if (showSummary) {
      setTimeout(() => {
        document.addEventListener("keyup", listenForEnter);
      }, 2000);
    }

    return () => {
      document.removeEventListener("keyup", listenForEnter);
    };
  }, [showSummary]);

  useEffect(() => {
    const listenForEscape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        exitQuiz();
      }
    };

    if (round) {
      document.addEventListener("keyup", listenForEscape);

      if (round.options && round.options.length) {
        round.options.sort((x, y) => x.localeCompare(y));
        let opts = [];
        round.options.forEach((opt) => {
          if (opt.includes("::")) {
            let catName = opt.split("::")[0];
            if (
              !opts.some((op) => op.type === "name" && op.value === catName)
            ) {
              opts.push({
                type: "name",
                value: catName,
              });
            }
            opts.push({
              type: "value",
              value: opt.split("::")[1],
              combined: opt,
            });
          } else {
            opts.push({ type: "value", value: opt, combined: opt });
          }
        });
        setOptions(opts || []);
      }
    }

    return () => {
      document.removeEventListener("keyup", listenForEscape);
    };
  }, [round]);

  const [playerInput, setPlayerInput] = useState("");

  const wrapperMoveForward = () => {
    setPlayerInput("");
    moveForward();
  };

  const wereYouCorrect = () => {
    let color = "#3d3d3d";

    if (cuestion && Object.keys(cuestion).includes("yourMark")) {
      if (cuestion.yourMark === 1) {
        color = "bg-success";
      } else if (cuestion.yourMark === 0.5) {
        color = "bg-warning";
      } else if (cuestion.yourMark === 0) {
        color = "bg-danger";
      }
    }

    return color;
  };

  const getPercentage = () => {
    return (
      Math.round(
        (totalCorrect / (playerCuestionIndex + (cuestionIsFinished ? 1 : 0))) *
          100
      ) || 0
    );
  };

  const exitQuiz = (bypassConfirmation = false) => {
    if (
      bypassConfirmation ||
      window.confirm("Are you sure you want to exit? Your score will be reset.")
    ) {
      setPlayerInput("");
      setShowOptions();
      setOptions([]);

      returnToStart();
    }
  };

  return (
    <section
      className="redCard bg-dark text-white"
      style={{
        display: `${showRound ? "flex" : "none"}`,
      }}
    >
      <div className="orangeCard container">
        <div className="yellowCard row vh-100 align-items-start justify-content-center">
          <div className="col-lg-8 pb-5 greenCard">
            <div className="d-flex flex-column justify-content-between align-items-center gap-md-3 px-1">
              <div className="mt-3 d-flex w-100 justify-content-between align-items-center gap-md-3 px-1">
                <div className="w-25 d-flex justify-content-left">
                  <button
                    id="exit_button"
                    className="btn w-5 h-25 bg-primarycolordark text-light px-2 mb-1"
                    style={{
                      height: "8px",
                      paddingTop: 0.5,
                      paddingBottom: 0.5,
                    }}
                    onClick={exitQuiz}
                  >
                    EXIT
                  </button>
                </div>
                <div className="w-50 d-flex justify-content-center">
                  <h5 className="fs-normal lh-base text-right primarycolor">
                    {`${score}`}
                  </h5>
                  <span
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      fontSize: "20px",
                    }}
                  >
                    {`${round?.datums.length}/10 questions loaded.`}
                  </span>
                </div>
                <div className="w-25 d-flex justify-content-end">
                  <h5
                    className="fs-normal lh-base text-right primarycolor"
                    onClick={() => {
                      console.log({ round });
                    }}
                  >
                    {`${getPercentage()}%`}
                  </h5>
                </div>
              </div>

              <h5 className="mt-2 mb-2 fs-normal lh-base text-left">
                {round?.title}
              </h5>
            </div>

            {options.length ? (
              <div>
                <button
                  style={{
                    background: "none",
                    color: "white",
                    fontSize: "10px",
                    width: "77.5px",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    if (showOptions) {
                      wrapperMoveForward();
                    }
                    setShowOptions((prev) => !prev);
                    setTimeout(() => {
                      if (round?.selectedOptions) {
                        round.selectedOptions.forEach((selectedOption) => {
                          let el = document.getElementById(
                            `option-${selectedOption}`
                          );
                          if (el) {
                            el.checked = true;
                          }
                        });
                      }
                    }, 50);
                  }}
                >
                  {`${showOptions ? "Save" : "Show"} options`}
                </button>
                {showOptions
                  ? options.map((option, optionIndex) => {
                      if (option.type === "name") {
                        return (
                          <p
                            className="my-0"
                            key={`${optionIndex}-name-${option.combined}`}
                          >
                            {option.value.toUpperCase()}
                          </p>
                        );
                      }
                      return (
                        <div key={`${optionIndex}-value-${option.combined}`}>
                          <input
                            type="checkbox"
                            id={`option-${option.combined}`}
                            name={`option-${option.combined}`}
                            onChange={(e) => {
                              e.stopPropagation();
                              setRound((prev) => {
                                if (!prev.selectedOptions) {
                                  prev.selectedOptions = [];
                                }
                                if (e.target.checked) {
                                  prev.selectedOptions.push(option.combined);
                                } else {
                                  prev.selectedOptions =
                                    prev.selectedOptions.filter(
                                      (x) => x !== option.combined
                                    );
                                }
                                return prev;
                              });
                              setOptionsHaveChanged(true);
                            }}
                          />
                          <label htmlFor={`option-${option.combined}`}>
                            {dispU.capitalise(option.value)}
                          </label>
                        </div>
                      );
                    })
                  : ""}
              </div>
            ) : (
              ""
            )}

            {showSummary ? (
              <div className="cyanCard card p-4">
                <div className="d-flex justify-content-center gap-md-3 mb-3">
                  <h5 className="mb-2 fs-normal lh-base">{`Results: ${getPercentage()}%`}</h5>
                </div>
                <div className="blueCard">
                  {round?.datums.map((cuestion, cuestionIndex) => (
                    <div
                      key={`summaryDiv-${cuestionIndex}`}
                      className={`option w-100 text-start btn text-white pt-1 pb-3 px-3 pt-3 mb-3 rounded btn-dark`} //${correctAnswer === item && "bg-success"}
                    >
                      <Question
                        cuestion={{
                          question: `${cuestionIndex + 1}. ${
                            cuestion.question
                          }`,
                        }}
                      />
                      <p
                        key={`summaryMark-${cuestionIndex}`}
                        className={`mt-3`}
                      >{`${dispU.convertMarkToEmoji(cuestion.yourMark)} ${
                        cuestion.yourMark >= 1
                          ? cuestion.answerYouMatched
                          : cuestion.yourAnswer
                      }`}</p>

                      <div key={`summaryAnswers-${cuestionIndex}`}>
                        {cuestion.answers
                          .filter((answer) => {
                            if (
                              cuestion.yourMark >= 1 &&
                              answer === cuestion.answerYouMatched
                            ) {
                              return false;
                            }
                            return true;
                          })
                          .map((answer, answerIndex) => (
                            // cuestion.yourMark < 1 ? "fw-bold" : "fst-italic"
                            <p
                              key={`summaryAnswer${cuestionIndex}-${answerIndex}`}
                              className={`my-0`}
                            >{`${
                              cuestion.yourMark < 1 ? "👉" : "➕"
                            } ${answer}`}</p>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  id="button:returnToMainMenu"
                  onClick={() => {
                    exitQuiz(true);
                  }}
                  className={`option w-100 text-center btn text-white py-2 px-3 mt-3 rounded btn-dark bg-success`}
                >
                  Return to main menu
                </button>
              </div>
            ) : (
              <div className="cyanCard card p-4">
                <div className="d-flex justify-content-between gap-md-3">
                  <Question cuestion={cuestion} />

                  <h5
                    className="primarycolor"
                    style={{
                      width: "100px",
                      textAlign: "right",
                    }}
                  >
                    {playerCuestionIndex + 1}
                  </h5>
                </div>
                <div>
                  <form>
                    <input
                      id="writeAnswerField"
                      type={cuestion?.inputType || "text"}
                      onChange={(e) => {
                        if (cuestionIsFinished) {
                          return;
                        }
                        setPlayerInput(e.target.value);
                      }}
                      value={playerInput}
                      placeholder="Type your answer..."
                      className={`option w-100 text-start btn text-white py-2 px-3 mt-3 rounded btn-dark`} //${correctAnswer === item && "bg-success"}
                    ></input>
                    <button
                      id="submitAnswerButton"
                      type="submit"
                      className={`option w-100 text-center btn text-white py-2 px-3 mt-3 rounded btn-dark ${wereYouCorrect()}`}
                      disabled={!playerInput}
                      onClick={(event) => {
                        event.preventDefault();
                        if (cuestionIsFinished) {
                          wrapperMoveForward();
                        }
                        if (playerInput) {
                          let secondsElapsed =
                            Math.floor(((new Date() - startTime) / 1000) * 10) /
                            10;
                          let putativeScore =
                            dispU.getPutativeScore(secondsElapsed);
                          checkAnswer(
                            event,
                            playerInput,
                            putativeScore,
                            round,
                            cuestion
                          );
                        }
                      }}
                    >
                      {cuestionIsFinished
                        ? scoreJustReceived
                          ? `+${scoreJustReceived}${
                              cuestion?.yourMark === 0.5
                                ? " (half points)"
                                : "!"
                            }`
                          : "Next"
                        : "Submit"}
                    </button>
                  </form>
                  {cuestionIsFinished ? (
                    <div
                      className={`option w-100 text-start btn text-white py-1 px-3 mt-3 rounded btn-dark`} //${correctAnswer === item && "bg-success"}
                    >
                      {cuestion.answers &&
                        cuestion.answers.map((ans, ansIndex) => (
                          <p className="my-2" key={`ans-${ansIndex}`}>
                            {"✅ " + ans}
                          </p>
                        ))}
                      {cuestion?.datum.notes &&
                        cuestion.datum.notes.map((note, noteIndex) => (
                          <p className="my-2" key={`note-${noteIndex}`}>
                            {"💡 " + note}
                          </p>
                        ))}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Quiz;
