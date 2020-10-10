const { includes, filter, map, random, sample, sampleSize, isEmpty } = require('lodash');
const moment = require('moment');
const Spinner = require('node-spintax');

const { logHandler, stats, quickSleep, longSleep, call, randomLimit, greetingMessage } = require('../utils');

const log = require('log-chainable').namespace(module).handler(logHandler);


async function dmFollowers({ ig, accountDetails, dmsCol, statsCol }) {
  log('Start');

  if (accountDetails.disableDM) {
    log(`DM is disabled for this account`);
    return;
  }

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

    if (isEmpty(followers)) {
      log(`Reached end of feed.`);
      break;
    }

    for (const follower of followers) {
      if (includes(blacklist, follower.pk)) {
        continue;
      }

      log(`DMing ${follower.username}`);

      await longSleep();

      const thread = ig.entity.directThread([follower.pk.toString()]);

      await call(() => { thread.broadcastText(greetingMessage()) });
      await quickSleep();

      const message = spinner.unspinRandom(1)[0];
      await call(() => { thread.broadcastText(message) });

      await dmsCol.insertOne({ _id: follower.username, pk: follower.pk, account: accountDetails._id, message: message });
      await stats(statsCol, accountDetails._id, 'dm', follower.username);

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

  for (const thread of threads) {
    const targetId = thread.users[0].pk;
    const lastItem = thread.last_permanent_item;

    log(`[${thread.thread_title}]`);
    const sender = lastItem.user_id === targetId ? thread.users[0].username : 'Me';
    const lastMessage = lastItem.item_type === 'link' ? lastItem.link.text : lastItem.text;
    log(`(${moment.unix(parseInt(lastItem.timestamp.slice(0, 10))).format('lll')}) ${sender}: ${lastMessage}`);
  }

  log(`${threads.length} threads`);
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
