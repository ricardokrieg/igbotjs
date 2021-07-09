const _debug = require('debug');

const fbsearchNullstateDynamicSections = async (client) => {
  const debug = _debug('bot:fbsearchNullstateDynamicSections');

  const qs = {
    type: `blended`,
  };

  const response = await client.send({ url: `/api/v1/fbsearch/nullstate_dynamic_sections/`, qs });
  debug(response);

  return response;
};

module.exports = fbsearchNullstateDynamicSections;
