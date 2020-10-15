const moment = require('moment');
const { random, times, isEmpty, isUndefined } = require('lodash');
const Spinner = require('node-spintax');
const defaultHandler = require('log-chainable/handlers').minimalConsoleColorized;

const logHandler = (level, nameStack, args) => {
  const nameStackLength = nameStack.join('.').length;
  const paddingLeft = times(5 - level.length, () => ' ').join('');
  const paddingRight = times(Math.max(15, nameStackLength) - nameStackLength, () => ' ').join('');

  defaultHandler(
    level,
    [`${paddingLeft}${nameStack.join('.')}${paddingRight}`],
    [ moment().format('LTS'), ...args ]
  );
};

const log = require('log-chainable').namespace(module).handler(logHandler);

const sleep = (ms) => {
  log(`Sleeping ${Math.round(ms / 1000)}s`);

  const sandbox = !isEmpty(process.env.SANDBOX);

  return new Promise(resolve => setTimeout(resolve, sandbox ? 0 : ms));
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

const randomLimit = (limit) => {
  return Math.round(random(limit - (limit * 0.5), limit + (limit * 0.5)));
};

async function call(command, ...params) {
  return new Promise(async (resolve, reject) => {
    let r;
    let tries = 0;
    let error = null;
    while (true) {
      try {
        tries++;

        r = await command(params);

        break;
      } catch (err) {
        console.error(`[${moment().format('LTS')}][Call] ${err}`);

        if (err.name === 'IgActionSpamError') {
          error = err;
          break;
        } else {
          if (tries < 5) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          } else {
            error = err;
            break;
          }
        }
      }
    }

    if (error === null) {
      resolve(r);
    } else {
      reject(error);
    }
  });
}

function greetingMessage() {
  const greeting = moment().hour() < 12 ? 'bom dia' : (moment().hour() < 18 ? 'boa tarde' : 'boa noite');
  const spinner = new Spinner(`{Oi|Oie|Olá|Oii}, ${greeting}`);
  return spinner.unspinRandom(1)[0];
}

function randomLocation() {
  return {
    latitude: random(-23999999, -22000001) / 1000000.0,
    longitude: random(-46999999, -45000001) / 1000000.0,
  };
}

async function stats(col, account, type, reference) {
  await col.insertOne({ account, type, reference, timestamp: new Date() });
}

function randomBirthday() {
  return {
    day: random(1, 28),
    month: random(1, 12),
    year: random(1970, 2000),
  }
}

function generateUsername({ username }) {
  while (username.match(/\[RANDOM\]/gim)) {
    const randomStr = random(0, 9999);
    username = username.replace('[RANDOM]', randomStr);
  }

  return username;
}

module.exports = { logHandler, stats, sleep, quickSleep, longSleep, sleep24h, randomLimit, call, greetingMessage, randomLocation, randomBirthday, generateUsername };
