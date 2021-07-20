const _debug = require('debug');
const {toPairs, random} = require("lodash");

module.exports = async (client, afterSignup = false, modifyHeaders = false) => {
  const debug = _debug('bot:requests:banyanBanyan');

  let views;
  if (afterSignup) {
    views = ["story_share_sheet","direct_user_search_nullstate","forwarding_recipient_sheet","threads_people_picker","direct_inbox_active_now","group_stories_share_sheet","call_recipients","reshare_share_sheet","direct_user_search_keypressed"];
  } else {
    views = ["story_share_sheet","direct_user_search_nullstate","forwarding_recipient_sheet","threads_people_picker","group_stories_share_sheet","call_recipients","reshare_share_sheet","direct_user_search_keypressed"]
  }

  const qs = {
    views: JSON.stringify(views),
  };

  let headers = client.headers();
  if (modifyHeaders) {
    headers = {};

    for (let kv of toPairs(client.headers())) {
      switch (kv[0]) {
        case 'X-IG-Bandwidth-Speed-KBPS':
          headers[kv[0]] = `${random(1800, 2200)}.000`;
          break;
        case 'X-IG-Bandwidth-TotalBytes-B':
          headers[kv[0]] = `${random(500000, 599999)}`;
          break;
        case 'X-IG-Bandwidth-TotalTime-MS':
          headers[kv[0]] = `${random(200, 299)}`;
          headers['X-IG-App-Startup-Country'] = client.getCountry();
          break;
        default:
          headers[kv[0]] = kv[1];
          break;
      }
    }
  }

  const response = await client.send({ url: `/api/v1/banyan/banyan/`, qs, headers });
  debug(response);

  return response;
};
