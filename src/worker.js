const NodeResque = require('node-resque');
const moment = require('moment');
const { random } = require('lodash');

moment.locale('pt-br');

const Bot = require('./bot');
const { sleep, logger } = require('./utils');

const log = (message) => logger('Worker', message);


(async () => {
  const connectionDetails = {
    pkg: 'ioredis',
    host: '127.0.0.1',
    password: null,
    port: 6379,
    database: 0
  };

  let queue = null;

  const jobs = {
    'actions-job': {
      perform: ({ username }) => {
        (async () => {
          log('Start');

          while(true) {
            try {
              await (new Bot({ username })).start();
              break;
            } catch (e) {
              console.log(e);
            }

            console.log('Try again...');
            await sleep(20000);
          }

          log('End');

          let enqueueTime = null;
          if (moment().hour() >= 22) {
            // Sleep. enqueue in 6~8 hours
            enqueueTime = random(6 * 60 * 60 * 1000, 8 * 60 * 60 * 1000);
          } else {
            // enqueue in 40~80 mins
            enqueueTime = random(40 * 60 * 1000, 80 * 60 * 1000);
          }
          log(`Scheduling to ${Math.round((enqueueTime / 1000) / 60)}min`);
          await queue.enqueueIn(enqueueTime, 'bot-queue', 'actions-job', { username });
        })();

        return `Bot started for ${username}`;
      }
    }
  };

  queue = new NodeResque.Queue({ connection: connectionDetails }, jobs);
  queue.on('error', function (error) { log(error) });

  const worker = new NodeResque.Worker({ connection: connectionDetails, queues: ['bot-queue'] }, jobs);
  await worker.connect();
  worker.start();

  const scheduler = new NodeResque.Scheduler({ connection: connectionDetails });
  await scheduler.connect();
  scheduler.start();

  worker.on('start', () => { log('worker started') });
  worker.on('end', () => { log('worker ended') });
  worker.on('cleaning_worker', (worker, pid) => { log(`cleaning old worker ${worker}`) });
  // worker.on('poll', (queue) => { log(`worker polling ${queue}`) });
  // worker.on('ping', (time) => { log(`worker check in @ ${moment.unix(time).format('LTS')}`) });
  worker.on('job', (queue, job) => { log(`working job ${queue} ${JSON.stringify(job)}`) });
  worker.on('reEnqueue', (queue, job, plugin) => { log(`reEnqueue job (${plugin}) ${queue} ${JSON.stringify(job)}`) });
  worker.on('success', (queue, job, result) => { log(`job success ${queue} ${JSON.stringify(job)} >> ${result}`) });
  worker.on('failure', (queue, job, failure) => { log(`job failure ${queue} ${JSON.stringify(job)} >> ${failure}`) });
  worker.on('error', (error, queue, job) => { log(`error ${queue} ${JSON.stringify(job)}  >> ${error}`) });
  // worker.on('pause', () => { log('worker paused') });

  scheduler.on('start', () => { log('scheduler started') });
  scheduler.on('end', () => { log('scheduler ended') });
  // scheduler.on('poll', () => { log('scheduler polling') });
  scheduler.on('master', (state) => { log('scheduler became master') });
  scheduler.on('cleanStuckWorker', (workerName, errorPayload, delta) => { log(`failing ${workerName} (stuck for ${delta}s) and failing job ${errorPayload}`) });
  scheduler.on('error', (error) => { log(`scheduler error >> ${error}`) });
  scheduler.on('workingTimestamp', (timestamp) => { log(`scheduler working timestamp ${moment.unix(timestamp).format('LTS')}`) });
  scheduler.on('transferredJob', (timestamp, job) => { log(`scheduler enquing job ${moment.unix(timestamp).format('LTS')} >> ${JSON.stringify(job)}`) });

  await queue.connect();
})();
