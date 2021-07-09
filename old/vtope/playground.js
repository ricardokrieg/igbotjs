const VtopeAPI = require('./VtopeAPI');
const debug = require('debug')('bot:vtope:authorizeAccount');

const atoken = `yGsm6ZWIWxwh79gPVVswvjmyS7eOjEa2`;

(async () => {
  let data;

  try {
    const api = new VtopeAPI();

    // data = await api.registerBot('macbook', 'igbotjs');
    // data = await api.authorizeAccount({ id: '48117313086', username: 'julianalins32' });

    // data = await api.accountData({ atoken });
    // debug(data);

    // data = await api.requestLike({ atoken });
    // data = await api.requestFollow({ atoken });
    // debug(data);

    data = await api.taskSuccess({ atoken, id: 942441878 });
    // data = await api.taskError({ atoken, id: data.id, errorType: 'doerror' });
    debug(data);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
