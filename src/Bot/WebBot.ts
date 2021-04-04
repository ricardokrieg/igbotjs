import { retry } from '@lifeomic/attempt';
import request from 'request-promise';
import { defaultsDeep } from 'lodash';
import { CookieJar, jar } from 'request';
import { MemoryCookieStore } from 'tough-cookie';
import * as _debug from 'debug';
const debug = _debug.debug('WebBot');

import {Account} from '../AccountManager/AccountStore';
import {InvalidAccount} from '../AccountManager/InvalidAccount';
import {UserNotFound} from './UserNotFound';
import {InvalidResponse} from './InvalidResponse';
import {TooManyRequests} from "./TooManyRequests";

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

// const makeRequest = async (attrs): Promise<any> => {
//   try {
//     await request(attrs)
//   } catch (err) {
//     if (err.response.statusCode === 404) {
//       return Promise.resolve(err.response);
//     } else {
//       throw err;
//     }
//   }
// }

export class WebBot {
  cookieJar: CookieJar;
  headers: any;

  constructor(account: Account) {
    const {
      cookies,
      userAgent,
      csrfToken,
      igWwwClaim,
      instagramAjax,
    } = account;

    if (!cookies || !userAgent || !csrfToken || !igWwwClaim || !instagramAjax) {
      throw new InvalidAccount(account.username);
    }

    const cookieStore = new MemoryCookieStore();
    this.cookieJar = jar(cookieStore);

    for (let cookie of cookies.split(`;`)) {
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
        return await request(
          defaultsDeep(
            {},
            options,
            defaultOptions(this.cookieJar, this.headers, {})
          )
        )
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
      throw new TooManyRequests(username, response.statusMessage);
    }

    if (response.statusCode !== 200) {
      throw new InvalidResponse(username, response.statusCode);
    }

    const pk = response.body.match(/profilePage_(\d+)/)[1];

    debug(pk);
    return Promise.resolve(pk);
  }

  async _follow(pk: string, referer: string): Promise<any> {
    const options = {
      url: `/web/friendships/${pk}/follow/`,
      method: `POST`,
    };

    const response = await retry(async () => {
      return request(
        defaultsDeep(
          {},
          options,
          defaultOptions(this.cookieJar, this.headers, { 'Referer': referer })
        )
      )
    }, attemptOptions);

    debug(response.body);

    return Promise.resolve(response);
  }
}
