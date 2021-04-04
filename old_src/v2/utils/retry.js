const { quickSleep } = require('./sleep');

module.exports = async (command, ...params) => {
  return new Promise(async (resolve, reject) => {
    let r;
    let tries = 0;
    let error = null;
    while (true) {
      try {
        tries++;

        r = await command(params);

        break;
      } catch (err) {
        console.error(err);

        if (err.name === 'IgActionSpamError') {
          error = err;
          break;
        } else {
          if (tries < 5) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          } else {
            error = err;
            break;
          }
        }
      }
    }

    if (error === null) {
      await quickSleep();
      resolve(r);
    } else {
      reject(error);
    }
  });
}