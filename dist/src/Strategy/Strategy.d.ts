import { Account } from '../AccountManager/AccountStore';
export declare class Strategy {
    account: Account;
    constructor(account: Account);
    start(followCount: number): Promise<void>;
}
