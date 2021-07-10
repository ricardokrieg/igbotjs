const Chance = require('chance');
const { toPairs } = require('lodash');

const extractCookie = (cookieJar, key) => {
  const cookies = cookieJar.getCookies(`https://i.instagram.com`);
  return find(cookies, { key }) || null;
}

const extractCookieValue = (cookieJar, key) => {
  const cookie = extractCookie(cookieJar, key);
  if (cookie === null) {
    throw new Error(`Could not find ${key}`);
  }

  return cookie.value;
}

const getRandomId = () => {
  return new Chance().guid();
}

const getRandomAndroidId = () => {
  const id = new Chance().string({
    pool: 'abcdef0123456789',
    length: 16,
  });

  return `android-${id}`;
};

const batteryLevel = (seed) => {
  const chance = new Chance(seed);
  const percentTime = chance.integer({ min: 200, max: 600 });
  return 100 - (Math.round(Date.now() / 1000 / percentTime) % 100);
}

const upCaseHeaders = (headers) => {
  const modifiedHeaders = {};

  for (let kv of toPairs(headers)) {
    const newKey = kv[0]
      .replace(/x-ig/i, 'X-IG')
      .replace(/x-ig-device-id/i, 'X-IG-Device-ID')
      .replace(/x-ig-family-device-id/i, 'X-IG-Family-Device-ID')
      .replace(/x-ig-android-id/i, 'X-IG-Android-ID')
      .replace(/x-ig-app-id/i, 'X-IG-App-ID')
      .replace(/x-mid/i, 'X-MID')
      .replace(/x-fb-http-engine/i, 'X-FB-HTTP-Engine')
      .replace(/x-fb-client-ip/i, 'X-FB-Client-IP')
      .replace(/x-fb-server-cluster/i, 'X-FB-Server-Cluster')
      .replace(/x-bloks-is-layout-rtl/i, 'X-Bloks-Is-Layout-RTL')
      .replace(/x-ig-bandwidth-speed-kbps/i, 'X-IG-Bandwidth-Speed-KBPS')
      .replace(/x-ig-bandwidth-totalbytes-b/i, 'X-IG-Bandwidth-TotalBytes-B')
      .replace(/x-ig-bandwidth-totaltime-ms/i, 'X-IG-Bandwidth-TotalTime-MS')
      .replace(/x-ig-www/i, 'X-IG-WWW')
      .replace(/ig-intended-user-id/i, 'IG-INTENDED-USER-ID')
      .replace(/content-type/i, 'Content-Type');
    modifiedHeaders[newKey] = kv[1];
  }

  return modifiedHeaders;
};

const appendDefaultHeaders = (headers, isGzip = false) => {
  const gzipHeaders = {};
  if (isGzip) {
    gzipHeaders['Content-Encoding'] = 'gzip';
  }

  const defaultHeaders = {
    'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`,
    'Accept-Encoding': `gzip, deflate`,
    'Host': `i.instagram.com`,
    'X-FB-HTTP-Engine': `Liger`,
    'X-FB-Client-IP': `True`,
    'X-FB-Server-Cluster': `True`,
    'Connection': `close`,
  }

  return {
    ...headers,
    ...gzipHeaders,
    ...defaultHeaders,
  };
};

module.exports = {
  extractCookieValue,
  getRandomId,
  getRandomAndroidId,
  batteryLevel,
  upCaseHeaders,
  appendDefaultHeaders,
};
