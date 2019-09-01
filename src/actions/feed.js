const { filter, map, random, sample, sampleSize } = require('lodash');

const { logger, sleep, call } = require('../utils');

const log = (message) => logger('Feed', message);


async function feed({ ig, likes }) {
  log('Start');

  const likeLimit = Math.round(random(likes - (likes * 0.5), likes + (likes * 0.5)));
  log(`Going to like ${likeLimit} posts`);

  const timeline = ig.feed.timeline({ reason: 'pull_to_refresh' });

  let likesCount = 0;
  let page = 0;
  while (true) {
    page++;
    log(`Fetching page #${page}...`);
    const items = await call(() => { return timeline.items() });

    const mediaIds = sampleSize(map(filter(items, { comment_likes_enabled: true, has_liked: false }), 'id'), likeLimit);
    log(`Fetched ${items.length} posts (${mediaIds.length} are valid)`);

    for (let mediaId of mediaIds) {
      log(`Liking ${mediaId}`);
      await sleep(random(5000, 20000));

      await call(() => {
        return ig.media.like({
          mediaId: mediaId,
          moduleInfo: {
            module_name: 'feed_timeline',
          },
          d: sample([0, 1]),
        });
      });

      likesCount++;
      log(`Likes: ${likesCount}/${likeLimit}`);
    }

    if (likesCount >= likeLimit) {
      break;
    }
  }

  log(`Liked ${likesCount} posts`);
  log('End');
}

module.exports = { feed };
