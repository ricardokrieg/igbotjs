const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:accountsProcessContactPointSignals');

  const data = {
    phone_id: client.getFamilyDeviceId(),
    _uid: client.getUserId(),
    device_id: client.getDeviceId(),
    _uuid: client.getDeviceId(),
    google_tokens: `[]`,
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  let response;
  try {
    response = await client.send({ url: `/api/v1/accounts/process_contact_point_signals/`, method: 'POST', form });
    debug(response);
  } catch (response) {
    if (response.status !== `fail`) {
      throw response;
    }
    debug(response);
  }

  return response;
};
