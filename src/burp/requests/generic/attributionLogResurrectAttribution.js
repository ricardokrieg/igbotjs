const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:attributionLogResurrectAttribution');

  const data = {
    _uid: client.getUserId(),
    _uuid: client.getDeviceId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  let response;
  try {
    response = await client.send({ url: `/api/v1/attribution/log_resurrect_attribution/`, method: 'POST', form });
    debug(response);
  } catch (response) {
    if (response.status !== `fail`) {
      throw response;
    }
    debug(response);
  }

  return response;
};
