const redis = require('redis');
const NodeResque = require('node-resque');
const moment = require('moment');
const inquirer = require('inquirer');

moment.locale('pt-br');

const { logger } = require('./utils');

const log = (message) => logger('StartAccount', message);


(async () => {
  const { username } = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username',
    },
  ]);

  const connectionDetails = {
    pkg: 'ioredis',
    host: '127.0.0.1',
    password: null,
    port: 6379,
    database: 0
  };

  const queue = new NodeResque.Queue({ connection: connectionDetails }, []);
  queue.on('error', function (error) { log(error) });

  await queue.connect();
  const client = redis.createClient();
  const key = `resque:timestamps:{"class":"actions-job","queue":"bot-queue","args":[{"username":"${username}"}]}`;
  client.type(key, function(err, type) {
    if (type === 'set') {
      client.smembers(key, function(err, members) {
        const timestamp = moment.unix(members[0].split(':')[1]).format('lll');
        log(`${username} is already scheduled to ${timestamp}.`);
      });
    } else {
      log(`Starting ${username}...`);
      queue.enqueue('bot-queue', 'actions-job', { username });
    }
  });

})();
