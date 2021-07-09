const VtopeAPI = require('./VtopeAPI');
const debug = require('debug')('bot:vtope:authorizeAccount');

const igUsername = `marcoaureliokk`;
const igId       = `44903530855`;

(async () => {
  try {
    const api = new VtopeAPI();

    const data = await api.authorizeAccount({ id: igId, username: igUsername });
    debug(data);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
