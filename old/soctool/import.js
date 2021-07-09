const fs = require('fs').promises;
const parse = require('csv-parse/lib/sync');
const debug = require('debug')('bot:soctool:import');

const AccountManager = require('./AccountManager');

(async () => {
  const content = await fs.readFile(process.env.EXPORT_FILE, `utf8`);
  const columns = [`credentials`, `userAgent`, `device`, `cookies`, `proxy`, `emailCredentials`];
  const records = parse(content, { delimiter: `|`, quote: `'`, columns });

  for (let record of records) {
    try {
      await AccountManager.import(record);
    } catch (e) {
      console.error(e);
    }
  }
})();
