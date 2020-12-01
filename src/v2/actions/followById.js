const retry = require('../utils/retry');
const debug = require('debug')('bot:follow');

module.exports = async ({ ig, pk }) => {
  debug(`Following ${pk}`);

  const response = await retry(() => ig.friendship.create(pk));
  debug(response);
}
