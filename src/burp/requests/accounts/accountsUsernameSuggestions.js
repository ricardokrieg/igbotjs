const _debug = require('debug');

const { upCaseHeaders } = require('../../utils');

module.exports = async (client, name) => {
  const debug = _debug('bot:accountsUsernameSuggestions');

  const data = {
    phone_id: client.getFamilyDeviceId(),
    guid: client.getDeviceId(),
    name,
    device_id: client.getAndroidId(),
    email: '',
    waterfall_id: client.getWaterfallId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const headers = upCaseHeaders(client.headers());

  const response = await client.send({ url: `/api/v1/accounts/username_suggestions/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
