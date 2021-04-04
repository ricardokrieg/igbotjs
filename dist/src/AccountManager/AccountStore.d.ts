import 'firebase/firestore';
export interface Account {
    username: string;
    password: string;
    taskProvider: string;
    bot: string;
    proxy?: string;
    cookies?: string;
    userAgent?: string;
    csrfToken?: string;
    igWwwClaim?: string;
    instagramAjax?: string;
}
export declare class AccountStore {
    static find(username: string): Promise<Account>;
    static all(): Promise<Account[]>;
    static save(account: Account): Promise<void>;
    static buildAccountFromData(data: any): Account;
}
