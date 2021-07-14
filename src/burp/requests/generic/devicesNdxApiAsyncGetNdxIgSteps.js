const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:devicesNdxApiAsyncGetNdxIgSteps');

  const response = await client.send({ url: `/api/v1/devices/ndx/api/async_get_ndx_ig_steps/` });
  debug(response);

  return response;
};
