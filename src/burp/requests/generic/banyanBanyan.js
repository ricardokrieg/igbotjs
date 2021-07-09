const _debug = require('debug');

const banyanBanyan = async (client) => {
  const debug = _debug('bot:banyanBanyan');

  const qs = {
    views: JSON.stringify(["story_share_sheet","direct_user_search_nullstate","forwarding_recipient_sheet","threads_people_picker","group_stories_share_sheet","call_recipients","reshare_share_sheet","direct_user_search_keypressed"]),
  };

  const response = await client.send({ url: `/api/v1/banyan/banyan/`, qs });
  debug(response);

  return response;
};

module.exports = banyanBanyan;
