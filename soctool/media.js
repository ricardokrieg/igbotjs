const { random } = require('lodash');
const _debug = require('debug');

const { sign } = require('./utils');

const getSeenAt = () => Math.floor(Date.now() / 1000);
const wait = () => new Promise(resolve => setTimeout(resolve, random(1000, 3000)));

const getReels = async (items) => {
  const reels = {};

  for (const item of items) {
    await wait();
    const itemTakenAt = item.taken_at;

    const itemSourceId = item.user.pk;
    const reelId = `${itemSourceId}_${itemSourceId}`;
    reels[reelId] = [`${itemTakenAt}_${getSeenAt()}`];

    break;
  }

  return reels;
}

const mediaSeen = async (client, items) => {
  const debug = _debug('bot:soctool:media:seen');

  const qs = {
    reel: 1,
    live_vod: 0,
  };

  const reels = await getReels(items);

  const form = {
    signed_body: sign({
      live_vods_skipped: [],
      nuxes_skipped: [],
      _csrftoken: client.attrs.token,
      _uid: client.attrs.userId,
      _uuid: client.attrs.uuid,
      nuxes: [],
      reels,
      live_vods: [],
      reel_media_skipped: [],
      container_module: `feed_timeline`,
    }),
  };

  const response = await client.send({ url: `/api/v2/media/seen/`, method: `POST`, qs, form });
  debug(response);

  return response;
};

module.exports = {
  mediaSeen
};