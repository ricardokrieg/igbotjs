const moment = require('moment');
const { random, times } = require('lodash');
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

module.exports = { logHandler, stats, logger, sleep, quickSleep, longSleep, randomLimit, call, greetingMessage, randomLocation };

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


// TODO, old Bot functions
/*
 async checkInbox() {
 await this.setup();
 await inbox({ ig: this.ig });
 }

 async sendDM({ target }) {
 await this.setup();
 const spinner = new Spinner(this.accountDetails.message);

 log(`DMing ${target}`);

 const targetPk = await this.ig.user.getIdByUsername(target);

 const thread = this.ig.entity.directThread([targetPk.toString()]);

 await call(() => { thread.broadcastText(greetingMessage()) });
 await quickSleep();

 const message = spinner.unspinRandom(1)[0];
 await call(() => { thread.broadcastText(message) });

 log('Done');
 }

 async editProfile({ newUsername, name, bio, url, profilePic }) {
 await this.setup();

 const currentUser = await this.ig.account.currentUser();
 log(currentUser);

 let options = {
 external_url: url,
 gender: currentUser.gender,
 phone_number: '',
 username: newUsername,
 first_name: name,
 biography: bio,
 email: currentUser.email,
 };
 log('Options:');
 log(options);

 log('Editing profile...');
 let result = await call(() => { return this.ig.account.editProfile(options) });
 log(result);

 log('Changing profile picture...');
 const readStream = fs.createReadStream(profilePic);
 result = await call(() => { return this.ig.account.changeProfilePicture(readStream) });
 log(result);

 log('Done');
 }

 // async comment() {
 //   await this.setup();
 //
 //   const usernames = [
 //     '_garotafit.oficial',
 //     '_gata.fit_',
 //     'gatinhajuhhhh',
 //   ];
 //   const comments = [
 //     '😍 bjs',
 //     'bjs 😍 ',
 //     'beijinhos',
 //     'amei',
 //     'wow',
 //     'uau',
 //   ];
 //
 //   for (let i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
 //   for (let username of usernames) {
 //     const targetPk = await this.ig.user.getIdByUsername(username);
 //     const userFeed = this.ig.feed.user(targetPk);
 //
 //     const myPostsFirstPage = await userFeed.items();
 //
 //     const result = await call(() => {
 //       return this.ig.media.comment({
 //         mediaId: sample(myPostsFirstPage).id,
 //         text: sample(comments),
 //       });
 //     });
 //     await stats(this.statsCol, this.accountDetails._id, 'comment', username);
 //     log(result);
 //
 //     longSleep();
 //   }
 //   }
 //
 //   log('Done');
 // }
 */