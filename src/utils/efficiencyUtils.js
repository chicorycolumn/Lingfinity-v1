exports.curryCheckTimeout = (startTime, timeLimitSeconds) => {
  return (label) => {
    let currentTime = Date.now();

    let timeLimitMilliseconds = timeLimitSeconds * 1000;
    if (currentTime - startTime >= timeLimitMilliseconds) {
      console.log(
        `"${label}" timed out because more than ${timeLimitSeconds} seconds have elapsed since startTime ${startTime}.`
      );
      return true;
    }
  };
};
