const _debug = require('debug');

module.exports = async (client, day, month, year) => {
  const debug = _debug('bot:consentCheckAgeEligibility');

  const form = {
    day,
    year,
    month,
  };

  const response = await client.send({ url: `/api/v1/consent/check_age_eligibility/`, method: 'POST', form });
  debug(response);

  return response;
};
