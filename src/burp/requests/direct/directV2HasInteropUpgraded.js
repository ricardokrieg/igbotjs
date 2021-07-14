const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:directV2HasInteropUpgraded');

  const response = await client.send({ url: `/api/v1/direct_v2/has_interop_upgraded/` });
  debug(response);

  return response;
};
