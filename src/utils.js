const moment = require('moment');
const { random } = require('lodash');
const Spinner = require('node-spintax');


const logger = (origin, message) => {
  console.log(`[${moment().format('LTS')}][${origin}] ${typeof(message) === 'string' ? message : JSON.stringify(message)}`);
};

const sleep = (ms) => {
  logger('Sleep', `Sleeping ${Math.round(ms / 1000)}s`);
  return new Promise(resolve => setTimeout(resolve, ms));
};

const quickSleep = () => {
  return sleep(random(5000, 20000));
};

const longSleep = () => {
  return sleep(random(30000, 60000));
};

const randomLimit = (limit) => {
  return Math.round(random(limit - (limit * 0.5), limit + (limit * 0.5)));
};

async function call(command, ...params) {
  return new Promise(async (resolve, reject) => {
    let r;
    let tries = 0;
    while (true) {
      try {
        tries++;

        r = await command(params);

        break;
      } catch (err) {
        logger('Call', `Error: ${err}`);

        if (tries < 5) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          throw err;
        }
      }
    }

    resolve(r);
  });
}

function greetingMessage() {
  const greeting = moment().hour() < 12 ? 'bom dia' : (moment().hour() < 18 ? 'boa tarde' : 'boa noite');
  const spinner = new Spinner(`{Oi|Oie|Olá|Oii}, ${greeting}`);
  return spinner.unspinRandom(1)[0];
}

module.exports = { logger, sleep, quickSleep, longSleep, randomLimit, call, greetingMessage };

/*async scrape(sourceUsername, limit) {
  await this.setup();

  this.log('Scrape Start');
  this.log(`Scraping ${limit} followers from ${sourceUsername}...`);

  const source = await this.call((params) => { return this.ig.user.searchExact(params[0]) }, sourceUsername);
  this.log('Source:');
  this.log(source);

  this.log(`Fetching ${source.username}'s followers...`);
  const followersFeed = this.ig.feed.accountFollowers(source.pk);

  const blacklist = map(await this.targetsCol.find({ blacklisted: true }).toArray(), '_id');

  this.log('Blacklist:');
  this.log(blacklist);

  let scrapeCount = 0;
  let page = 0;
  while (true) {
    page++;

    if (scrapeCount >= limit) {
      break;
    }

    this.log(`Page #${page}`);

    const items = await this.call((params) => { return params[0].items() }, followersFeed);

    const validUsers = filter(items, { 'is_private': false, 'is_verified': false, 'has_anonymous_profile_picture': false });
    this.log(`Fetched: ${items.length} users (valid: ${validUsers.length})`);

    const friendship = await this.call((params) => { return this.ig.friendship.showMany(map(params[0], 'pk')) }, validUsers);

    for (const user of validUsers) {
      if (includes(blacklist, user.username)) {
        continue;
      }

      this.log(`User: ${user.username}`);

      if (some(values(friendship[user.pk]))) {
        await this.targetsCol.updateOne(
          { _id: user.username },
          { $set: {
            pk: user.pk,
            account: this.username,
            follower_of: sourceUsername,
            followed: true,
            blacklisted: false,
          } },
          { upsert: true }
        );
        this.log(`Rejected (friendship status)`);
        continue;
      }

      try {
        await this.targetsCol.insertOne({
          _id: user.username,
          pk: user.pk,
          account: this.username,
          follower_of: sourceUsername,
          followed: false,
          blacklisted: false,
        });
        scrapeCount++;
      } catch (err) {
        if (err.name !== 'MongoError') {
          throw err;
        }
      }

      if (scrapeCount >= limit) {
        break;
      }
    }
  }

  this.log('Scrape End');
}*/
