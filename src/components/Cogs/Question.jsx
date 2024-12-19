import React from "react";

const punctuation = ".?!,";

const getTips = (q) => {
  let res = [];
  let bracketed = [];
  q = q.split(" ");
  q.forEach((w, i) => {
    if (w[0] === "(" || bracketed.length) {
      if (w.includes(")")) {
        let splitW = w.split(")");
        w = splitW[0] + ")";
        if (splitW[1]) {
          let punct = splitW[1];
          res.push({ word: punct, isPunct: true });
        }
      }

      bracketed.push(w);
      if (w.includes(")")) {
        let tip = bracketed.join(" ");
        let wobjTipPertainsTo = res[res.length - 1];
        if (wobjTipPertainsTo.isPunct) {
          wobjTipPertainsTo = res[res.length - 2];
        }
        wobjTipPertainsTo.tip = tip;
        bracketed = [];
      }
    } else {
      if (i === q.length - 1 && punctuation.includes(w[w.length - 1])) {
        res.push({ word: w.slice(0, w.length - 1) });
        res.push({ word: w[w.length - 1], isPunct: true });
      } else {
        res.push({ word: w });
      }
    }
  });
  return res;
};

const getSpace = (wobjIndex, q) => {
  return wobjIndex < q.length - 1 && q[wobjIndex + 1].isPunct ? "" : " ";
};

const Question = (props) => {
  let { cuestion } = props;

  if (!cuestion?.question) {
    return (
      <h5 className="mb-2 fs-normal lh-base tooltipHolder">
        No question found.
      </h5>
    );
  }

  let q = getTips(cuestion.question);

  return (
    <div>
      {q.map((wobj, wobjIndex) => {
        if (wobj.tip) {
          return (
            <h5
              key={`q-word-${wobjIndex}`}
              className="chunkedHeader mb-2 fs-normal lh-base"
            >
              <abbr title={wobj.tip}>{wobj.word}</abbr>
              {getSpace(wobjIndex, q)}
            </h5>
          );
        } else {
          return (
            <h5
              key={`q-word-${wobjIndex}`}
              className="chunkedHeader mb-2 fs-normal lh-base"
            >
              {wobj.word}
              {getSpace(wobjIndex, q)}
            </h5>
          );
        }
      })}
    </div>
  );
};

export default Question;
