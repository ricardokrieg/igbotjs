import { CookieJar } from 'request';
export default class InstaWebBot {
    cookieJar: CookieJar;
    headers: any;
    constructor(cookies: string);
    follow(username: string): Promise<void>;
    _userInfo(username: string): Promise<string>;
    _follow(pk: string, referer: string): Promise<void>;
}
