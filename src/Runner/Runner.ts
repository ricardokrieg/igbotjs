import * as _debug from 'debug';
const debug = _debug.debug('Runner');

import {Account} from '../AccountManager/AccountManager';
import {Strategy} from '../Strategy/Strategy';

export class Runner {
  account: Account;

  constructor(account: Account) {
    this.account = account;
  }

  async run(followCount: number): Promise<void> {
    debug(`Running ${followCount} tasks for ${this.account.username}`);

    const strategy = new Strategy(this.account);
    return await strategy.start(followCount);
  }
}
