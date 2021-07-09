import { Account } from '../AccountManager/AccountManager';
export declare class Runner {
    account: Account;
    constructor(account: Account);
    run(followCount: number): Promise<void>;
}
