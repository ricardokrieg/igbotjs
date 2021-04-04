import * as _debug from 'debug';
const debug = _debug.debug('AccountManager');

import {AccountStore, Account} from './AccountStore';
export {Account} from './AccountStore';

export class AccountManager {
  static async find(username: string): Promise<Account> {
    debug(`Find ${username}`);

    return AccountStore.find(username);
  }

  static async all(): Promise<Account[]> {
    const accounts = await AccountStore.all();
    debug(`Found ${accounts.length} accounts`);

    return Promise.resolve(accounts);
  }

  static async save(account: Account): Promise<void> {
    debug(`Saving ${account.username}`);
    debug(account);

    return AccountStore.save(account);
  }
}
