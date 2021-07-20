const _debug = require('debug');
const { get, map, compact, sampleSize } = require('lodash');

const friendshipsCreate = require('./friendshipsCreate');
const friendshipsShowMany = require('./friendshipsShowMany');

const {
  newsInbox,
} = require('../generic');

module.exports = async (client, count) => {
  const debug = _debug('bot:requests:followRecommended');

  const recommendations = await newsInbox(client);
  debug(recommendations);

  const items = get(recommendations, 'aymf.items', []);
  const userIds = compact(map(items, (item) => get(item, 'user.pk', undefined)));

  await friendshipsShowMany(client, userIds);

  for (let userId of sampleSize(userIds, count)) {
    await friendshipsCreate(client, userId);
  }
};
