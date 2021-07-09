const { logHandler, sleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { isEmpty } = require('lodash');

const SessionManager = require('../SessionManager');


class StoriesManager {
  constructor({ username, ig }) {
    this.username = username;
    this.ig       = ig;
  }

  async run({ storiesLimit }) {
    log(`Going to watch ${storiesLimit} stories`);

    const reelsTray = this.ig.feed.reelsTray({ reason: 'pull_to_refresh' });

    const items = await SessionManager.call(() => reelsTray.items() );

    if (isEmpty(items)) {
      log.warn(`No stories to watch`);
    }

    const storiesToWatch = items.slice(0, storiesLimit);
    log(`Watching ${storiesToWatch.length} stories...`);

    await sleep(storiesToWatch.length * 5000);
    const result = await this.ig.story.seen(storiesToWatch);
    log(result);

    log(`Watched ${storiesToWatch.length} stories`);
  }
}

module.exports = StoriesManager;
