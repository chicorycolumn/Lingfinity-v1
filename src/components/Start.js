import React, { useContext, useState, useEffect } from "react";
import DataContext from "../context/dataContext";
import mainLogo from ".././logo512.png";
const getUtils = require("../utils/getUtils.js");

const Start = () => {
  const [formulaTopics, setFormulaTopics] = useState(null);
  const [loadingError, setLoadingError] = useState();
  const [desiredFormulaTopics, setDesiredFormulaTopics] = useState([]);

  const { startQuiz, showStart, useDummyData, setUseDummyData } =
    useContext(DataContext);

  useEffect(() => {
    if (!formulaTopics) {
      getUtils.fetchFormulaTopics().then((fetchedFormulaTopics) => {
        if (fetchedFormulaTopics) {
          setFormulaTopics(
            fetchedFormulaTopics.map((s) => {
              let split = s.split("/");
              return {
                name: split[1],
                values: split[0],
              };
            })
          );
          setLoadingError();
        } else {
          setLoadingError("Could not load topics!");
        }
      });
    }
  }, [formulaTopics]);

  return (
    <section
      className="text-white text-center bg-dark"
      style={{ display: `${showStart ? "block" : "none"}`, height: "100vh" }}
    >
      <button
        onClick={() => {
          setUseDummyData((prev) => !prev);
        }}
        style={{ position: "absolute", right: 0, width: "140px" }}
      >{`${useDummyData ? "Using dummy 🤡" : "Use dummy data"}`}</button>
      <div className="container" style={{ display: "block", height: "100%" }}>
        <div
          className="row align-items-center justify-content-center"
          style={{ display: "block", height: "100%" }}
        >
          <div
            className="lg-8 pb-1 pt-1 d-flex flex-column align-items-center"
            style={{ display: "block", height: "100%" }}
          >
            <img src={mainLogo} alt="Lingfinity logo" className="h-25" />
            <h1 className="fw-bold mb-4 primarycolor sans-serif fst-italic">
              Lingfinity
            </h1>

            <button
              className={`btn w-50 px-4 mb-3 py-2 text-dark fw-bold bg-light`}
              disabled={!desiredFormulaTopics.length}
              onClick={(e) => {
                e.preventDefault();
                let desiredFormulaTopicsArray = [];
                desiredFormulaTopics.forEach((ft) => {
                  desiredFormulaTopicsArray.push(...ft.values.split(","));
                });

                startQuiz(desiredFormulaTopicsArray);
              }}
            >
              {loadingError
                ? loadingError
                : desiredFormulaTopics.length
                ? "Start"
                : formulaTopics
                ? "Select topics below"
                : "Loading topics..."}
            </button>

            <div className="qontainer">
              <div className="grid-row">
                {formulaTopics
                  ? formulaTopics.map((fTopicObj, fTopicObjIndex) => (
                      <div
                        className="grid-item"
                        key={`grid-item-${fTopicObjIndex}`}
                      >
                        <div
                          className="grid-item-wrapper"
                          key={`grid-item-wrapper-${fTopicObjIndex}`}
                        >
                          <button
                            key={`fTopicName-${fTopicObjIndex}`}
                            onDoubleClick={() => {
                              setDesiredFormulaTopics((prev) =>
                                prev.length === formulaTopics.length
                                  ? []
                                  : formulaTopics
                              );
                            }}
                            onClick={() => {
                              setDesiredFormulaTopics((prev) => {
                                if (
                                  prev.filter(
                                    (ft) => ft.name === fTopicObj.name
                                  ).length
                                ) {
                                  let res = [];
                                  prev.forEach((ft) => {
                                    if (ft.name !== fTopicObj.name) {
                                      res.push(fTopicObj);
                                    }
                                  });
                                  return res;
                                } else {
                                  let res = [...prev];
                                  res.push(fTopicObj);
                                  return res;
                                }
                              });
                            }}
                            className={`btn text-dark fw-bold ${
                              desiredFormulaTopics.filter(
                                (ft) => ft.name === fTopicObj.name
                              ).length
                                ? "bg-success"
                                : "bg-light"
                            } grid-item-qontainer`}
                          >
                            {fTopicObj.name}
                          </button>
                        </div>
                      </div>
                    ))
                  : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Start;
