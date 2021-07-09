const retry = require('../utils/retry');
const { isEmpty } = require('lodash');
const debug = require('debug')('bot:scrape');

module.exports = async ({ ig, sourceUsername, isBlacklisted, addBlacklist, addTarget }) => {
  debug(`Scrape ${sourceUsername} - Start`);

  const source = await retry(() => ig.user.searchExact(sourceUsername));

  debug(`Fetching ${source.username}'s followers`);
  const followersFeed = ig.feed.accountFollowers(source.pk);

  let page = 0;
  let total = 0;
  let valid = 0;
  while (true) {
    debug(`Fetching page ${++page}`);
    const followers  = await retry( () => followersFeed.items() );

    if (isEmpty(followers)) {
      debug(`Reached end of feed.`);
      break;
    }

    // const validUsers = filter(followers, { 'is_private': false, 'is_verified': false, 'has_anonymous_profile_picture': false });
    debug(`Fetched: ${followers.length} followers`);

    total += followers.length;
    for (const follower of followers) {
      const followerPk = follower.pk;
      const followerUsername = follower.username;

      if (await isBlacklisted(followerUsername)) {
        continue;
      }

      // if (follower.is_private || follower.is_verified || follower.has_anonymous_profile_picture) {
      if (follower.is_verified || follower.has_anonymous_profile_picture) {
        continue;
      }

      if (!follower.is_private && follower.latest_reel_media === 0) {
        continue;
      }

      debug(`Checking ${followerUsername}...`);

      const userInfo = await retry(() => ig.user.info(followerPk));

      if (userInfo.is_business) {
        await addBlacklist({ followerUsername, followerPk });
        debug(`Rejected (business)`);
        continue;
      }

      if (userInfo.media_count < 9) {
        await addBlacklist({ followerUsername, followerPk });
        debug(`Rejected (media_count)`);
        continue;
      }

      if (userInfo.follower_count < 100 || userInfo.follower_count > 5000) {
        await addBlacklist({ followerUsername, followerPk });
        debug(`Rejected (follower_count)`);
        continue;
      }

      if (userInfo.following_count < 100 || userInfo.following_count > 5000) {
        await addBlacklist({ followerUsername, followerPk });
        debug(`Rejected (following_count)`);
        continue;
      }

      if (isEmpty(userInfo.biography)) {
        await addBlacklist({ followerUsername, followerPk });

        debug(`Rejected (biography)`);
        continue;
      }

      let invalidBiography = false;
      for (let word of ['whatsapp', 'zap', 'link', 'direct', 'parceria', 'curso', 'peça', 'pedido', 'comercial', 'acesse', 'ifood']) {
        if (userInfo.biography.includes(word)) {
          await addBlacklist({ followerUsername, followerPk });

          debug(`Rejected (biography)`);
          invalidBiography = true;
          break;
        }
      }
      if (invalidBiography) {
        continue;
      }

      if (!isEmpty(userInfo.external_url)) {
        await addBlacklist({ followerUsername, followerPk });
        debug(`Rejected (external_url)`);
        continue;
      }

      valid += 1;
      debug(`Adding...`);
      await addTarget({ followerUsername, followerPk });
    }

    debug(`Page: ${page}`);
    debug(`Total: ${total}`);
    debug(`Added: ${valid}`);
    debug(`Successfully Added: ${((valid / total) * 100).toFixed(2)}%`);
  }

  debug('Done');
}