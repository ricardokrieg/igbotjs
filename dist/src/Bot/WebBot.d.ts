import { CookieJar } from 'request';
import { Account } from '../AccountManager/AccountStore';
export declare class WebBot {
    cookieJar: CookieJar;
    headers: any;
    proxy?: string;
    constructor(account: Account);
    follow(username: string): Promise<any>;
    _userInfo(username: string): Promise<string>;
    _follow(pk: string, referer: string): Promise<any>;
}
