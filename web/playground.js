const request = require('request-promise');
const { retry } = require('@lifeomic/attempt');
const { jar } = require('request');
const { MemoryCookieStore } = require('tough-cookie');
const { defaultsDeep } = require('lodash');
const debug = require('debug')('bot:web:playground');

const defaultOptions = (cookieJar, headers, customHeaders) => {
  return {
    baseUrl: 'https://www.instagram.com',
    jar: cookieJar,
    gzip: true,
    headers: defaultsDeep({}, customHeaders, headers),
    method: 'GET',
    resolveWithFullResponse: true,
  }
};

const headers = {
  'Host': `www.instagram.com`,
  'Connection': `close`,
  'sec-ch-ua': `"Chromium";v="89", ";Not A Brand";v="99"`,
  'X-IG-WWW-Claim': `hmac.AR2FWPV2Vx6EMD_MZInvNv6D61zAwDfZ5cCyPIpJR4tX7o3G`,
  'sec-ch-ua-mobile': `?0`,
  'X-Instagram-AJAX': `57d3ee0bd5af`,
  'Content-Type': `application/x-www-form-urlencoded`,
  'Accept': `*/*`,
  'X-Requested-With': `XMLHttpRequest`,
  'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36`,
  'X-CSRFToken': `8BsxV5p3KaZU7z4HoZOpAMt6fkSMsapx`,
  'X-IG-App-ID': `936619743392459`,
  'Origin': `https://www.instagram.com`,
  'Sec-Fetch-Site': `same-origin`,
  'Sec-Fetch-Mode': `cors`,
  'Sec-Fetch-Dest': `empty`,
  'Accept-Encoding': `gzip, deflate`,
  'Accept-Language': `en-US,en;q=0.9`,
};

const cookieStore = new MemoryCookieStore();
const cookieJar = jar(cookieStore);

const cookies = `ig_did=60B25B9C-792F-443B-A9DE-0946363905A7; ig_nrcb=1; mid=YGPWpgALAAExMIOsnQFE_NhJYu13; ds_user_id=47107115828; sessionid=47107115828%3AEyf8lBvc9c4AMB%3A4; csrftoken=8BsxV5p3KaZU7z4HoZOpAMt6fkSMsapx; rur=ATN`;
for (let cookie of cookies.split(`;`)) {
  cookieJar.setCookie(cookie.trim(), `https://www.instagram.com/`);
}

const attemptOptions = {
  maxAttempts: 100,
  delay: 3000,
  factor: 1.2,
  handleError: (error, context, options) => {
    console.error(error);
    console.error(context);
    console.error(options);
  }
};

const userInfo = async (targetUsername) => {
  const options = {
    url: `/${targetUsername}/`,
    method: `GET`,
  };

  const response = await retry(async () => {
    return request(
      defaultsDeep(
        {},
        options,
        defaultOptions(cookieJar, headers)
      )
    )
  }, attemptOptions);

  debug(response);
  const targetId = response.body.match(/profilePage_(\d+)/)[1];

  debug(targetId);
  return targetId;
}

const follow = async (targetId, referer) => {
  const options = {
    url: `/web/friendships/${targetId}/follow/`,
    method: `POST`,
  };

  const response = await retry(async () => {
    return request(
      defaultsDeep(
        {},
        options,
        defaultOptions(cookieJar, headers, { 'Referer': referer })
      )
    )
  }, attemptOptions);

  debug(response);
}

(async () => {
  const targetUsername = process.env.TARGET_USERNAME;

  const targetId = await userInfo(targetUsername);
  await follow(targetId, `https://www.instagram.com/${targetUsername}/`);
})();
