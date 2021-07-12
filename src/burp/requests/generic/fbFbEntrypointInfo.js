const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:fbFbEntrypointInfo');

  const response = await client.send({ url: `/api/v1/fb/fb_entrypoint_info/` });
  debug(response);

  return response;
};
