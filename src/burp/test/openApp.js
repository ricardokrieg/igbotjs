const Client = require('../client');
const openApp = require("../actions/openApp");

const {
  getRandomId,
  getRandomAndroidId,
} = require('./utils');

(async () => {
  const attrs = {
    proxy: 'http://192.168.15.30:8888',
    locale: `en_US`,
    language: `en-US`,
    country: `US`,
    timezoneOffset: 0,
    igWwwClaim: 0,
    phoneId: getRandomId(),
    uuid: getRandomId(),
    androidId: getRandomAndroidId(),
    mid: `YOmppgABAAHGMJvhU2461zIS-BpU`,
    familyDeviceId: getRandomId(),
    userAgent: `Instagram 187.0.0.32.120 Android (26/8.0.0; 480dpi; 1080x1920; samsung; GT-I9500; ja3g; universal5410; en_US; 93117670)`,
  };

  const client = new Client(attrs);

  await openApp(client);
})();
