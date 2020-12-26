const { defaultsDeep, isEmpty, find } = require('lodash');
const request = require('request-promise');
const { retry } = require('@lifeomic/attempt');
const { Options, Response, jar } = require('request');
const { Cookie, CookieJar, MemoryCookieStore } = require('tough-cookie');
const Chance = require('chance');

const cookieStore = new MemoryCookieStore();
const cookieJar = jar(cookieStore);

module.exports = class Client {
  constructor(attrs) {
    this.attrs = attrs;

    // const cookies = [
    //   `mid="${attrs.mid}"; Domain=.instagram.com; Path=/; Secure`,
    //   `csrftoken="${attrs.token}"; Domain=.instagram.com; Path=/; Secure`,
    //   `ds_user="${attrs.username}"; Domain=.instagram.com; Path=/; Secure`,
    //   `rur="ASH"; Domain=.instagram.com; Path=/; Secure`,
    //   `ds_user_id="${attrs.userId}"; Domain=.instagram.com; Path=/; Secure`,
    //   `urlgen="${attrs.urlgen}"; Domain=.instagram.com; Path=/; Secure`,
    //   `sessionid="${attrs.sessionId}"; Domain=.instagram.com; Path=/; Secure`,
    // ];

    const cookies = attrs.cookies.split(`;`);

    for (let cookie of cookies) {
      cookieJar.setCookie(cookie, `https://i.instagram.com/`);
    }

    this.pigeonSessionId = new Chance().guid();
  }

  async send(options) {
    return retry(async () => request(defaultsDeep({}, options, this.defaultOptions(this.attrs, {}))), { maxAttempts: 10, delay: 10000 });
  }

  async sendGzip(options) {
    const headerOverrides = {
      'Content-Encoding': `gzip`,
      'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`,
    };

    return retry(async () => request(defaultsDeep({}, options, this.defaultOptions(this.attrs, headerOverrides))), { maxAttempts: 10, delay: 10000 });
  }

  defaultOptions(attrs, headerOverrides) {
    return {
      baseUrl: 'https://i.instagram.com',
      proxy: attrs.proxy,
      transform: JSON.parse,
      simple: false,
      jar: cookieJar,
      strictSSL: false,
      gzip: true,
      headers: this.headers(attrs, headerOverrides),
      method: 'GET',
    };
  }

  headers({ uuid, mid, deviceId, userAgent }, overrides) {
    return defaultsDeep(
      {
        'Host': `i.instagram.com`,
        'Connection': `close`,
        'Accept-Encoding': `gzip, deflate`,
        'Accept-Charset': `utf-8;q=0.7,*;q=0.3`,
        'User-Agent': userAgent,
        'X-IG-Capabilities': `3brTvx8=`,
        'X-IG-Connection-Type': `WIFI`,
        'X-IG-App-ID': `567067343352427`,
        'X-IG-Bandwidth-Speed-KBPS': `-1.000`,
        'X-IG-Bandwidth-TotalBytes-B': `0`,
        'X-IG-Bandwidth-TotalTime-MS': `0`,
        'X-IG-Connection-Speed': `-1kbps`,
        'X-Bloks-Is-Layout-RTL': `false`,
        'X-IG-Device-Locale': `ru_RU`,
        'X-IG-App-Locale': `ru_RU`,
        'X-IG-Mapped-Locale': `ru_RU`,
        'IG-U-RUR': `ATN`,
        'X-IG-WWW-Claim': `0`,
        'X-IG-Android-ID': deviceId,
        'X-IG-Device-ID': uuid,
        'X-Pigeon-Session-Id': this.pigeonSessionId,
        'X-Bloks-Version-Id': `c76e70c382311c68b2201f168f946d800bbfcb7b6d9e43edbd9342d9a2048377`,
        'X-MID': mid,
        'X-Pigeon-Rawclienttime': (Date.now() / 1000).toFixed(3),
        'X-FB-HTTP-Engine': `Liger`,
        'Accept-Language': `ru-RU`,
      },
      // overrides
    );
  }
}