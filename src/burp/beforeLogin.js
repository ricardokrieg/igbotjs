const Client = require('./client');
const beforeLogin = require("./actions/beforeLogin");

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
    mid: 0,
    familyDeviceId: getRandomId(),
    userAgent: `Instagram 187.0.0.32.120 Android (26/8.0.0; 160dpi; 600x976; unknown/Android; Genymotion 'Phone' version; cloud; vbox86; en_US; 289692202)`,
  };

  const client = new Client(attrs);

  await beforeLogin(client);
})();
