const Chance = require('chance');
const { toPairs,
  sampleSize,
  sample,
  defaults,
  sortBy,
  shuffle,
  map,
  flatten,
  compact,
  uniq,
  filter,
} = require('lodash');
const parse = require('csv-parse/lib/sync');
const crypto = require('crypto');
const fs = require('fs');
const request = require('request-promise');
const { retry } = require('@lifeomic/attempt');

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
  const files = filter(fs.readdirSync(path), (file) => file.endsWith('.jpg'));
  return sampleSize(files, count).map(file => `${path}${file}`);
};

const randomUserAgent = (country) => {
  let data;
  let userAgent;

  switch (country) {
    case 'BR':
      data = fs.readFileSync('./src/burp/res/user-agents_instagram-app_application_android_pt-br.txt', 'utf8');
      userAgent = sample(compact(data.split("\n")));
      break;
    case 'RU':
      data = fs.readFileSync('./src/burp/res/user-agents_instagram-app_application_android_ru-ru.txt', 'utf8');
      userAgent = sample(compact(data.split("\n")));
      break;
    case 'FR':
      data = fs.readFileSync('./src/burp/res/user-agents_instagram-app_application_android_fr-fr.txt', 'utf8');
      userAgent = sample(compact(data.split("\n")));
      break;
  }

  if (userAgent) {
    const match = /.*?Android \((.*)\)/.exec(userAgent);
    return `(${match[1]})`;
  }

  throw new Error(`Invalid country: ${country}`);
}

const generateName = (gender) => {
  const chance = new Chance();
  let firstNameContent;

  const lastNameContent = fs.readFileSync(`./src/burp/res/sobrenomes.csv`, `utf8`);
  const lastNameColumns = [`sobrenome`, ``];
  const lastNameRecords = parse(lastNameContent, { delimiter: `,`, quote: `"`, columns: lastNameColumns });
  const lastName = chance.pickone(lastNameRecords)['sobrenome'];

  const firstNameColumns = [`KeyYear-Gender`,`NOME`,`TOTAL`];

  switch (gender) {
    case `female`:
      firstNameContent = fs.readFileSync(`./src/burp/res/nomesfeminino.up.csv`, `latin1`);
      break;
    case `male`:
      firstNameContent = fs.readFileSync(`./src/burp/res/nomesmasculino.up.csv`, `latin1`);
      break;
    default:
      throw new Error(`Gender not supported: ${gender}`);
  }

  const firstNameRecords = parse(firstNameContent, { delimiter: `,`, quote: `"`, columns: firstNameColumns });
  const firstName = chance.pickone(filter(firstNameRecords, (record) => parseInt(record['TOTAL']) >= 5))['NOME'];

  return {
    first_name: firstName,
    last_name: lastName,
  };
};

const generateBirthday = () => {
  const chance = new Chance();

  const birthday = chance.birthday({ type: 'adult' });
  const [year, month, day] = birthday.toISOString().split('T')[0].split('-');

  return {
    day: parseInt(day),
    month: parseInt(month),
    year: parseInt(year),
  };
};

const randomReelsTitle = () => {
  return sample([`😊`, `🎉`, `✨`, `😀`, `😁`, `😍`, `😘`, `🥰`, `😚`, `🥳`, `😻`, `💋`, `💅`]);
};

const generateAttrs = (country) => {
  const attrs = {
    igWwwClaim: 0,
    phoneId: getRandomId(),
    uuid: getRandomId(),
    androidId: getRandomAndroidId(),
    mid: 0,
    familyDeviceId: getRandomId(),
    waterfallId: getRandomId(),
  };

  switch (country) {
  case 'BR':
    return defaults(attrs, {
      proxy: 'http://hjraz:eBTeYwiM@conn4.trs.ai:56807',
      locale: `pt_BR`,
      language: `pt-BR`,
      country: `BR`,
      timezoneOffset: String(180 * -60),
      userAgent: `Instagram 187.0.0.32.120 Android ${randomUserAgent(country)}`,
    });
  case 'RU':
    return defaults(attrs, {
      proxy: 'socks5://ricardokrieg:xxx123xxx@5.61.56.223:10528', // Moscow
      // proxy: 'socks5://ricardokrieg:xxx123xxx@5.61.56.223:10175', // St Petersburg
      locale: `ru_RU`,
      language: `ru-RU`,
      country: `RU`,
      timezoneOffset: String(180 * 60),
      userAgent: `Instagram 187.0.0.32.120 Android ${randomUserAgent(country)}`,
    });
  case 'FR':
    return defaults(attrs, {
      proxy: 'socks5://37.1.216.47:10001',
      locale: `fr_FR`,
      language: `fr-FR`,
      country: `FR`,
      timezoneOffset: String(180 * 60),
      userAgent: `Instagram 187.0.0.32.120 Android ${randomUserAgent(country)}`,
    });
  }

  throw new Error(`Invalid country: ${country}`);
};

