const Client = require('./client');
const signUp = require("./actions/signUp");

(async () => {
  const attrs = {
    proxy: 'http://192.168.15.30:8888',
    locale: `en_US`,
    language: `en-US`,
    country: `US`,
    timezoneOffset: 0,
    igWwwClaim: 0,
    phoneId: 'cd0fa269-745a-5177-8d88-f16615e614dd',
    uuid: '06e04585-2864-51e7-87fb-6d4f019b8427',
    androidId: 'android-6b4ef9ea9ba60ea7',
    mid: `YOmppgABAAHGMJvhU2461zIS-BpU`,
    familyDeviceId: 'a53189f3-220b-5024-9db0-8d1c52ee9dec',
    userAgent: `Instagram 187.0.0.32.120 Android (26/8.0.0; 480dpi; 1080x1920; samsung; GT-I9500; ja3g; universal5410; en_US; 93117670)`,

    passwordEncryptionKeyId: `18`,
    passwordEncryptionPubKey: `LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF5VVpRZEo1ckJXWERNQnBQQTh3Ngpva2dIM2xUNTVBYmpkaXZ3UGVOaWFCTGdSOVIxYjcvMGxVZ0s1VjJxZGJMLzIwRDZhZVoyTW40ajNBdkZrSXlRClFhQ05lMUY0NncwcllRbjRrOUlQYjNPL0oydk9WSkIxWDUzU3hYRWxIUjdXVjJIamlpMjFmMVQ1ZGN0NFUzMTQKcnRKYVl0ZlhQaCtGZk5Vamt3TDhCbysyL2RtNVcxWGxFWlY1aVpaM0NrWmRkejZVWXZ0cVN0WFYzRXNpYzZ3VQpIOHI0VThsTWttWno1T2pDSGtXZTdqbUc3ZGZhTTlub2FnY3hhTG1yT2ZVaDhnWWZzdEt5RGxvN3o0TC9MRDhGCjZ3VHpnYWRGRlJsbTFnM0Nzb2h6QXFuTWVJZG1yNjVWb0hXcW4xVGNCRlhJQmdRYTJpTmhIR2dqNy9XZFI3VGQKOVFJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==`,
  };

  const client = new Client(attrs);
  const prefix = `+7`;
  const phoneNumber = `908 989-02-76`;

  await signUp(client, prefix, phoneNumber);
})();
