const { logHandler, quickSleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { pick, isEmpty, sampleSize, map, filter, sample, random } = require('lodash');

const SessionManager = require('../SessionManager');


class FeedManager {
  constructor({ username, ig, addStats, addAction }) {
    this.username = username;
    this.ig       = ig;

    this.addStats  = addStats;
    this.addAction = addAction;
  }

  async like() {
    let page = 1;
    let percentage = 20;

    const timeline = this.ig.feed.timeline('pull_to_refresh');

    while (true) {
      log(`Loading page ${page}. ${percentage}% chances of liking on this page.`);

      const items = await SessionManager.call(() => timeline.items() );

      if (isEmpty(items)) {
        log.warn(`Reached end of feed.`);
        break;
      }

      if (random(0, 100) <= percentage) {
        const mediaIds = map(filter(items, { comment_likes_enabled: true, has_liked: false }), 'id');
        log(`Selected ${mediaIds.length} posts for liking.`);

        if (!isEmpty(mediaIds)) {
          const mediaId = sample(mediaIds);
          log(`Liking ${mediaId}`);

          const response = await SessionManager.call(() => {
            return this.ig.media.like({
              mediaId,
              moduleInfo: {
                module_name: 'feed_timeline',
              },
              d: sample([0, 1]),
            });
          });
          log(response);

          await this.addAction({ type: 'likeFeed', reference: mediaId });

          break;
        }
      }

      percentage += 20;
      page++;
    }

    log('Done');
  }

  async likeOld() {
    let page = 1;
    let percentage = 20;

    const timeline = this.ig.feed.timeline('pull_to_refresh');

    while (true) {
      log(`Loading page ${page}. ${percentage}% chances of liking on this page.`);

      const items = await SessionManager.call(() => timeline.items() );

      if (isEmpty(items)) {
        log.warn(`Reached end of feed.`);
        break;
      }

      if (random(0, 100) <= percentage) {
        if (!isEmpty(items)) {
          const item = sample(items);
          const user = pick(item['user'], [ 'pk', 'username' ]);

          log(`Visiting ${user['username']} profile`);
          await SessionManager.call( () => this.ig.user.info(user['pk']) );
          log(`Loading ${user['username']} feed`);
          const userItems = await SessionManager.call(() => this.ig.feed.user(user['pk']).items() );

          const mediaIds = map(filter(userItems, { comment_likes_enabled: true, has_liked: false }), 'id');
          log(`Selected ${mediaIds.length} posts for liking.`);

          if (!isEmpty(mediaIds)) {
            const mediaId = sample(mediaIds);
            log(`Liking ${mediaId}`);

            const response = await SessionManager.call(() => {
              return this.ig.media.like({
                mediaId,
                moduleInfo: {
                  module_name: 'feed_timeline',
                },
                d: sample([0, 1]),
              });
            });
            log(response);

            await this.addAction({ type: 'likeFeedOld', reference: mediaId });

            break;
          }
        }
      }

      percentage += 20;
      page++;
    }

    log('Done');
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
