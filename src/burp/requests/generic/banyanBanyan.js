const _debug = require('debug');

module.exports = async (client, afterSignup = false) => {
  const debug = _debug('bot:banyanBanyan');

  let views;
  if (afterSignup) {
    views = ["story_share_sheet","direct_user_search_nullstate","forwarding_recipient_sheet","threads_people_picker","direct_inbox_active_now","group_stories_share_sheet","call_recipients","reshare_share_sheet","direct_user_search_keypressed"];
  } else {
    views = ["story_share_sheet","direct_user_search_nullstate","forwarding_recipient_sheet","threads_people_picker","group_stories_share_sheet","call_recipients","reshare_share_sheet","direct_user_search_keypressed"]
  }

  const qs = {
    views: JSON.stringify(views),
  };

  const response = await client.send({ url: `/api/v1/banyan/banyan/`, qs });
  debug(response);

  return response;
};
