const { random } = require('lodash');
const debug = require('debug')('bot:soctool:utils');

const sign = (body) => {
  return `SIGNATURE.${JSON.stringify(body)}`;
};

const sleepForDay = async (day) => {
  const stage = 0;
  let ms;

  switch (day) {
    case 1:
    case 2:
    case 3:
      ms = random(70000, 140000);
      ms = random(100) < 40 ? ms * 5 : ms;
      break;
    case 4:
    case 5:
    case 6:
      ms = random(60000, 120000);
      ms = random(100) < 30 ? ms * 5 : ms;
      break;
    case 7:
    case 8:
    case 9:
      ms = random(50000, 100000);
      ms = random(100) < 20 ? ms * 5 : ms;
      break;
    default:
      ms = random(45000, 90000);
      ms = random(100) < 10 ? ms * 5 : ms;
      break;
  }

  debug(`Sleeping ${Math.round(ms / 1000)}s (day ${day})`);

  return new Promise(resolve => setTimeout(resolve, ms));
};

const getFollowCountForDay = (day) => {
  let min, max;

  switch (day) {
    case 1:
      min = 5;
      max = 10;
      break;
    case 2:
      min = 10;
      max = 20;
      break;
    case 3:
      min = 20;
      max = 30;
      break;
    case 4:
      min = 30;
      max = 50;
      break;
    case 5:
      min = 30;
      max = 50;
      break;
    case 6:
      min = 0;
      max = 0;
      break;
    case 7:
      min = 50;
      max = 70;
      break;
    case 8:
      min = 70;
      max = 100;
      break;
    case 9:
      min = 80;
      max = 100;
      break;
    default:
      min = 200;
      max = 350;
      break;
  }

  return {
    followCount: random(min, max),
    minFollowCount: min,
    maxFollowCount: max,
  };
};

module.exports = {
  sign,
  sleepForDay,
  getFollowCountForDay
}
