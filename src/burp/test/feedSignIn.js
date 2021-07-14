const Client = require('../client');
const feedSignIn = require("../actions/feedSignIn");

(async () => {
  const token = 'qfK9ydCVubNBMLrnaOYdPD0BQ40CDsNs';
  const userId = '48405653101';

  const attrs = {
    proxy: 'http://192.168.15.30:8888',
    locale: `en_US`,
    language: `en-US`,
    country: `US`,
    timezoneOffset: 0,
    igWwwClaim: `hmac.AR25Y__6VEUB35r51xd2ES1D4DTNQDeB50Z4oQIQroVIuh_b`,
    phoneId: '970f5113-bb0c-467e-a67e-fedf85ea38ad',
    token: token,
    userId: userId,
    uuid: '0362d54d-b663-47ba-97a6-96356e64c896',
    androidId: 'android-3c8a8d2f363a6ea',
    mid: 'YOQ4QQABAAEiEQd_o3WdlkW9xE-s',
    familyDeviceId: '970f5113-bb0c-467e-a67e-fedf85ea38ad',
    userAgent: `Instagram 187.0.0.32.120 Android (26/8.0.0; 160dpi; 600x976; unknown/Android; Genymotion 'Phone' version; cloud; vbox86; en_US; 289692202)`,
    bloksVersionId: `e097ac2261d546784637b3df264aa3275cb6281d706d91484f43c207d6661931`,
    cookies: `ig_direct_region_hint=FRC; ds_user_id=${userId}; mid=YOQ4QQABAAEiEQd_o3WdlkW9xE-s; sessionid=48405653101%3A7bPZLVmJPdpUYT%3A25; csrftoken=${token}; rur=FRC`,
  };

  const client = new Client(attrs);

  await feedSignIn(client);
})();
