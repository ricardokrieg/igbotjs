const VtopeAPI = require('./VtopeAPI');
const debug = require('debug')('bot:vtope:authorizeAccount');

const igUsername = `promocoesthe_`;
const igId       = `44513880809`;

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
