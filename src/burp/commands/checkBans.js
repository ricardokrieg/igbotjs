const debug = require('debug')('bot:ban');
const fs = require('fs');
const moment = require('moment');
const {defaultsDeep, filter, map, uniq} = require('lodash');
const request = require('request-promise');
const {json2csvAsync} = require('json-2-csv');
const parse = require('csv-parse/lib/sync');
const chance = require('chance').Chance();

const {getProxy, promiseTimeout, sleep} = require("../utils");

const BAN_REPORT_PATH = './log/banreport.log';
const SUCCESS_REPORT_PATH = './log/successreport.log';

const getLogs = (path) => {
  return filter(fs.readdirSync(path), (log) => !log.includes(`report`));
};

const extractInfo = (file) => {
  const data = fs.readFileSync(file, 'utf8');

  let country, proxy, ip, username, follows;
  let match, firstDate, lastDate;
  for (let line of data.split("\n")) {
    if (match = /(.*?).\d{3}Z .*/.exec(line)) {
      if (firstDate === undefined) {
        firstDate = moment(match[1]);
      }
      lastDate = moment(match[1]);
    }

    if (match = /bot:dizu Country: (.*)/.exec(line)) {
      country = match[1];
    }

    if (match = /bot:dizu Proxy: (.*)/.exec(line)) {
      proxy = match[1];
    }

    if (match = /bot:dizu IP: (.*)/.exec(line)) {
      ip = match[1];
    }

    if (match = /bot:dizu Username: (.*)/.exec(line)) {
      username = match[1];
    }

    if (match = /bot:dizu Follows: (.*)/.exec(line)) {
      follows = parseInt(match[1]);
    }
  }

  const diff = moment(Date.now()).diff(lastDate, 'hours');
  if (diff === 0 || username === `undefined` || username === undefined || follows === undefined || follows === 0) {
    return null;
  }

  const info = {
    country,
    proxy,
    ip,
    username,
    follows,
    start: firstDate,
    end: lastDate,
    activity: lastDate.diff(firstDate, 'hours'),
  };

  debug(info);
  return info;
};

const checkProfile = async (username) => {
  debug(`Checking profile ${username}`);

  const url = `/${username}/?__a=1`;
  const proxy = `http://xerzd:nDUYHMPq@conn4.trs.ai:62857`;
  // const proxy = getProxy(chance.pickone([0, 1])).address;
  // const proxy = getProxy(chance.pickone([0])).address;
  const options = { proxy, url };
  const headers = {
    'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9`,
    'User-Agent': `Mozilla/5.0 (iPhone; U; CPU iPhone OS 11_3_5 like Mac OS X; en-US) AppleWebKit/536.18.37 (KHTML, like Gecko) Version/13.1.3 Mobile/8F490 Safari/6533.18.5`,
    'Accept-Language': `en-US,en;q=0.9`,
    'Accept-Encoding': `gzip`,
    'cache-control': `max-age=0`,
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'sec-gpc': '1',
    'upgrade-insecure-requests': '1',
  };
  const defaultOptions = {
    baseUrl: `https://www.instagram.com`,
    gzip: true,
    headers,
    method: `GET`,
    resolveWithFullResponse: true,
    timeout: 30000,
  };

  try {
    const response = await promiseTimeout(60000, request(defaultsDeep({}, options, defaultOptions)))

    debug(response.body.slice(0, 20) + `...`);

    if (response.body[0] !== `{`) {
      process.exit(1);
    }

    if (response.body === `{}`) {
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  } catch (err) {
    debug(err.message);
    debug(err.response.statusCode);

    if (err.response.statusCode !== 404) {
      process.exit(1);
    }

    if (err.message.includes(`tunneling socket`) || err.message.includes(`tunneling socket`)) {
      process.exit(1);
    }

    return Promise.resolve(false);
  }
};

const saveProfileReport = async (info, success) => {
  info = {
    ...info,
    start: info.start.toISOString(),
    end: info.end.toISOString(),
    banned_at: moment(Date.now()).toISOString(),
    days_to_ban: moment(Date.now()).diff(info.start, 'days'),
  }

  const path = success ? SUCCESS_REPORT_PATH : BAN_REPORT_PATH;
  const data = await json2csvAsync(info, { prependHeader: false });

  fs.writeFileSync(path, data + "\n", { encoding: `utf8`, flag: `a+` });
};

const getBanList = () => {
  try {
    const data = fs.readFileSync(BAN_REPORT_PATH, `utf8`);
    const columns = [`country`, `proxy`, `ip`, `username`, `follows`, `start`, `end`, `activity`, `banned_at`, `days_to_ban`];

    const records = parse(data, { delimiter: `,`, quote: `"`, columns });

    return uniq(map(records, (record) => record.username));
  } catch (err) {
    debug(err.message);
    return [];
  }
};

const getSuccessList = () => {
  try {
    const data = fs.readFileSync(SUCCESS_REPORT_PATH, `utf8`);
    const columns = [`country`, `proxy`, `ip`, `username`, `follows`, `start`, `end`, `activity`, `banned_at`, `days_to_ban`];

    const records = parse(data, { delimiter: `,`, quote: `"`, columns });

    return uniq(map(records, (record) => record.username));
  } catch (err) {
    debug(err.message);
    return [];
  }
};

(async () => {
  debug(`Start`);

  const banList = getBanList();
  debug(`Ban List (${banList.length} entries): ${banList}`);

  const successList = getSuccessList();
  debug(`Success List (${successList.length} entries): ${successList}`);

  const path = `./log`;
  const logs = getLogs(path);

  debug(`Total: ${logs.length} log files`);

  let i = 0;
  for (let log of logs) {
    i++;
    debug(`Profile #${i} (${log})`);

    const info = extractInfo(`${path}/${log}`);
    if (info === null) continue;

    if (banList.includes(info.username) || successList.includes(info.username)) {
      debug(`Skip ${info.username}`);
      continue;
    }

    const success = await checkProfile(info.username);

    debug(`${info.username}: ${success ? 'OK' : 'BANNED'}`);
    await saveProfileReport(info, success);

    // if (i >= 10) break;
    await sleep(10 * 1000);
  }

  debug(`End`);
})();