const generateUsernames = (firstName, lastName) => {
  firstName = firstName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z ]/gi, '')
    .toLowerCase()
    .replace(/ /g, '');
  lastName = lastName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z ]/gi, '')
    .toLowerCase();

  const patterns = [
    `${firstName}${lastName}`,
    `${firstName}.${lastName}`,
    `${firstName}_${lastName}`,
    `${lastName}${firstName}`,
    `${lastName}.${firstName}`,
    `${lastName}_${firstName}`,
    `${firstName}${lastName[0]}`,
    `${firstName}.${lastName[0]}`,
    `${firstName}_${lastName[0]}`,
    `${lastName[0]}${firstName}`,
    `${lastName[0]}.${firstName}`,
    `${lastName[0]}_${firstName}`,
  ];
  let usernames = [];

  for (let pattern of patterns) {
    usernames.push(flatten(map(pattern, (letter, i) => {
      if (!/[aeiou]/.exec(letter)) return null;

      return [
        [pattern.slice(0, i), letter, letter, pattern.slice(i + 1)].join(''),
        // [pattern.slice(0, i), letter, letter, letter, pattern.slice(i + 1)].join(''),
      ];
    })));
  }

  usernames = uniq(compact(flatten(usernames)));

  // usernames.push(`eu${firstName}${lastName}`);
  // usernames.push(`${firstName}${lastName}oficial`);
  // usernames.push(`${firstName}.${lastName}`);
  // usernames.push(`${firstName}_${lastName}`);
  // usernames.push(`${firstName}__${lastName}`);
  // usernames.push(`_${firstName}${lastName}`);
  // usernames.push(`${firstName}${lastName}_`);
  // usernames.push(`_${firstName}${lastName}_`);
  // usernames.push(`_${firstName}${lastName}_`);

  // return sortBy(usernames, 'length');
  return shuffle(usernames);
};

const getIP = async (client) => {
  return await retry(async () => request.get('https://ifconfig.me', { proxy: client.attrs.proxy }), {
    maxAttempts: 30,
    delay: 3000,
  });
};

const getProxy = (index) => {
  return [
    { name: 'RSocks RU St. Petersburg Beeline', address: 'socks5://5.61.56.223:10120' },
    // { name: 'RSocks RU St. Petersburg Yota', address: 'socks5://5.61.56.223:10627' },
    { name: 'AllProxy BR 4G Claro', address: 'http://127.0.0.1:8888' },
  ][index];
};

const randomProfile = (gender) => {
  switch (gender) {
    case `female`:
    case `male`:
      const basePath = `./res/images/${gender}`;
      const profile = sample(filter(fs.readdirSync(basePath), (dir) => !dir.startsWith('.')));

      return {
        profile,
        path: `${basePath}/${profile}/`,
      };
    default:
      throw new Error(`Gender not supported: ${gender}`);
  }
}

const getRandomBiography = () => {
  const chance = new Chance();

  const type = chance.weighted([`blank`, `phrase`, `emoji`], [4, 2, 1]);

  switch (type) {
    case `blank`:
      return ``;
    case `phrase`:
      const phraseData = fs.readFileSync('./src/burp/res/frases.txt', 'utf8');
      return sample(filter(compact(phraseData.split("\n\n")), (phrase) => phrase.length <= 150));
    case `emoji`:
      const n = chance.integer({ min: 1, max: 3 });
      const emojis = chance.pickset([`🙈`, `😁`, `🙃`, `😛`, `😎`, `🥳`, `🥶`, `🤠`, `😼`, `🙌`, `🤛`, `🙏`, `👀`], n);
      return emojis.join(` `);
    default:
      return ``;
  }
}

const promiseTimeout = (ms, promise) => {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error('Timed out in '+ ms + 'ms.'));
    }, ms);
  });

  return Promise.race([
    promise,
    timeout
  ]);
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
  randomUserAgent,
  generateName,
  generateBirthday,
  generateAttrs,
  randomReelsTitle,
  generateUsernames,
  getIP,
  randomProfile,
  getProxy,
  getRandomBiography,
  promiseTimeout,
};
