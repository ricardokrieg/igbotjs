const Client = require('../client');
const search = require("../actions/search");
const follow = require("../actions/follow");
const _debug = require('debug');

const debug = _debug('bot:searchAndFollow');

(async () => {
  const attrs = {
    proxy: 'http://192.168.15.30:8888',
    locale: 'en_US',
    language: 'en-US',
    country: 'US',
    timezoneOffset: 0,
    igWwwClaim: 'hmac.AR1QV5Shxz8lJASb4q_LALU8pcLUraXG03SLzDVo7XMU-yTT',
    phoneId: '27446d2d-cd1a-561a-9c3f-4a3b94351570',
    uuid: '02a4d948-51ec-5cb5-aa70-be7205ca8849',
    androidId: 'android-07b8802813cad25a',
    mid: 'YOwpuQABAAFVJZ-U8rxCA5kz-sPT',
    familyDeviceId: '4ef5d12f-0ab8-585f-aa9c-7870bbea561e',
    userAgent: 'Instagram 187.0.0.32.120 Android (28/9; 320dpi; 720x1402; samsung; SM-A102U; a10e; exynos7885; en_US; 209143712)',
    waterfallId: '255ffd50-8cd4-501c-a401-8a7c0175bf6d',
    directRegionHint: '',
    shbid: '',
    shbts: '',
    rur: 'RVA,48782794833,1657657387:01f7f2852584252945b007d9047f6e1186ec346c218ff63267a0cfedb6636e9b8425e0d3',
    userId: '48782794833',
    passwordEncryptionKeyId: '177',
    passwordEncryptionPubKey: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF2ZkF6MnBUb1FTdWpHRjU1ZVZEMApMR3hoT0hMcTR2T2VwbW5kSHNIZ2tCQkN4UWpISm96aENjb1RFbUNrRjl1cXNFL2FIcWNHVXpnTTBsZyt5RUVFCi9sYUZ6amJrMEFHbWd2d21YcjRzaWFhS2FuUEtFRXdYQnpzVUg2dzgwVDNwS3l1eWt0WVU2bC9BZklmQjZlbXAKMXNxclJxb2tRd0ZaVHRaSnJoK1hmNjQyVzdhcGJKNDg0Z040YzJLK1NzM2tLU0hqS1dIclZQSlYrUWo0ajZDeAo4eldzVDQxT0lRQjdvTTdDakJydjV6Nm5xaVJ1N082eGszbW5BVTJ6WjZnNTBtRTlYclBmeWw1T1BqUmgyVHl3CjFUbE5RbGdoS2hoOFZLQ3ovQThQMnFSWXNtQjYrb1ViT0cxMXdTYVFBQ1dkUXF1cWMzekZkK2pnZkt2cnkwR3YKN3dJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==',
    authorization: 'Bearer IGT:2:eyJkc191c2VyX2lkIjoiNDg3ODI3OTQ4MzMiLCJzZXNzaW9uaWQiOiI0ODc4Mjc5NDgzMyUzQUxzMm1oWVlyc0lGYldNJTNBMTQiLCJzaG91bGRfdXNlX2hlYWRlcl9vdmVyX2Nvb2tpZXMiOnRydWV9'
  };

  const client = new Client(attrs);

  try {
    const { user, is_private, following } = await search(client, `kourtneykardash`);
    debug(user);

    if (!is_private && !following) {
      await follow(client, user);
    }
  } catch {
    debug(`Target not found`);
  }
})();
