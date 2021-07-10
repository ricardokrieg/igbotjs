const { upCaseHeaders } = require('../../utils');

const _debug = require('debug');

const accountsContactPointPrefill = async (client) => {
  const debug = _debug('bot:accountsContactPrefill');

  const data = {
    phone_id: client.getFamilyDeviceId(),
    usage: `prefill`,
  };

  const form = {
    signed_body: `SIGNATURE.${JSON.stringify(data)}`
  };

  const headers = upCaseHeaders(client.headers());

  const response = await client.send({ url: `/api/v1/accounts/contact_point_prefill/`, method: 'POST', form, headers });
  debug(response);

  return response;
};

module.exports = accountsContactPointPrefill;
