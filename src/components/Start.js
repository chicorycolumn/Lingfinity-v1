import React, { useContext } from "react";
import DataContext from "../context/dataContext";
import mainLogo from ".././logo_512.png";

const Start = () => {
  const { startQuiz, showStart } = useContext(DataContext);
  let roundNames = ["Round 1"];

  return (
    <section
      className="text-white text-center bg-dark"
      style={{ display: `${showStart ? "block" : "none"}`, height: "100vh" }}
    >
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

            <div
              className="mt-5 w-75 p-1 d-flex-row align-items-center justify-content-center shadow-primarycolor"
              style={{
                display: "block",
                overflowY: "scroll",
              }}
            >
              {roundNames.map((roundName, roundNameIndex) => (
                <button
                  key={`roundName-${roundNameIndex}`}
                  onClick={() => {
                    startQuiz(roundName);
                  }}
                  className="btn w-100 px-4 mb-1 py-2 bg-light text-dark fw-bold"
                >
                  {roundName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Start;
