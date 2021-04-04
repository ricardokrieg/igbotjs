import { retry } from '@lifeomic/attempt';
import request from 'request-promise';
import { defaultsDeep } from 'lodash';
import { CookieJar, jar } from 'request';
import { MemoryCookieStore } from 'tough-cookie';
import * as _debug from 'debug';

const debug = _debug.debug('InstaWebBot');

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

export default class InstaWebBot {
    cookieJar: CookieJar;
    headers: any;

    constructor(cookies: string) {
        const cookieStore = new MemoryCookieStore();
        this.cookieJar = jar(cookieStore);

        for (let cookie of cookies.split(`;`)) {
            this.cookieJar.setCookie(cookie.trim(), `https://www.instagram.com/`);
        }

        this.headers = {
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
    }

    async follow(username: string): Promise<void> {
        const pk = await this._userInfo(username);
        await this._follow(pk, `https://www.instagram.com/${username}/`);

        return Promise.resolve();
    }

    async _userInfo(username: string): Promise<string> {
        const options = {
            url: `/${username}/`,
            method: `GET`,
        };

        const response = await retry(async () => {
            return request(
                defaultsDeep(
                    {},
                    options,
                    defaultOptions(this.cookieJar, this.headers, {})
                )
            )
        }, attemptOptions);

        debug(response);
        const pk = response.body.match(/profilePage_(\d+)/)[1];

        debug(pk);
        return Promise.resolve(pk);
    }

    async _follow(pk: string, referer: string): Promise<void> {
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

        debug(response);

        return Promise.resolve();
    }
}
