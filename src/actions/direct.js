const { includes, filter, map, random, sample, sampleSize } = require('lodash');

const { logger, sleep, call } = require('../utils');

const log = (message) => logger('Direct', message);


async function dmFollowers({ ig, igUsername, dmsCol, dms }) {
  log('Start');

  const dmLimit = Math.round(random(dms - (dms * 0.5), dms + (dms * 0.5)));
  log(`Going to DM ${dmLimit} followers`);

  const blacklist = map(await dmsCol.find().toArray(), 'pk');
  log('Blacklist');
  log(blacklist);

  const followersFeed = ig.feed.accountFollowers();

  let dmCount = 0;
  let page = 0;
  while (true) {
    page++;
    log(`Fetching page #${page}...`);
    const followers = await call(() => { return followersFeed.items(); });

    for (const follower of followers) {
      log(`User: ${follower.username}`);

      if (includes(blacklist, follower.pk)) {
        log('Skip');
        continue;
      }

      await sleep(random(5000, 20000));

      const thread = ig.entity.directThread([follower.pk.toString()]);

      const message = 'Oi';
      await call(() => { thread.broadcastText(message) });

      await dmsCol.insertOne({ _id: follower.username, pk: follower.pk, account: igUsername, message: message });

      dmCount++;
      log(`DMed ${follower.username}`);

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

  log('Threads:');
  log(threads);

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
