const { logHandler } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const DBManager = require('../DBManager');

(async () => {
  log('Start');

  const dbManager = new DBManager({ username: '' });
  const targetDocs = await dbManager.targetsCol().get();

  log(`Total: ${targetDocs._size}`);

  process.exit(0);
})();
