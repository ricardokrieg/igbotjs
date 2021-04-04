import * as _debug from 'debug';
const debug = _debug.debug('igbotjs');

import {Runner} from './Runner/Runner';
import {AccountManager, Account} from './AccountManager/AccountManager';

(async () => {
  try {
    const username: string = process.env.IG_USERNAME;
    const followCount: number = parseInt(process.env.FOLLOW_COUNT);

    const account: Account = await AccountManager.find(username);
    debug(account);

    debug(`Starting ${username}`);
    const runner = new Runner(account);
    return await runner.run(followCount);
  } catch (err) {
    console.error(err);
  }

  return Promise.resolve();
})();
