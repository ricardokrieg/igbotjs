const { includes, filter, map, random, sample, sampleSize } = require('lodash');
const moment = require('moment');
const Spinner = require('node-spintax');

const { logger, longSleep, call, randomLimit } = require('../utils');

const log = (message) => logger('Direct', message);


async function dmFollowers({ ig, accountDetails, dmsCol }) {
  log('Start');

  const spinner = new Spinner(accountDetails.message);
  log(`Spinner total variations: ${spinner.countVariations()}`);

  const dmLimit = randomLimit(accountDetails.dmLimit / accountDetails.activeHours);
  log(`Going to DM ${dmLimit} followers`);

  const blacklist = map(await dmsCol.find().toArray(), 'pk');
  const followersFeed = ig.feed.accountFollowers();

  let dmCount = 0;
  let page = 0;
  while (true) {
    page++;
    log(`Fetching page #${page}...`);
    const followers = await call(() => { return followersFeed.items(); });

    for (const follower of followers) {
      if (includes(blacklist, follower.pk)) {
        continue;
      }

      log(`DMing ${follower.username}`);

      await longSleep();

      const thread = ig.entity.directThread([follower.pk.toString()]);

      const message = spinner.unspinRandom(1)[0];
      await call(() => { thread.broadcastText(message) });

      await dmsCol.insertOne({ _id: follower.username, pk: follower.pk, account: accountDetails._id, message: message });

      dmCount++;

      log(`DMs: ${dmCount}/${dmLimit}`);

      if (dmCount >= dmLimit) {
        break;
      }
    }

    if (dmCount >= dmLimit) {
      break;
    }
  }

  log(`DMed ${dmCount} followers`);
}

async function inbox({ ig }) {
  log('Start');

  const inboxFeed = ig.feed.directInbox();
  const threads = await call(() => { return inboxFeed.items(); });

  for (thread of threads) {
    const targetId = thread.users[0].pk;
    const lastItem = thread.last_permanent_item;

    log(`[${thread.thread_title}]`);
    const sender = lastItem.user_id === targetId ? thread.users[0].username : 'Me';
    const lastMessage = lastItem.item_type === 'link' ? lastItem.link.text : lastItem.text;
    log(`(${moment.unix(parseInt(lastItem.timestamp.slice(0, 10))).format('lll')}) ${sender}: ${lastMessage}`);
  }

  log('End');
}


async function sendMessage({ ig, target, message }) {
  log('Start');

  const userId = await ig.user.getIdByUsername(target);
  const thread = ig.entity.directThread([userId.toString()]);

  await call(() => { thread.broadcastText(message) });

  log('End');
}


module.exports = { inbox, sendMessage, dmFollowers };
