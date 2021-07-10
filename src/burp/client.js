const { defaults } = require('lodash');
const request = require('request-promise');
const { retry } = require('@lifeomic/attempt');
const { jar } = require('request');
const { MemoryCookieStore } = require('tough-cookie');
const Chance = require('chance');
const _debug = require('debug');

const {
  extractCookieValue,
  appendDefaultHeaders,
} = require('./utils');

const {
  bloksVersionId,
} = require('./settings');

const cookieStore = new MemoryCookieStore();
const cookieJar = jar(cookieStore);

const debug = _debug('bot:client');

module.exports = class Client {
  constructor(attrs) {
    this.attrs = attrs;

    if (attrs.cookies) {
      const cookies = attrs.cookies.split(`;`);

      for (let cookie of cookies) {
        cookieJar.setCookie(cookie, `https://i.instagram.com/`);
        cookieJar.setCookie(cookie, `https://b.i.instagram.com/`);
      }
    }
  }

  getCsrfToken() {
    try {
      return extractCookieValue(cookieJar, 'csrftoken');
    } catch {
      debug('csrftoken lookup failed, returning "missing".');
      return 'missing';
    }
  }

  async send(options) {
    options = {
      ...options,
      headers: appendDefaultHeaders(options.headers),
    };

    return retry(async () => {
      const response = await request(defaults(options, this.defaultOptions()));

      if (response.status === 'fail') {
        debug(response);
        console.error(`Failed response. Exiting`);
        process.exit(1);
      }

      return Promise.resolve(response);
    }, { maxAttempts: 10, delay: 10000 });
  }

  async sendGzip(options) {
    options = {
      ...options,
      headers: appendDefaultHeaders(options.headers, true),
    };

    return retry(async () => {
      const response = await request(defaults(options, this.defaultOptions()))

      if (response.status === 'fail') {
        debug(response);
        console.error(`Failed response. Exiting`);
        process.exit(1);
      }

      return Promise.resolve(response);
    }, { maxAttempts: 10, delay: 10000 });
  }

  defaultOptions() {
    return {
      baseUrl: 'https://i.instagram.com',
      proxy: this.attrs.proxy,
      transform: JSON.parse,
      simple: false,
      jar: cookieJar,
      strictSSL: false,
      gzip: true,
      headers: this.headers(),
      method: 'GET',
    };
  }

  headers() {
    return {
      'X-Ig-App-Locale': this.getLocale(),
      'X-Ig-Device-Locale': this.getLocale(),
      'X-Ig-Mapped-Locale': this.getLocale(),
      'X-Pigeon-Session-Id': this.getPigeonSessionId(),
      'X-Pigeon-Rawclienttime': (Date.now() / 1000).toFixed(3),
      'X-Ig-Bandwidth-Speed-Kbps': `-1.000`,
      'X-Ig-Bandwidth-Totalbytes-B': `0`,
      'X-Ig-Bandwidth-Totaltime-Ms': `0`,
      // 'X-Ig-App-Startup-Country': this.getCountry(),
      'X-Bloks-Version-Id': bloksVersionId,
      'X-Ig-Www-Claim': this.getIgWwwClaim(),
      'X-Bloks-Is-Layout-Rtl': `false`,
      'X-Bloks-Is-Panorama-Enabled': `true`,
      'X-Ig-Device-Id': this.getDeviceId(),
      'X-Ig-Family-Device-Id': this.getFamilyDeviceId(),
      'X-Ig-Android-Id': this.getAndroidId(),
      'X-Ig-Timezone-Offset': this.getTimezoneOffset(),
      // 'X-Ig-Salt-Ids': this.getIgSaltIds(),
      'X-Ig-Connection-Type': `WIFI`,
      'X-Ig-Capabilities': `3brTvx0=`,
      'X-Ig-App-Id': `567067343352427`,
      // 'Priority': `u=3`,
      'User-Agent': this.getUserAgent(),
      'Accept-Language': this.getLanguage(),
      // TODO this is auto generated?
      // Authorization: Bearer IGT:2:eyJkc191c2VyX2lkIjoiNDg0MDU2NTMxMDEiLCJzZXNzaW9uaWQiOiI0ODQwNTY1MzEwMSUzQTdiUFpMVm1KUGRwVVlUJTNBMjUiLCJzaG91bGRfdXNlX2hlYWRlcl9vdmVyX2Nvb2tpZXMiOnRydWV9
      'X-Mid': this.getMid(),
      'Ig-Intended-User-Id': this.getUserId(),
      // 'Ig-U-Ig-Direct-Region-Hint': `FRC`,
      // 'Ig-U-Ds-User-Id': this.getUserId(),
      // 'Ig-U-Rur': `FRC`,
    };
  }

  generateTemporaryGuid(seed, lifetime, deviceId) {
    return new Chance(`${seed}${deviceId}${Math.round(Date.now() / lifetime)}`).guid();
  }

  getClientSessionId() {
    return this.generateTemporaryGuid(`clientSessionId`, 1200000, this.getPhoneId());
  }

  getPigeonSessionId(withUfs = false) {
    const guid = this.generateTemporaryGuid(`pigeonSessionId`, 1200000, this.getPhoneId());

    if (withUfs) {
      return `UFS-${guid}-0`;
    }

    return guid;
  }

  getPhoneId() {
    return this.attrs.phoneId;
  }

  getLocale() {
    return this.attrs.locale;
  }

  getLanguage() {
    return this.attrs.language;
  }

  getCountry() {
    return this.attrs.country;
  }

  getFamilyDeviceId() {
    return this.attrs.familyDeviceId;
  }

  getUuid() {
    return this.attrs.uuid;
  }

  getDeviceId() {
    return this.attrs.uuid;
  }

  getAndroidId() {
    return this.attrs.androidId;
  }

  getBloksVersionId() {
    return this.attrs.bloksVersionId;
  }

  getIgWwwClaim() {
    return this.attrs.igWwwClaim;
  }

  getTimezoneOffset() {
    return this.attrs.timezoneOffset;
  }

  getUserAgent() {
    return this.attrs.userAgent;
  }

  getMid() {
    return this.attrs.mid;
  }

  getUserId() {
    return this.attrs.userId || 0;
  }

  // TODO where this number come from? the amount of items keep increasing (ie: x,x -> x,x,x ...)
  getIgSaltIds() {
    return `1061163349,1061163349`;
  }
}
