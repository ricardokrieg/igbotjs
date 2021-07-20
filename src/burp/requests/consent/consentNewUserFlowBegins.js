const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:consentNewUserFlowBegins');

  const data = {
    device_id: client.getDeviceId(),
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/consent/new_user_flow_begins/`, method: 'POST', form });
  debug(response);

  return response;
};
