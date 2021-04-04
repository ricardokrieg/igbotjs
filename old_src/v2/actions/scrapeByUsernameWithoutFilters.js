const retry = require('../utils/retry');
const { isEmpty } = require('lodash');
const debug = require('debug')('bot:scrape');

module.exports = async ({ ig, sourceUsername, isBlacklisted, addTarget }) => {
  debug(`Scrape ${sourceUsername} - Start`);

  const source = await retry(() => ig.user.searchExact(sourceUsername));

  debug(`Fetching ${source.username}'s followers`);
  const followersFeed = ig.feed.accountFollowers(source.pk);

  let page = 0;
  let total = 0;
  let added = 0;
  let inBlacklist = 0;
  while (true) {
    debug(`Fetching page ${++page}`);
    const followers  = await retry( () => followersFeed.items() );

    if (isEmpty(followers)) {
      debug(`Reached end of feed.`);
      break;
    }

    const pageTotal = followers.length;
    let pageAdded = 0;
    let pageInBlacklist = 0;
    total += pageTotal;

    debug(`Fetched: ${pageTotal} followers`);

    for (const follower of followers) {
      const followerPk = follower.pk;
      const followerUsername = follower.username;

      if (await isBlacklisted(followerUsername)) {
        inBlacklist += 1;
        pageInBlacklist += 1;
        continue;
      }

      added += 1;
      pageAdded += 1;
      debug(`Adding...`);
      await addTarget({ followerUsername, followerPk });
    }

    debug('='.repeat(40));
    debug(`Page: ${page}`);
    debug(`Total (page)    : ${pageTotal}`);
    debug(`Added (page)    : ${pageAdded}`);
    debug(`Blacklist (page): ${pageInBlacklist}`);
    debug(`Total           : ${total}`);
    debug(`Added           : ${added}`);
    debug(`Blacklist       : ${inBlacklist}`);
    debug(`Add Rate        : ${((added / total) * 100).toFixed(2)}%`);
    debug('='.repeat(40));
  }

  debug('Done');
}