import fs from 'fs';
import * as _debug from 'debug';
const debug = _debug.debug('Importer');

import {AccountStore, Account} from './AccountStore';

export class Importer {
  static async importFromCurl(username: string, filePath: string): Promise<void> {
    debug(`Importing ${username} from file ${filePath}`);

    const data = fs.readFileSync(filePath,{encoding:'utf8', flag:'r'});
    const account: Account = this.buildAccountFromCurl(username, data);
    debug(account);

    return AccountStore.save(account);
  }

  static buildAccountFromCurl(username: string, data: string): Account {
    const account: Account = {
      username,
      password: 'xxx123xxx',
      taskProvider: 'Dizu',
      bot: 'Web',
    };

    const attrs = {
      igWwwClaim: /.*?x-ig-www-claim: (.*)'.*?/,
      instagramAjax: /.*?x-instagram-ajax: (.*)'.*?/,
      userAgent: /.*?user-agent: (.*)'.*?/,
      csrfToken: /.*?x-csrftoken: (.*)'.*?/,
      cookies: /.*?cookie: (.*)'.*?/,
    }

    let result;
    for (const line of data.split("\n")) {
      for (const [key, value] of Object.entries(attrs)) {
        result = line.match(value);
        if (result) {
          account[key] = result[1];
          break;
        }
      }
    }

    for (const key of Object.keys(attrs)) {
      if (!account[key]) {
        throw new Error(`CURL Request is missing attribute ${key}`);
      }
    }

    return account;
  }
}
