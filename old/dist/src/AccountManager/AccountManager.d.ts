import { Account } from './AccountStore';
export { Account } from './AccountStore';
export declare class AccountManager {
    static find(username: string): Promise<Account>;
    static all(): Promise<Account[]>;
    static save(account: Account): Promise<void>;
}
