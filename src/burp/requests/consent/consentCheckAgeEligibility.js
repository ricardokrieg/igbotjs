const _debug = require('debug');

const { upCaseHeaders } = require('../../utils');

module.exports = async (client, day, month, year) => {
  const debug = _debug('bot:consentCheckAgeEligibility');

  const form = {
    day,
    year,
    month,
  };

  const headers = upCaseHeaders(client.headers());

  const response = await client.send({ url: `/api/v1/consent/check_age_eligibility/`, method: 'POST', form, headers });
  debug(response);

  return response;
};
