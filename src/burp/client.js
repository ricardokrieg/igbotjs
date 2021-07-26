const { defaults, toPairs, get } = require('lodash');
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

    this.attemptOptions = {
      maxAttempts: 30,
      delay: 3000,
      factor: 1.2,
      handleError: (error, context, options) => {
        // console.error(error);
        // console.error(context);
        // console.error(options);

        debug(`Error: ${get(error, 'error.message')}`);
        debug(get(error, 'options.url'));
        debug(`Attempt ${context.attemptNum + 1} of ${options.maxAttempts}`);
      }
    };
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
    const headers = options.headers || this.headers();
    const skipRescue = options['skipRescue'];
    delete options['skipRescue'];

    options = {
      ...options,
      headers: appendDefaultHeaders(headers, options.method),
    };

    const body = await retry(async () => {
      const response = await retry(async () => request(defaults(options, this.defaultOptions())), this.attemptOptions);

      try {
        this.parseHeaders(response);

        const body = JSON.parse(response.body);

        return Promise.resolve(body);
      } catch (error) {
        debug(`Error when parsing response: ${error.message}`);
        debug(response.body);
        if (skipRescue) {
          debug(`Skipping error rescue`);
          return Promise.resolve(null);
        }

        throw error;
      }
    }, this.attemptOptions);

    if (body.status === 'fail') {
      debug(options.url);
      debug(body);
      return Promise.reject(body);
    }

    return Promise.resolve(body);
  }

  async sendGzip(options) {
    const headers = options.headers || this.headers();

    options = {
      ...options,
      headers: appendDefaultHeaders(headers, options.method, true),
    };

    const response = await retry(async () => request(defaults(options, this.defaultOptions())), this.attemptOptions);

    this.parseHeaders(response);
    const body = JSON.parse(response.body);

    if (body.status === 'fail') {
      debug(body);
      return Promise.reject(response);
    }

    return Promise.resolve(body);
  }

  defaultOptions() {
    return {
      baseUrl: 'https://i.instagram.com',
      proxy: this.attrs.proxy,
      simple: false,
      jar: cookieJar,
      strictSSL: false,
      gzip: true,
      method: 'GET',
      resolveWithFullResponse: true,
    };
  }

  headers() {
    const headersBlock1 = {
      'X-IG-App-Locale': this.getLocale(),
      'X-IG-Device-Locale': this.getLocale(),
      'X-IG-Mapped-Locale': this.getLocale(),
      'X-Pigeon-Session-Id': this.getPigeonSessionId(),
      'X-Pigeon-Rawclienttime': (Date.now() / 1000).toFixed(3),
      'X-IG-Bandwidth-Speed-KBPS': `-1.000`,
      'X-IG-Bandwidth-TotalBytes-B': `0`,
      'X-IG-Bandwidth-TotalTime-MS': `0`,
      // 'X-Ig-App-Startup-Country': this.getCountry(),
      'X-Bloks-Version-Id': bloksVersionId,
      'X-IG-WWW-Claim': this.getIgWwwClaim(),
      'X-Bloks-Is-Layout-RTL': `false`,
      'X-Bloks-Is-Panorama-Enabled': `true`,
      'X-IG-Device-ID': this.getDeviceId(),
      'X-IG-Family-Device-ID': this.getFamilyDeviceId(),
      'X-IG-Android-ID': this.getAndroidId(),
      'X-IG-Timezone-Offset': this.getTimezoneOffset(),
      // 'X-Ig-Salt-Ids': this.getIgSaltIds(),
      'X-IG-Connection-Type': `WIFI`,
      'X-IG-Capabilities': `3brTvx0=`,
      'X-IG-App-ID': `567067343352427`,
      // 'Priority': `u=3`,
      'User-Agent': this.getUserAgent(),
      'Accept-Language': this.getLanguage(),
    };

    const headersBlock2 = {
      'X-MID': this.getMid(),
      'IG-U-DS-USER-ID': this.getUserId(),
      'IG-U-RUR': this.getRur(),
      'IG-INTENDED-USER-ID': this.getUserId(),
    };

    let headers = {
      ...headersBlock1,
    };

    if (this.attrs.authorization) {
      headers['Authorization'] = this.attrs.authorization;
    }

    headers = {
      ...headers,
      ...headersBlock2,
    };

    return headers;
  }

  parseHeaders(response) {
    for (let kv of toPairs(response.headers)) {
      const key = kv[0].toLowerCase();
      const value = kv[1];

      switch (key) {
        case 'x-ig-set-www-claim':
          this.attrs.igWwwClaim = value;
          break;
        case 'ig-set-authorization':
          if (!value.endsWith(':')) {
            this.attrs.authorization = value;
          }
          break;
        case 'ig-set-x-mid':
          this.attrs.mid = value;
          break;
        case 'ig-set-ig-u-ig-direct-region-hint':
          this.attrs.directRegionHint = value;
          break;
        case 'ig-set-ig-u-shbid':
          this.attrs.shbid = value;
          break;
        case 'ig-set-ig-u-shbts':
          this.attrs.shbts = value;
          break;
        case 'ig-set-ig-u-rur':
          // if (value.includes(',')) {
          //   this.attrs.rur = value.split(',')[0];
          // } else {
          //   this.attrs.rur = value;
          // }
          this.attrs.rur = value;

          break;
        case 'ig-set-ig-u-ds-user-id':
          this.attrs.userId = value;
          break;
        case 'ig-set-password-encryption-key-id':
          this.attrs.passwordEncryptionKeyId = value;
          break;
        case 'ig-set-password-encryption-pub-key':
          this.attrs.passwordEncryptionPubKey = value;
          break;
      }
    }

    // debug(this.attrs);
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

  setUsername(username) {
    this.attrs.username = username;
  }

  getUsername() {
    return this.attrs.username;
  }

  getWaterfallId() {
    return this.attrs.waterfallId;
  }

  getRur() {
    return this.attrs.rur;
  }

  getDirectRegionHint() {
    return this.attrs.directRegionHint;
  }
}
