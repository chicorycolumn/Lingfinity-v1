export const getPutativeScore = (secondsElapsed) => {
  let perfectScore = 1000;
  let putativeScore = perfectScore;
  if (secondsElapsed > 0.5 && secondsElapsed < 50) {
    let penalty = 50;
    let penaltyMod = 5;
    for (let i = 0.6; i <= secondsElapsed; i += 0.1) {
      putativeScore = perfectScore - penalty;
      penalty += penaltyMod;
      penaltyMod -= 0.01;
      if (penaltyMod < 1) {
        penaltyMod = 1;
      }
    }
  }
  if (putativeScore < 10) {
    putativeScore = 10;
  }
  let calculatedScore = Math.floor(putativeScore);
  return calculatedScore;
};

export const capitalise = (s) => {
  if (s) {
    return s[0].toUpperCase() + s.slice(1);
  }
};

export const convertMarkToEmoji = (mark) => {
  if (mark > 1) {
    return "🏆";
  }
  if (mark === 1) {
    return "✅";
  }
  if (mark > 0) {
    return "🆗";
  }
  if (mark === 0) {
    return "❌";
  }
};
