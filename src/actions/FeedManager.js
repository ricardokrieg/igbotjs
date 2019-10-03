const { logHandler, quickSleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { isEmpty, sampleSize, map, filter, sample, random } = require('lodash');

const SessionManager = require('../SessionManager');


class FeedManager {
  constructor({ username, ig, addStats }) {
    this.username = username;
    this.ig       = ig;
    this.addStats = addStats;
  }

  async run({ feedLimit }) {
    log(`Going to like ${feedLimit} posts`);

    const timeline = this.ig.feed.timeline({ reason: 'pull_to_refresh' });

    let likesCount = 0;
    let page = 0;
    let nextPage = 50;
    while (true) {
      page++;
      log(`Fetching page #${page}...`);
      const items = await SessionManager.call(() => timeline.items() );

      if (isEmpty(items)) {
        log.warn(`Reached end of feed.`);
        break;
      }

      const likeGroup = Math.ceil(random(feedLimit / 2, feedLimit));
      log(`Going to like ${likeGroup} post on this page`);
      const mediaIds = sampleSize(map(filter(items, { comment_likes_enabled: true, has_liked: false }), 'id'), likeGroup);
      log(`Fetched ${items.length} posts (valid: ${mediaIds.length})`);

      for (let mediaId of mediaIds) {
        log(`Liking ${mediaId}`);
        await quickSleep();

        await SessionManager.call(() => {
          this.ig.media.like({
            mediaId: mediaId,
            moduleInfo: {
              module_name: 'feed_timeline',
            },
            d: sample([0, 1]),
          });
        });

        await this.addStats({ type: 'like', reference: mediaId });

        likesCount++;
        log(`Likes: ${likesCount}/${feedLimit}`);

        if (likesCount >= feedLimit) {
          break;
        }
      }

      if (likesCount >= feedLimit) {
        log(`Done liking. Next Page: ${nextPage}%`);

        if (random(0, 100) > nextPage) {
          break;
        } else {
          log(`Going to next page.`);
          nextPage = nextPage * 0.8;
        }
      }
    }

    log(`Liked ${likesCount} posts`);
  }
}

module.exports = FeedManager;
