const Client = require('../client');
const signUpCompleteProfile = require("../actions/signUpCompleteProfile");

(async () => {
  const attrs = {
    proxy: 'http://192.168.15.30:8888',
    locale: `en_US`,
    language: `en-US`,
    country: `US`,
    timezoneOffset: 0,
    igWwwClaim: 'hmac.AR1oCxuL5X2f4Jv9Hw4XdtmtUGhT7jzp8s5ivM3Dd2cHMUJd',
    phoneId: 'cd0fa269-745a-5177-8d88-f16615e614dd',
    uuid: '06e04585-2864-51e7-87fb-6d4f019b8427',
    androidId: 'android-6b4ef9ea9ba60ea7',
    mid: 'YOmppgABAAHGMJvhU2461zIS-BpU',
    familyDeviceId: 'a53189f3-220b-5024-9db0-8d1c52ee9dec',
    userAgent: `Instagram 187.0.0.32.120 Android (26/8.0.0; 480dpi; 1080x1920; samsung; GT-I9500; ja3g; universal5410; en_US; 93117670)`,
    passwordEncryptionKeyId: '24',
    passwordEncryptionPubKey: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF4VlRHc2doc054bFh4VmNjdW5MNQpzUklrTlpiN3o3bW5nRHVqTnU5TnZ1cWVuZ0FUU0JNRWhmbjV3K243NTFEeVpVTUxCUlBVb0lZNjFmL0gwcVlICnl3a3ZGbm9FYWt4aURCdkpHR1JvQktTOUo4amhYSXlzb2VPSURRUkFCZ1huakY2akMxbVRNckNTVXBFeXlKMDkKWjZLRGRCbkY1UVc5eGZnOG41cFJpL2E4V3pDUk9BTXcvWVk0QkdHS1E5bzBDNGZHQUVoNUltSU5reTNBWGZ0bAppVTBpbm9zYWNBTnpzZ3RzcWNNZDRRZEJsdXM4Z0UybURCeThpZVZEaDV4ZDdLcUVLQ1l4V0s2WVZxdFlsY0hRCi9tTDlkazR2YjhsOUpkbmpGYWd0cHk0VEtRUUh4QzlVRUc2YjNVOXU1OXJVK2NhZFVZWUh1R0wzakh2b1p3OHMKR3dJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==',
    directRegionHint: '',
    shbid: '',
    shbts: '',
    rur: 'PRN',
    userId: '48962265381',
    authorization: 'Bearer IGT:2:eyJkc191c2VyX2lkIjoiNDg5NjIyNjUzODEiLCJzZXNzaW9uaWQiOiI0ODk2MjI2NTM4MSUzQWdDdkxreU80OTcxaXp4JTNBMjgiLCJzaG91bGRfdXNlX2hlYWRlcl9vdmVyX2Nvb2tpZXMiOnRydWV9',
    waterfallId: `71b06555-d975-5fc5-95ad-24d5ab9922a4`,
  };

  const client = new Client(attrs);

  const userInfo = {
    name: 'Awesome Sabujo',
    password: 'xxx123xxx',
    day: 12,
    month: 7,
    year: 1995,
    profileImage: `/Users/wolf/Downloads/cats/fitchicksinworkoutgear/2568837392715646174.jpg`,
    shareToFeed: true,
    followRecommendedCount: 3,
  };

  await signUpCompleteProfile(client, userInfo);
})();
