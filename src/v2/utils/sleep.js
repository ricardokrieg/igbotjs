const { random } = require('lodash');
const debug = require('debug')('bot:utils');

const sleep = (ms) => {
  debug(`Sleeping ${Math.round(ms / 1000)}s`);

  return new Promise(resolve => setTimeout(resolve, ms));
};

const quickSleep = () => {
  return sleep(random(5000, 20000));
};

const longSleep = () => {
  return sleep(random(30000, 60000));
};

const sleep24h = () => {
  return sleep(24 * 60 * 60 * 1000);
};

module.exports = { sleep, quickSleep, longSleep, sleep24h };