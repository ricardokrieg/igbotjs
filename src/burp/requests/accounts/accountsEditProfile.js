const _debug = require('debug');

module.exports = async (client, profileData) => {
  const debug = _debug('bot:requests:accountsEditProfile');

  const {
    external_url,
    phone_number,
    username,
    full_name,
    biography,
    email,
  } = profileData;

  const data = {
    external_url,
    phone_number,
    username,
    first_name: `FIRST_NAME`,
    _uid: client.getUserId(),
    device_id: client.getAndroidId(),
    biography,
    _uuid: client.getDeviceId(),
    email,
  };

  const form = `signed_body=SIGNATURE.${encodeURIComponent(JSON.stringify(data))}`.replace('FIRST_NAME', full_name.replace(/ /g, '+'));

  const response = await client.send({ url: `/api/v1/accounts/edit_profile/`, method: 'POST', form });
  debug(response);

  return response;
};
