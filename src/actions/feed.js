const { filter, map, sample, sampleSize, isEmpty } = require('lodash');

const { stats, logger, quickSleep, call, randomLimit } = require('../utils');

const log = (message) => logger('Feed', message);


async function feed({ ig, accountDetails, statsCol }) {
  log('Start');

  const likeLimit = randomLimit(accountDetails.likeLimit / accountDetails.activeHours);
  log(`Going to like ${likeLimit} posts`);

  const timeline = ig.feed.timeline({ reason: 'pull_to_refresh' });

  let likesCount = 0;
  let page = 0;
  while (true) {
    page++;
    log(`Fetching page #${page}...`);
    const items = await call(() => { return timeline.items() });

    if (isEmpty(items)) {
      log(`Reached end of feed.`);
      break;
    }

    const mediaIds = sampleSize(map(filter(items, { comment_likes_enabled: true, has_liked: false }), 'id'), likeLimit);
    log(`Fetched ${items.length} posts (${mediaIds.length} are valid)`);

    for (let mediaId of mediaIds) {
      log(`Liking ${mediaId}`);
      await quickSleep();

      await call(() => {
        return ig.media.like({
          mediaId: mediaId,
          moduleInfo: {
            module_name: 'feed_timeline',
          },
          d: sample([0, 1]),
        });
      });

      await stats(statsCol, accountDetails._id, 'like', mediaId);

      likesCount++;
      log(`Likes: ${likesCount}/${likeLimit}`);

      if (likesCount >= likeLimit) {
        break;
      }
    }

    if (likesCount >= likeLimit) {
      break;
    }
  }

  log(`Liked ${likesCount} posts`);
  log('End');
}

module.exports = { feed };
