const { spawn } = require('child_process');
const debug = require('debug')('bot:create');
const fs = require('fs');

(async() => {
  debug('Start');

  const proxies = [ 0 ];
  const children = [];

  for (let proxy of proxies) {
    children.push(new Promise((resolve, reject) => {
      const outputStream = fs.createWriteStream(`./output_${proxy}.log`);
      const env = { ...process.env, PROXY_INDEX: proxy, DEBUG: '*' };
      const cmd = spawn('yarn', ['brabosburguer/createAndMassDM'], { env });

      debug(cmd.spawnargs.join(' '));

      cmd.stdout.pipe(outputStream);
      cmd.stderr.pipe(outputStream);
      // cmd.stdout.on('data', (data) => debug(`${data}`));
      // cmd.stderr.on('data', (data) => console.error(`${data}`));

      cmd.on('error', reject);
      cmd.on('exit', resolve);
    }));
  }

  await Promise.all(children);

  debug('End');
  process.exit(0);
})();
