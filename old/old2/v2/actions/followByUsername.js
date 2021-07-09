const retry = require('../utils/retry');
const { quickSleep } = require('../utils/sleep');
const debug = require('debug')('bot:follow');

module.exports = async ({ ig, username }) => {
  debug(`Following ${username}`);

  const user = await retry(() => ig.user.searchExact(username));
  const pk = user['pk'];

  debug(`Visiting ${user['username']} profile`);
  const profileInfo = await retry(() => ig.user.info(pk));
  debug(profileInfo);

  if (profileInfo['is_private']) {
    debug(`Skipping private user`);
    return;
  }

  debug(`Loading ${user['username']} feed`);
  await retry(() => ig.feed.user(user['pk']).items());

  await quickSleep();

  const response = await retry(() => ig.friendship.create(pk));
  debug(response);
}
