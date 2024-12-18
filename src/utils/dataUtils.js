const strip = (s, modifiers) => {
  if (modifiers.ignorePunctuation) {
    return s || s === 0
      ? s
          .toString()
          .toLowerCase()
          .split("")
          .filter((char) => /\p{Script=Latin}/u.test(char))
          .join("")
          .trim()
      : "";
  }

  if (modifiers.ignorePunctuationAndDiacritics) {
    return s || s === 0
      ? s
          .toString()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .split("")
          .filter((char) => /\p{Script=Latin}/u.test(char))
          .join("")
          .trim()
      : "";
  }

  if (modifiers.ignorePunctuationAndDiacriticsAndBrackets) {
    if (typeof s === "string") {
      if (s.split("").includes("(")) {
        let cleaned = "";
        let ignoring = false;
        s.split("").forEach((char) => {
          if (!ignoring && !"()".includes(char)) {
            cleaned += char;
          }
          if (char === "(") {
            ignoring = true;
          }
          if (ignoring && char === ")") {
            ignoring = false;
          }
        });
        s = cleaned;
      }
    }

    return s || s === 0
      ? s
          .toString()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .split("")
          .filter((char) => /\p{Script=Latin}/u.test(char))
          .join("")
          .trim()
      : "";
  }

  return s || s === 0 ? s.toString().toLowerCase().trim() : "";
};

const checkIfOnePairSwitch = (a, b) => {
  if (!a || !a.length || !b || !b.length) {
    return false;
  }

  for (let i = 1; i < a.length; i++) {
    let firstMuddleIndex = i - 1;
    let secondMuddleIndex = i;
    let muddledA =
      a.slice(0, firstMuddleIndex) +
      a[secondMuddleIndex] +
      a[firstMuddleIndex] +
      a.slice(secondMuddleIndex + 1, a.length);

    if (muddledA === b) {
      return true;
    }
  }
};

const checkIfOneCharacterOut = (shorterAnswer, longerAnswer) => {
  let longerAnswerModified = [];
  let errorCount = 0;

  longerAnswer.split("").forEach((longChar, index) => {
    if (errorCount > 1) {
      return;
    }
    if (errorCount === 1) {
      index = index - 1;
    }
    let shortChar = shorterAnswer.length > index ? shorterAnswer[index] : false;
    if (longChar === shortChar) {
      longerAnswerModified.push(longChar);
    } else {
      errorCount++;
    }
  });

  if (errorCount > 1) {
    return false;
  }
  return longerAnswerModified.join("") === shorterAnswer;
};

const checkIfAnswerIfOneCharacterOut = (
  correctAnswerStripped,
  playerAnswerStripped,
  allAnswersStripped
) => {
  if (correctAnswerStripped === playerAnswerStripped) {
    return true;
  }

  const alphabeticalCharsOnly = (s) => /^\p{L}+$/gu.test(s);

  if (
    !alphabeticalCharsOnly(correctAnswerStripped) ||
    !alphabeticalCharsOnly(playerAnswerStripped)
  ) {
    return false;
  }

  if (correctAnswerStripped.length < 3 || playerAnswerStripped.length < 3) {
    return false;
  }

  if (
    allAnswersStripped
      .filter((a) => a !== correctAnswerStripped)
      .includes(playerAnswerStripped)
  ) {
    return false;
  }

  if (correctAnswerStripped.length === playerAnswerStripped.length) {
    let correctWithOnePairSwitched = checkIfOnePairSwitch(
      playerAnswerStripped,
      correctAnswerStripped
    );
    if (correctWithOnePairSwitched) {
      return true;
    }

    let errorCount = correctAnswerStripped
      .split("")
      .filter((correctChar, index) => {
        let playerChar = playerAnswerStripped[index];
        return correctChar !== playerChar;
      }).length;
    return errorCount <= 1;
  }

  if (correctAnswerStripped.length === playerAnswerStripped.length - 1) {
    return checkIfOneCharacterOut(correctAnswerStripped, playerAnswerStripped);
  }

  if (playerAnswerStripped.length === correctAnswerStripped.length - 1) {
    return checkIfOneCharacterOut(playerAnswerStripped, correctAnswerStripped);
  }
  return false;
};

export const validateAnswer = (
  playerAnswer,
  correctArr,
  halfCorrectArr = [],
  modifiers,
  allAnswers
) => {
  let res;
  let playerAnswerStripped = strip(playerAnswer, modifiers);
  let correctArrStripped = correctArr.map((s) => strip(s, modifiers));

  const getIndexOfMatchingCorrectAnswer = (
    arr,
    arrUnmodified,
    str,
    score,
    cb = (a, b) => a === b
  ) => {
    let res;
    arr.forEach((el, index) => {
      if (cb(el, str)) {
        res = [score, arrUnmodified[index]];
      }
    });
    return res;
  };

  res = getIndexOfMatchingCorrectAnswer(
    correctArrStripped,
    correctArr,
    playerAnswerStripped,
    1
  );
  if (res) {
    return res;
  }

  let halfCorrectArrStripped = halfCorrectArr.map((s) => strip(s, modifiers));

  res = getIndexOfMatchingCorrectAnswer(
    halfCorrectArrStripped,
    halfCorrectArr,
    playerAnswerStripped,
    0.5
  );
  if (res) {
    return res;
  }

  let allAnswersStripped = allAnswers.map((s) => strip(s, modifiers));

  const checkOneCharacterCurried = (a, b) => {
    return checkIfAnswerIfOneCharacterOut(a, b, allAnswersStripped);
  };

  res = getIndexOfMatchingCorrectAnswer(
    correctArrStripped,
    correctArr,
    playerAnswerStripped,
    1,
    checkOneCharacterCurried
  );
  if (res) {
    return res;
  }

  res = getIndexOfMatchingCorrectAnswer(
    halfCorrectArrStripped,
    halfCorrectArr,
    playerAnswerStripped,
    0.5,
    checkOneCharacterCurried
  );
  if (res) {
    return res;
  }

  return [0, null];
};
