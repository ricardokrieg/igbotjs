const VtopeAPI = require('./VtopeAPI');
const debug = require('debug')('bot:vtope:authorizeAccount');

const atoken = `GFyZo5Ddh7amDMHBjNpZhjciQRMYTxys`;

(async () => {
  let data;

  try {
    const api = new VtopeAPI();

    data = await api.accountData({ atoken });
    debug(data);

    // data = await api.requestLike({ atoken });
    // data = await api.requestFollow({ atoken });
    // debug(data);

    // data = await api.taskSuccess({ atoken, id: data.id });
    // data = await api.taskError({ atoken, id: data.id, errorType: 'doerror' });
    // debug(data);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
