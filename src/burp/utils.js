const Chance = require('chance');
const { toPairs } = require('lodash');
const crypto = require('crypto');

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

// const upCaseHeaders = (headers) => {
//   const modifiedHeaders = {};
//
//   for (let kv of toPairs(headers)) {
//     const newKey = kv[0]
//       .replace(/x-ig/i, 'X-IG')
//       .replace(/x-ig-device-id/i, 'X-IG-Device-ID')
//       .replace(/x-ig-family-device-id/i, 'X-IG-Family-Device-ID')
//       .replace(/x-ig-android-id/i, 'X-IG-Android-ID')
//       .replace(/x-ig-app-id/i, 'X-IG-App-ID')
//       .replace(/x-mid/i, 'X-MID')
//       .replace(/x-fb-http-engine/i, 'X-FB-HTTP-Engine')
//       .replace(/x-fb-client-ip/i, 'X-FB-Client-IP')
//       .replace(/x-fb-server-cluster/i, 'X-FB-Server-Cluster')
//       .replace(/x-bloks-is-layout-rtl/i, 'X-Bloks-Is-Layout-RTL')
//       .replace(/x-ig-bandwidth-speed-kbps/i, 'X-IG-Bandwidth-Speed-KBPS')
//       .replace(/x-ig-bandwidth-totalbytes-b/i, 'X-IG-Bandwidth-TotalBytes-B')
//       .replace(/x-ig-bandwidth-totaltime-ms/i, 'X-IG-Bandwidth-TotalTime-MS')
//       .replace(/x-ig-www/i, 'X-IG-WWW')
//       .replace(/ig-intended-user-id/i, 'IG-INTENDED-USER-ID')
//       .replace(/content-type/i, 'Content-Type');
//     modifiedHeaders[newKey] = kv[1];
//   }
//
//   return modifiedHeaders;
// };

const appendDefaultHeaders = (headers, method, isGzip = false) => {
  const gzipHeaders = {};
  if (isGzip) {
    gzipHeaders['Content-Encoding'] = 'gzip';
  }

  let defaultHeaders = {};

  const contentType = headers['Content-Type'];
  delete headers['Content-Type'];

  if (contentType !== undefined) {
    defaultHeaders['Content-Type'] = contentType;
  } else if (method === 'POST') {
    defaultHeaders['Content-Type'] = `application/x-www-form-urlencoded; charset=UTF-8`;
  }

  defaultHeaders = {
    ...defaultHeaders,
    ...gzipHeaders,
    'Accept-Encoding': `gzip, deflate`,
    'Host': `i.instagram.com`,
    'X-FB-HTTP-Engine': `Liger`,
    'X-FB-Client-IP': `True`,
    'X-FB-Server-Cluster': `True`,
    'Connection': `close`,
  }

  return {
    ...headers,
    ...defaultHeaders,
  };
};

const createJazoest = (input) => {
  const buf = Buffer.from(input, 'ascii');
  let sum = 0;
  for (let i = 0; i < buf.byteLength; i++) {
    sum += buf.readUInt8(i);
  }
  return `2${sum}`;
};

const encryptPassword = (client, password) => {
  const randKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const rsaEncrypted = crypto.publicEncrypt(
    {
      key: Buffer.from(client.attrs.passwordEncryptionPubKey, 'base64').toString(),
      // @ts-ignore
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    randKey,
  );
  const cipher = crypto.createCipheriv('aes-256-gcm', randKey, iv);
  const time = Math.floor(Date.now() / 1000).toString();
  cipher.setAAD(Buffer.from(time));
  const aesEncrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  const sizeBuffer = Buffer.alloc(2, 0);
  sizeBuffer.writeInt16LE(rsaEncrypted.byteLength, 0);
  const authTag = cipher.getAuthTag();

  const encrypted = Buffer.concat([
    Buffer.from([1, client.attrs.passwordEncryptionKeyId]),
    iv,
    sizeBuffer,
    rsaEncrypted,
    authTag,
    aesEncrypted,
  ]).toString('base64');

  return `#PWD_INSTAGRAM:4:${time}:${encrypted}`;
};

const getSnNonce = (id) => {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  // const random = crypto.randomBytes(12);
  const random = '123456789012';
  const str = `${id}|${timestamp}|${random.toString()}`;

  return Buffer.from(str).toString('base64');
};

const stringifyForGzip = (data) => {
  let output = ``;

  for (let kv of toPairs(data)) {
    if (kv[1] === undefined) {
      continue;
    }

    if (output.length > 0) {
      output += `&`;
    }

    const value = typeof kv[1] === 'object' ? JSON.stringify(kv[1]) : kv[1];
    output += `${kv[0]}=${value}`;
  }

  return output;
};

module.exports = {
  extractCookieValue,
  getRandomId,
  getRandomAndroidId,
  batteryLevel,
  // upCaseHeaders,
  appendDefaultHeaders,
  createJazoest,
  encryptPassword,
  getSnNonce,
  stringifyForGzip,
};
