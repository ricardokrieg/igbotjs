const Client = require('./client');
const beforeLogin = require("./actions/beforeLogin");

const {
  getRandomId,
  getRandomAndroidId,
} = require('./utils');

(async () => {
  const attrs = {
    proxy: 'http://192.168.15.30:8888',
    // proxy: 'http://3.219.242.208:8888',

    locale: `en_US`,
    language: `en-US`,
    country: `US`,
    timezoneOffset: 0,
    igWwwClaim: 0,
    // phoneId: getRandomId(),
    phoneId: 'cd0fa269-745a-5177-8d88-f16615e614dd',
    // uuid: getRandomId(),
    uuid: '06e04585-2864-51e7-87fb-6d4f019b8427',
    // androidId: getRandomAndroidId(),
    androidId: 'android-6b4ef9ea9ba60ea7',
    mid: `YOmppgABAAHGMJvhU2461zIS-BpU`,
    // familyDeviceId: getRandomId(),
    familyDeviceId: 'a53189f3-220b-5024-9db0-8d1c52ee9dec',
    // userAgent: `Instagram 187.0.0.32.120 Android (26/8.0.0; 160dpi; 600x976; unknown/Android; Genymotion 'Phone' version; cloud; vbox86; en_US; 289692202)`,
    userAgent: `Instagram 187.0.0.32.120 Android (26/8.0.0; 480dpi; 1080x1920; samsung; GT-I9500; ja3g; universal5410; en_US; 93117670)`,
  };

  const client = new Client(attrs);

  await beforeLogin(client);
})();
