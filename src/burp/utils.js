const Chance = require('chance');
const { toPairs, sampleSize, sample } = require('lodash');
const crypto = require('crypto');
const fs = require('fs');

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

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const randomFilesFromPath = (path, count) => {
  const files = fs.readdirSync(path);
  return sampleSize(files, count).map(file => `${path}${file}`);
};

const generateName = () => {
  const firstNameData = fs.readFileSync('./src/burp/res/female_first_name.txt', 'utf8');
  const lastNameData = fs.readFileSync('./src/burp/res/last_name.txt', 'utf8');

  const firstName = sample(firstNameData.split("\n"));
  const lastName = sample(lastNameData.split("\n"));

  return {
    first_name: firstName,
    last_name: lastName,
  };
};

module.exports = {
  extractCookieValue,
  getRandomId,
  getRandomAndroidId,
  batteryLevel,
  appendDefaultHeaders,
  createJazoest,
  encryptPassword,
  getSnNonce,
  stringifyForGzip,
  sleep,
  randomFilesFromPath,
  generateName,
};
