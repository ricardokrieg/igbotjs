import * as _debug from 'debug';
import {Account} from '../AccountManager/AccountStore';
import {Sleep} from "../Utils/Sleep";
import {TaskMethod, TaskStatus} from "../TaskProvider/TaskProvider";
import {DizuTaskProvider} from "../TaskProvider/DizuTaskProvider/DizuTaskProvider";
import {WebBot} from "../Bot/WebBot";
import {UserNotFound} from "../Bot/UserNotFound";
import {TooManyRequests} from "../Bot/TooManyRequests";

const debug = _debug.debug('Strategy');

export class Strategy {
  account: Account;

  constructor(account: Account) {
    this.account = account;
  }

  async start(followCount: number): Promise<void> {
    const taskProvider = new DizuTaskProvider();
    const webBot = new WebBot(this.account);

    try {
      let i = 1;

      while (i <= followCount) {
        debug(`Task #${i}`);

        if (i > 1) {
          await Sleep(5000);
        }

        const task = await taskProvider.getTask({ tasker: this.account });
        debug(task);

        if (task.method === TaskMethod.Follow) {
          try {
            await webBot.follow(task.username);
            await taskProvider.confirmTask({ task, status: TaskStatus.Success });
          } catch (err) {
            await taskProvider.confirmTask({ task, status: TaskStatus.Error });

            if (err instanceof UserNotFound) {
              debug(err);
            } else if (err instanceof TooManyRequests) {
              debug(err);
              await Sleep(120000);
            } else {
              throw err;
            }
          }
        }

        i++;
      }
    } finally {
      await taskProvider.quit();
    }
  }
}
