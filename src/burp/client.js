const { defaultsDeep, isEmpty, find } = require('lodash');
const request = require('request-promise');
const { retry } = require('@lifeomic/attempt');
const { Options, Response, jar } = require('request');
const { Cookie, CookieJar, MemoryCookieStore } = require('tough-cookie');
const Chance = require('chance');
const _debug = require('debug');

const cookieStore = new MemoryCookieStore();
const cookieJar = jar(cookieStore);

const debug = _debug('bot:client');

const extractCookieValue = (key) => {
  const cookie = extractCookie(key);
  if (cookie === null) {
    throw new Error(`Could not find ${key}`);
  }

  return cookie.value;
}

const extractCookie = (key) => {
  const cookies = cookieJar.getCookies(`https://i.instagram.com`);
  return find(cookies, { key }) || null;
}

module.exports = class Client {
  constructor(attrs) {
    this.attrs = attrs;

    const cookies = attrs.cookies.split(`;`);

    for (let cookie of cookies) {
      cookieJar.setCookie(cookie, `https://i.instagram.com/`);
      cookieJar.setCookie(cookie, `https://b.i.instagram.com/`);
    }
  }

  csrfToken() {
    try {
      return extractCookieValue('csrftoken');
    } catch {
      debug('csrftoken lookup failed, returning "missing".');
      return 'missing';
    }
  }

  getRandomId() {
    return new Chance().guid();
  }

  clientSessionId() {
    return this.generateTemporaryGuid(`clientSessionId`, 1200000, this.attrs.phoneId);
  }

  pigeonSessionId() {
    const guid = this.generateTemporaryGuid(`pigeonSessionId`, 1200000, this.attrs.phoneId);
    return `UFS-${guid}-0`;
  }

  batteryLevel() {
    const chance = new Chance(this.attrs.phoneId);
    const percentTime = chance.integer({ min: 200, max: 600 });
    return 100 - (Math.round(Date.now() / 1000 / percentTime) % 100);
  }

  async send(options) {
    return retry(async () => {
      const response = await request(defaultsDeep({}, options, this.defaultOptions(this.attrs, {})));

      if (response.status === 'fail') {
        debug(response);
        console.error(`Failed response. Exiting`);
        process.exit(1);
      }

      return Promise.resolve(response);
    }, { maxAttempts: 10, delay: 10000 });
  }

  async sendGzip(options) {
    const headerOverrides = {
      'Content-Encoding': `gzip`,
      'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`,
    };

    return retry(async () => {
      const response = await request(defaultsDeep({}, options, this.defaultOptions(this.attrs, headerOverrides)))

      if (response.status === 'fail') {
        debug(response);
        console.error(`Failed response. Exiting`);
        process.exit(1);
      }

      return Promise.resolve(response);
    }, { maxAttempts: 10, delay: 10000 });
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

  headers({ userId, uuid, mid, deviceId, familyDeviceId, userAgent, bloksVersionId }, overrides) {
    return defaultsDeep(
      {
        'Host': `i.instagram.com`,
        'X-Ig-App-Locale': `en_US`,
        'X-Ig-Device-Locale': `en_US`,
        'X-Ig-Mapped-Locale': `en_US`,
        'X-Pigeon-Session-Id': this.pigeonSessionId(),
        'X-Pigeon-Rawclienttime': (Date.now() / 1000).toFixed(3),
        'X-Ig-Bandwidth-Speed-Kbps': `-1.000`,
        'X-Ig-Bandwidth-Totalbytes-B': `0`,
        'X-Ig-Bandwidth-Totaltime-Ms': `0`,
        'X-Ig-App-Startup-Country': `US`,
        'X-Bloks-Version-Id': bloksVersionId,
        'X-Ig-Www-Claim': `hmac.AR25Y__6VEUB35r51xd2ES1D4DTNQDeB50Z4oQIQroVIuh_b`, // TODO this is dynamic
        'X-Bloks-Is-Layout-Rtl': `false`,
        'X-Bloks-Is-Panorama-Enabled': `true`,
        'X-Ig-Device-Id': uuid,
        'X-Ig-Family-Device-Id': familyDeviceId,
        'X-Ig-Android-Id': deviceId,
        'X-Ig-Timezone-Offset': `0`,
        'X-Ig-Salt-Ids': `1061163349,1061163349`, // TODO where this number come from? the amount of items keep increasing (ie: x,x -> x,x,x ...)
        'X-Ig-Connection-Type': `WIFI`,
        'X-Ig-Capabilities': `3brTvx0=`,
        'X-Ig-App-Id': `567067343352427`,
        'Priority': `u=3`,
        'User-Agent': userAgent,
        'Accept-Language': `en-US`,
        // TODO this is auto generated?
        // Authorization: Bearer IGT:2:eyJkc191c2VyX2lkIjoiNDg0MDU2NTMxMDEiLCJzZXNzaW9uaWQiOiI0ODQwNTY1MzEwMSUzQTdiUFpMVm1KUGRwVVlUJTNBMjUiLCJzaG91bGRfdXNlX2hlYWRlcl9vdmVyX2Nvb2tpZXMiOnRydWV9
        'X-Mid': mid,
        'Ig-U-Ig-Direct-Region-Hint': `FRC`,
        'Ig-U-Ds-User-Id': userId,
        'Ig-U-Rur': `FRC`,
        'Ig-Intended-User-Id': userId,
        'Accept-Encoding': `gzip, deflate`,
        'X-Fb-Http-Engine': `Liger`,
        'X-Fb-Client-Ip': `True`,
        'X-Fb-Server-Cluster': `True`,
        'Connection': `close`,
      },
      overrides
    );
  }

  generateTemporaryGuid(seed, lifetime, deviceId) {
    return new Chance(`${seed}${deviceId}${Math.round(Date.now() / lifetime)}`).guid();
  }
}
