const _debug = require('debug');

const { upCaseHeaders } = require('../../utils');

module.exports = async (client, day, month, year) => {
  const debug = _debug('bot:consentNewUserFlowBegins');

  const data = {
    device_id: client.getDeviceId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const headers = upCaseHeaders(client.headers());

  const response = await client.send({ url: `/api/v1/consent/new_user_flow_begins/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
