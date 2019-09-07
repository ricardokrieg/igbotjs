const { random, isEmpty } = require('lodash');

const { stats, logger, call } = require('../utils');

const log = (message) => logger('Stories', message);


async function stories({ ig, statsCol }) {
  log('Start');

  const reelsTray = ig.feed.reelsTray({ reason: 'pull_to_refresh' });

  const items = await call(() => { return reelsTray.items() });

  if (isEmpty(items)) {
    log(`No stories to watch`);
  }

  const storiesToWatch = items.slice(0, random(5, 20));
  log(`Watching ${storiesToWatch.length} stories...`);

  const result = await ig.story.seen(storiesToWatch);
  log(result);
  //await stats(statsCol, accountDetails._id, 'stories', followerUsername);

  log(`Watched ${storiesToWatch.length} stories`);
  log('End');
}

module.exports = { stories };
