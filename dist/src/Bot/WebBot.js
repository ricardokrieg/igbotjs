"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const _debug = __importStar(require("debug"));
const debug = _debug.debug('WebBot');
const InvalidAccount_1 = require("../AccountManager/InvalidAccount");
const UserNotFound_1 = require("./UserNotFound");
const InvalidResponse_1 = require("./InvalidResponse");
const TooManyRequests_1 = require("./TooManyRequests");
const defaultOptions = (cookieJar, headers, customHeaders) => {
    return {
        baseUrl: 'https://www.instagram.com',
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
class WebBot {
    constructor(account) {
        const { cookies, userAgent, csrfToken, igWwwClaim, instagramAjax, } = account;
        if (!cookies || !userAgent || !csrfToken || !igWwwClaim || !instagramAjax) {
            throw new InvalidAccount_1.InvalidAccount(account.username);
        }
        const cookieStore = new tough_cookie_1.MemoryCookieStore();
        this.cookieJar = request_1.jar(cookieStore);
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
                    return yield request_promise_1.default(lodash_1.defaultsDeep({}, options, defaultOptions(this.cookieJar, this.headers, {})));
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
                throw new TooManyRequests_1.TooManyRequests(username, response.statusMessage);
            }
            if (response.statusCode !== 200) {
                throw new InvalidResponse_1.InvalidResponse(username, response.statusCode);
            }
            const pk = response.body.match(/profilePage_(\d+)/)[1];
            debug(pk);
            return Promise.resolve(pk);
        });
    }
    _follow(pk, referer) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                url: `/web/friendships/${pk}/follow/`,
                method: `POST`,
            };
            const response = yield attempt_1.retry(() => __awaiter(this, void 0, void 0, function* () {
                return request_promise_1.default(lodash_1.defaultsDeep({}, options, defaultOptions(this.cookieJar, this.headers, { 'Referer': referer })));
            }), attemptOptions);
            debug(response.body);
            return Promise.resolve(response);
        });
    }
}
exports.WebBot = WebBot;
//# sourceMappingURL=WebBot.js.map