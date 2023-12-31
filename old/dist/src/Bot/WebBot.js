"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebBot = void 0;
const attempt_1 = require("@lifeomic/attempt");
const request_promise_1 = __importDefault(require("request-promise"));
const lodash_1 = require("lodash");
const request_1 = require("request");
const tough_cookie_1 = require("tough-cookie");
const debug_1 = __importDefault(require("debug"));
let debug = debug_1.default('WebBot');
const InvalidAccount_1 = require("../AccountManager/InvalidAccount");
const UserNotFound_1 = require("./UserNotFound");
const InvalidResponse_1 = require("./InvalidResponse");
const TooManyRequests_1 = require("./TooManyRequests");
const FeedbackRequired_1 = require("./FeedbackRequired");
const defaultOptions = (proxy, cookieJar, headers, customHeaders) => {
    return {
        baseUrl: 'https://www.instagram.com',
        proxy,
        jar: cookieJar,
        gzip: true,
        headers: lodash_1.defaultsDeep({}, customHeaders, headers),
        method: 'GET',
        resolveWithFullResponse: true,
    };
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
class WebBot {
    constructor(account) {
        const { username, proxy, cookies, userAgent, csrfToken, igWwwClaim, instagramAjax, } = account;
        if (!cookies || !userAgent || !csrfToken || !igWwwClaim || !instagramAjax) {
            throw new InvalidAccount_1.InvalidAccount(username);
        }
        debug = debug.extend(username);
        this.username = username;
        this.proxy = proxy;
        if (!proxy) {
            console.warn(`Account ${username} has no proxy`);
        }
        const cookieStore = new tough_cookie_1.MemoryCookieStore();
        this.cookieJar = request_1.jar(cookieStore);
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
    follow(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const pk = yield this._userInfo(username);
            return this._follow(pk, `https://www.instagram.com/${username}/`);
        });
    }
    _userInfo(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                url: `/${username}/`,
                method: `GET`,
            };
            const response = yield attempt_1.retry(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield this._request(options, {});
                }
                catch (err) {
                    if ([404, 429].includes(err.response.statusCode)) {
                        return err.response;
                    }
                    else {
                        throw err;
                    }
                }
            }), attemptOptions);
            if (response.statusCode === 404) {
                throw new UserNotFound_1.UserNotFound(username, response.statusMessage);
            }
            if (response.statusCode === 429) {
                throw new TooManyRequests_1.TooManyRequests(options.url, response.statusMessage);
            }
            if (response.statusCode !== 200) {
                throw new InvalidResponse_1.InvalidResponse(options.url, response.statusCode);
            }
            try {
                const pk = response.body.match(/profilePage_(\d+)/)[1];
                debug(`PK: ${pk}`);
                return Promise.resolve(pk);
            }
            catch (err) {
                debug(response.body);
                throw err;
            }
        });
    }
    _follow(pk, referer) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                url: `/web/friendships/${pk}/follow/`,
                method: `POST`,
            };
            const response = yield attempt_1.retry(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield this._request(options, { 'Referer': referer });
                }
                catch (err) {
                    if ([400, 429].includes(err.response.statusCode)) {
                        return err.response;
                    }
                    else {
                        throw err;
                    }
                }
            }), attemptOptions);
            if (response.statusCode === 400) {
                throw new FeedbackRequired_1.FeedbackRequired(this.username, response.body);
            }
            if (response.statusCode === 429) {
                throw new TooManyRequests_1.TooManyRequests(options.url, response.statusMessage);
            }
            debug(response.body);
            return Promise.resolve(response);
        });
    }
    _request(options, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield request_promise_1.default(lodash_1.defaultsDeep({}, options, defaultOptions(this.proxy, this.cookieJar, this.headers, headers)));
            return Promise.resolve(response);
        });
    }
}
exports.WebBot = WebBot;
//# sourceMappingURL=WebBot.js.map