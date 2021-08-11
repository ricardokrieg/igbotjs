const debug = require('debug')('bot:report');
const fs = require('fs');
const moment = require('moment');
const {uniqBy} = require('lodash');
const parse = require('csv-parse/lib/sync');

const DizuAPI = require('../DizuAPI');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.TZ = 'America/Fortaleza';

const BAN_REPORT_PATH = './log/banreport.log';
const SUCCESS_REPORT_PATH = './log/successreport.log';

const dizuApi = new DizuAPI();

const getBanList = () => {
  try {
    const data = fs.readFileSync(BAN_REPORT_PATH, `utf8`);
    const columns = [`country`, `proxy`, `ip`, `username`, `follows`, `start`, `end`, `activity`, `banned_at`, `days_to_ban`];

    const records = parse(data, { delimiter: `,`, quote: `"`, columns });

    return uniqBy(records, 'username');
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

    return uniqBy(records, 'username');
  } catch (err) {
    debug(err.message);
    return [];
  }
};

const getProfileStats = async (username) => {
  const stats = await dizuApi.getProfileStats(username);
  debug(stats);

  return stats;
};

const hideOrRemoveProfile = async (username) => {
  await dizuApi.hideOrRemoveProfile(username);
};

(async () => {
  debug(`Start`);

  let lowFollowSuccess = 0;
  let lowFollowBan = 0;
  let highFollowSuccess = 0;
  let highFollowBan = 0;

  const banList = getBanList();
  debug(`Ban List (${banList.length} entries):`);
  debug(banList);

  for (let profile of banList) {
    await hideOrRemoveProfile(profile.username);

    // if (moment(profile.start) < moment('2021-08-03')) continue;
    //
    // const stats = await getProfileStats(profile.username);
    //
    // if (stats.follows > 250) {
    //   highFollowBan += stats.income;
    // } else {
    //   lowFollowBan += stats.income;
    // }
    //
    // debug(`Current Stats:`);
    // debug(`lowFollowSuccess=${lowFollowSuccess}   lowFollowBan=${lowFollowBan}`);
    // debug(`highFollowSuccess=${highFollowSuccess}   highFollowBan=${highFollowBan}`);
  }

  process.exit(0);

  const successList = getSuccessList();
  debug(`Success List (${successList.length} entries):`);
  debug(successList);

  for (let profile of successList) {
    if (moment(profile.start) < moment('2021-08-03')) continue;

    const stats = await getProfileStats(profile.username);

    if (stats.follows > 250) {
      highFollowSuccess += stats.income;
    } else {
      lowFollowSuccess += stats.income;
    }

    debug(`Current Stats:`);
    debug(`lowFollowSuccess=${lowFollowSuccess}   lowFollowBan=${lowFollowBan}`);
    debug(`highFollowSuccess=${highFollowSuccess}   highFollowBan=${highFollowBan}`);
  }

  debug(`End`);
})();
