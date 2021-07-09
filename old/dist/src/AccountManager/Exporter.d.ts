import { Account } from './AccountStore';
export declare class Exporter {
    static exportAll(filePath: string): Promise<void>;
    static accountToCsv(account: Account): string;
}
