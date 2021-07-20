const _debug = require('debug');

module.exports = async (client, name) => {
  const debug = _debug('bot:requests:accountsUsernameSuggestions');

  const data = {
    phone_id: client.getFamilyDeviceId(),
    guid: client.getDeviceId(),
    name: 'NAME',
    device_id: client.getAndroidId(),
    email: '',
    waterfall_id: client.getWaterfallId(),
  };

  const form = `signed_body=SIGNATURE.${encodeURIComponent(JSON.stringify(data))}`.replace('NAME', name.replace(/ /g, `+`));

  const response = await client.send({ url: `/api/v1/accounts/username_suggestions/`, method: 'POST', form });
  debug(response);

  return response;
};
