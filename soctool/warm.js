// TODO maybe I will remove this file

const { isEmpty, sample } = require('lodash');
const debug = require('debug')('bot:soctool:warm');

const Client = require('./client');
const { usersUsernameInfo, usersInfo } = require('./users');
const { friendshipsCreate } = require('./friendships');
const { feedTimeline, feedReelsTray, feedUser } = require('./feed');
const { mediaSeen } = require('./media');
const start = require('./start');
const { quickSleep, longSleep } = require('../src/v2/utils/sleep');

const VtopeAPI = require('../vtope/VtopeAPI');

const followCount = 5;

const atoken = `v82VucQFY8ayjfGSD69i7oKvOvT873ue`;
const username = `promocoesthe_`;
const userId = `44513880809`;
const token = `iIMHaTGtKUp9xj7gRh3HIEypUP0pgjaA`;
const uuid = `6ee4a5aa-e76d-465f-8c7c-3f56ecce8b97`;
const mid = `X7O9TwABAAFTy8WWlWtOvXiNAQE5`;
const phoneId = `e7adad63-337b-40a6-9e93-594e9f94fd18`;
const sessionId = `44513880809%3Aw5VSOyGrfn3BTA%3A2`;
const deviceId = `android-e673560f6aa49bf1`;
const userAgent = `Instagram 159.0.0.40.122 Android (29/10; 640dpi; 1440x2768; samsung; SM-G960U; starqltesq; qcom; ru_RU; 245196047)`;
const pigeonSessionId = `bb339740-c3ec-4bbf-8b9f-f20f1efcbe7f`;
const bloksVersionId = `c76e70c382311c68b2201f168f946d800bbfcb7b6d9e43edbd9342d9a2048377`;
const urlgen = ``;

// const atoken = `iyjmeBXzeSA2Hv57osukoxD0jn6PTLcK`;
// const username = `aureliusmarcus_s`;
// const userId = `44369598642`;
// const token = `j2yHalME8QqSXawbrib9Z0xmRQIc379b`;
// const uuid = `a1902570-a7a3-4a0d-a829-50d0b34bae24`;
// const mid = `X8LE5QABAAHWFWA3fPOMaqQPNfhI`;
// const phoneId = `08c1da63-5c27-451b-af50-1e315439d689`;
// const sessionId = `44369598642%3Adhym0YbK5UeoG0%3A3`;
// const deviceId = `android-b514e60ca84ca7d7`;
// const userAgent = `Instagram 159.0.0.40.122 Android (29/10; 640dpi; 1440x2768; samsung; SM-G960F; starlte; samsungexynos9810; ru_RU; 245196047)`;
// const pigeonSessionId = `274e708d-5a94-4d77-850f-308825ff2e93`;
// const bloksVersionId = `c76e70c382311c68b2201f168f946d800bbfcb7b6d9e43edbd9342d9a2048377`;
// const urlgen = `{\"187.26.96.3\": 22085}:1kj82E:LkkEW8MHfK1l0fj6k98_UyFkrxc`;

const attrs = {
  username,
  userId,
  token,
  uuid,
  mid,
  phoneId,
  sessionId,
  deviceId,
  userAgent,
  pigeonSessionId,
  bloksVersionId,
  urlgen,
};

(async () => {
  const client = new Client(attrs);
  const api = new VtopeAPI();

  await start(client);

  let data;
  let i = 1;

  while (true) {
    debug(`Follow #${i}`);

    data = await api.requestFollow({ atoken });
    debug(data);

    const { id, shortcode } = data;

    const { user } = await usersUsernameInfo(client, shortcode);
    await friendshipsCreate(client, user.pk);

    data = await api.taskSuccess({ atoken, id: id });
    debug(data);

    if (i >= followCount) break;
    i++;

    const action = sample([`feedTimeline`, `feedUser`, `feedReelsTray`]);
    debug(`Random Action: ${action}`);

    switch (action) {
      case 'feedTimeline':
        await feedTimeline(client);
        break;
      case 'feedUser':
        await feedUser(client, userId);
        break;
      case 'feedReelsTray':
        const { tray } = await feedReelsTray(client);
        if (!isEmpty(tray)) {
          await mediaSeen(client, tray[0].items);
        }
        break;
    }

    await longSleep();
  }
})();
