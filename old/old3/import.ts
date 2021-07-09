import * as _debug from 'debug';
const debug = _debug.debug('igbotjs').extend('import');

import {Importer} from './AccountManager/Importer';

(async () => {
  try {
    const username: string = process.env.IG_USERNAME;
    const filePath: string = process.env.FILE_PATH;

    debug(`Importing ${username} from ${filePath}`);

    return await Importer.importFromCurl(username, filePath);
  } catch (err) {
    console.error(err);
  }

  return Promise.resolve();
})();
