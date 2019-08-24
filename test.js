const { sample } = require('lodash');


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function call(command) {
  return new Promise(async (resolve, reject) => {
    let r;
    let tries = 0;
    while (true) {
      try {
        tries++;

        r = command();

        break;
      } catch (err) {
        console.log(`Error: ${err}`);

        if (tries < 5) {
          await sleep(5000);
        } else {
          throw err;
        }
      }
    }

    resolve(r);
  });
}

(async () => {
  const result = await call(() => {
    const x = sample([1, 2, 3, 4]);
    console.log(`=> ${x}`);

    if (x == 1) {
      return 'ok';
    } else {
      throw 'Bad Choice';
    }
  });

  console.log(`Result = ${result}`);
})();

