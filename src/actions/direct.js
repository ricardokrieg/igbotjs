const { isUndefined, includes, filter, map, random, sample, sampleSize, isEmpty } = require('lodash');
const moment = require('moment');
const Spinner = require('node-spintax');
const chalk = require('chalk');

const { logHandler, stats, quickSleep, longSleep, call, randomLimit, greetingMessage } = require('../utils');
const SessionManager = require('../SessionManager');

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

async function inbox({ ig, showAll, callback, onlyForReply }) {
  log('Start');

  const inboxFeed = ig.feed.directInbox();
  const threads = await call(() => { return inboxFeed.items(); });

  for (const thread of threads) {
    const targetId = thread.users[0].pk;
    const lastItem = thread.last_permanent_item;

    const needsReply = lastItem.user_id === targetId;
    const sender = needsReply ? thread.users[0].username : 'Me';
    const lastMessage = lastItem.item_type === 'link' ? lastItem.link.text : lastItem.text;
    const timestamp = moment.unix(parseInt(lastItem.timestamp.slice(0, 10)));

    if (isUndefined(callback)) {
      const chalkSender = needsReply ? chalk['red'](sender) : sender;

      log(`[${thread.thread_title}]`);
      log(`(${timestamp.format('lll')}) ${chalkSender}: ${lastMessage}`);

      if (!isUndefined(showAll) && showAll) {
        log(thread);
      }
    } else {
      if (!onlyForReply || needsReply) {
        await callback({ ig, sender, targetId, lastMessage, timestamp });
      }
    }
  }

  log(`${threads.length} threads`);
  log('End');
}

async function sendMessage({ ig, pk, message }) {
  log('Start');

  const thread = ig.entity.directThread([pk.toString()]);

  // await SessionManager.call(() => { thread.broadcastText(message) });
  await thread.broadcastText(message);

  log('End');
}

async function sendProfile({ ig, pk, profileId }) {
  log('Start');

  const thread = ig.entity.directThread([pk.toString()]);

  await thread.broadcastProfile(profileId);

  log('End');
}

async function sendMessageWithUsername({ ig, target, message }) {
  log('Start');

  const userId = await ig.user.getIdByUsername(target);
  const thread = ig.entity.directThread([userId.toString()]);

  await SessionManager.call(() => { thread.broadcastText(message) });

  log('End');
}

async function sendMessageToGroup({ ig, targets, message }) {
  log('Start');

  let userIds = [];
  for (let target of targets) {
    const userId = await ig.user.getIdByUsername(target);
    userIds.push(userId.toString());
  }

  const thread = ig.entity.directThread(userIds);

  await SessionManager.call(() => { thread.broadcastText(message) });

  log('End');
}


module.exports = { inbox, sendMessage, sendProfile, sendMessageToGroup, dmFollowers };
