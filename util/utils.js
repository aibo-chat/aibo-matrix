const moment = require('moment');


function formatNow(format = 'YYYY-MM-DD HH:mm:ss SSS', time) {
  if (time) {
    const formatted_date = moment(time).format(format);
    return formatted_date;
  } else {
    const formatted_date = moment().format(format);
    return formatted_date;
  }
}

function createRateLimiter(limitCount) {
  let callCount = 0;
  let lastReset = Date.now();
  return async function (fn, over) {
    const now = Date.now();
    const elapsedSinceReset = now - lastReset;

    if (elapsedSinceReset > 60000) {
      callCount = 1;
      lastReset = now;
      return await fn();
    } else {
      if (callCount < limitCount) {
        callCount++;
        return await fn();
      } else {
        return await over();
      }
    }
  };
}

function tryJson(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
  }
}

module.exports = {
  createRateLimiter, formatNow, tryJson
}
