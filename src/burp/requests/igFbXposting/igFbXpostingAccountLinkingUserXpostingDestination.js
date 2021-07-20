const _debug = require('debug');

module.exports = async (client) => {
  const debug = _debug('bot:requests:igFbXpostingAccountLinkingUserXpostingDestination');

  const qs = {
    signed_body: `SIGNATURE.{}`
  };

  const response = await client.send({ url: `/api/v1/ig_fb_xposting/account_linking/user_xposting_destination/`, qs });
  debug(response);

  return response;
};
