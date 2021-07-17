const _debug = require('debug');

module.exports = async (client, usage) => {
  const debug = _debug('bot:accountsContactPrefill');

  let data;
  const userId = client.getUserId() || null;

  switch (usage) {
    case `prefill`:
      if (userId) {
        data = {
          phone_id: client.getFamilyDeviceId(),
          _uid: `${userId}`,
          _uuid: client.getDeviceId(),
          usage,
        };
      } else {
        data = {
          phone_id: client.getFamilyDeviceId(),
          usage,
        };
      }
      break;
    case `auto_confirmation`:
      data = {
        _uid: `${userId}`,
        device_id: client.getDeviceId(),
        _uuid: client.getDeviceId(),
        usage,
      };
      break;
  }

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  let response;
  try {
    response = await client.send({ url: `/api/v1/accounts/contact_point_prefill/`, method: 'POST', form });
    debug(response);
  } catch (response) {
    if (response.status !== `fail` || response.message !== `Please wait a few minutes before you try again.`) {
      throw response;
    }
    debug(response);
  }

  return response;
};
