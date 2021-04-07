import { Account } from './AccountStore';
export declare class Importer {
    static importFromCurl(username: string, filePath: string): Promise<void>;
    static buildAccountFromCurl(username: string, data: string): Account;
}
