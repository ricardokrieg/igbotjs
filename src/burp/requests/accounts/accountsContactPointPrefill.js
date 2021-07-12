const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:accountsContactPrefill');

  let data;
  const userId = client.getUserId() || null;

  if (userId) {
    data = {
      _uid: `${userId}`,
      device_id: client.getDeviceId(),
      _uuid: client.getDeviceId(),
      usage: `auto_confirmation`,
    };
  } else {
    data = {
      phone_id: client.getFamilyDeviceId(),
      usage: `prefill`,
    };
  }

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const response = await client.send({ url: `/api/v1/accounts/contact_point_prefill/`, method: 'POST', form });
  debug(response);

  return response;
};
