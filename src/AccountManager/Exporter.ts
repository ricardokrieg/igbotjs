import * as _debug from 'debug';
const debug = _debug.debug('Exporter');

import {AccountStore, Account} from './AccountStore';
import {File} from '../Utils/File';

export class Exporter {
  static async exportAll(filePath: string): Promise<void> {
    debug(`Exporting all accounts to ${filePath}`);

    const file: File = new File(filePath);
    const accounts = await AccountStore.all();

    for (const account of accounts) {
      file.append(this.accountToCsv(account));
    }

    debug(`Exported ${accounts.length} accounts`);
    return Promise.resolve();
  }

  static accountToCsv(account: Account): string {
    return `${account.username};${account.password}`;
  }
}
