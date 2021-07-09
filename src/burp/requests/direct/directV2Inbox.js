const _debug = require('debug');

const directV2Inbox = async (client) => {
  const debug = _debug('bot:directV2Inbox');

  const qs = {
    visual_message_return_type: `unseen`,
    persistentBadging: true,
    limit: 0,
  };

  const response = await client.send({ url: `/api/v1/direct_v2/inbox/`, qs });
  debug(response);

  return response;
};

module.exports = directV2Inbox;
