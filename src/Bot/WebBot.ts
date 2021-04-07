import { retry } from '@lifeomic/attempt';
import request from 'request-promise';
import { defaultsDeep } from 'lodash';
import { CookieJar, jar } from 'request';
import { MemoryCookieStore } from 'tough-cookie';
import _debug from 'debug';
let debug = _debug('WebBot');

import {Account} from '../AccountManager/AccountStore';
import {InvalidAccount} from '../AccountManager/InvalidAccount';
import {UserNotFound} from './UserNotFound';
import {InvalidResponse} from './InvalidResponse';
import {TooManyRequests} from "./TooManyRequests";
import {FeedbackRequired} from "./FeedbackRequired";

const defaultOptions = (proxy, cookieJar, headers, customHeaders) => {
  return {
    baseUrl: 'https://www.instagram.com',
    proxy,
    jar: cookieJar,
    gzip: true,
    headers: defaultsDeep({}, customHeaders, headers),
    method: 'GET',
    resolveWithFullResponse: true,
  }
};

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

export class WebBot {
  username: string;
  cookieJar: CookieJar;
  headers: any;
  proxy?: string;

  constructor(account: Account) {
    const {
      username,
      proxy,
      cookies,
      userAgent,
      csrfToken,
      igWwwClaim,
      instagramAjax,
    } = account;

    if (!cookies || !userAgent || !csrfToken || !igWwwClaim || !instagramAjax) {
      throw new InvalidAccount(username);
    }

    debug = debug.extend(username);

    this.username = username;
    this.proxy = proxy;
    if (!proxy) {
      console.warn(`Account ${username} has no proxy`);
    }

    const cookieStore = new MemoryCookieStore();
    this.cookieJar = jar(cookieStore);

    for (const cookie of cookies.split(`;`)) {
      this.cookieJar.setCookie(cookie.trim(), `https://www.instagram.com/`);
    }

    this.headers = {
      'Host': `www.instagram.com`,
      'Connection': `close`,
      'sec-ch-ua': `"Chromium";v="89", ";Not A Brand";v="99"`,
      'X-IG-WWW-Claim': igWwwClaim,
      'sec-ch-ua-mobile': `?0`,
      'X-Instagram-AJAX': instagramAjax,
      'Content-Type': `application/x-www-form-urlencoded`,
      'Accept': `*/*`,
      'X-Requested-With': `XMLHttpRequest`,
      'User-Agent': userAgent,
      'X-CSRFToken': csrfToken,
      'X-IG-App-ID': `936619743392459`,
      'Origin': `https://www.instagram.com`,
      'Sec-Fetch-Site': `same-origin`,
      'Sec-Fetch-Mode': `cors`,
      'Sec-Fetch-Dest': `empty`,
      'Accept-Encoding': `gzip, deflate`,
      'Accept-Language': `en-US,en;q=0.9`,
    };
  }

  async follow(username: string): Promise<any> {
    const pk = await this._userInfo(username);

    return this._follow(pk, `https://www.instagram.com/${username}/`);
  }

  async _userInfo(username: string): Promise<string> {
    const options = {
      url: `/${username}/`,
      method: `GET`,
    };

    const response = await retry(async (): Promise<any> => {
      try {
        return await this._request(options, {});
      } catch (err) {
        if ([404, 429].includes(err.response.statusCode)) {
          return err.response;
        } else {
          throw err;
        }
      }
    }, attemptOptions);

    if (response.statusCode === 404) {
      throw new UserNotFound(username, response.statusMessage);
    }

    if (response.statusCode === 429) {
      throw new TooManyRequests(options.url, response.statusMessage);
    }

    if (response.statusCode !== 200) {
      throw new InvalidResponse(options.url, response.statusCode);
    }

    try {
      const pk = response.body.match(/profilePage_(\d+)/)[1];
      debug(`PK: ${pk}`);
      return Promise.resolve(pk);
    } catch (err) {
      debug(response.body);
      throw err;
    }
  }

  async _follow(pk: string, referer: string): Promise<any> {
    const options = {
      url: `/web/friendships/${pk}/follow/`,
      method: `POST`,
    };

    const response = await retry(async () => {
      try {
        return await this._request(options, { 'Referer': referer });
      } catch (err) {
        if ([400, 429].includes(err.response.statusCode)) {
          return err.response;
        } else {
          throw err;
        }
      }
    }, attemptOptions);

    if (response.statusCode === 400) {
      throw new FeedbackRequired(this.username, response.body);
    }

    if (response.statusCode === 429) {
      throw new TooManyRequests(options.url, response.statusMessage);
    }

    debug(response.body);

    return Promise.resolve(response);
  }

  async _request(options, headers): Promise<any> {
    const response = await request(
      defaultsDeep(
        {},
        options,
        defaultOptions(this.proxy, this.cookieJar, this.headers, headers)
      )
    )

    return Promise.resolve(response);
  }
}
