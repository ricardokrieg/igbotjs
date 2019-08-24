import NodeResque from 'node-resque';
import moment from 'moment';

import Bot from './bot';

moment.locale('pt-br');


const log = (message) => {
  console.log(`[${moment().format('LTS')}] ${message}`);
};

(async () => {
  const connectionDetails = {
    pkg: 'ioredis',
    host: '127.0.0.1',
    password: null,
    port: 6379,
    database: 0
  };

  const jobs = {
    'actions': {
      perform: ({ username, password, proxy }) => {
        (new Bot(username, password, proxy)).start();

        return true;
      }
    }
  };

  const worker = new NodeResque.Worker({ connection: connectionDetails, queues: ['bot'] }, jobs);
  await worker.connect();
  worker.start();

  const scheduler = new NodeResque.Scheduler({ connection: connectionDetails });
  await scheduler.connect();
  scheduler.start();

  worker.on('start', () => { log('worker started') });
  worker.on('end', () => { log('worker ended') });
  worker.on('cleaning_worker', (worker, pid) => { log(`cleaning old worker ${worker}`) });
  worker.on('poll', (queue) => { log(`worker polling ${queue}`) });
  worker.on('ping', (time) => { log(`worker check in @ ${moment.unix(time).format('LTS')}`) });
  worker.on('job', (queue, job) => { log(`working job ${queue} ${JSON.stringify(job)}`) });
  worker.on('reEnqueue', (queue, job, plugin) => { log(`reEnqueue job (${plugin}) ${queue} ${JSON.stringify(job)}`) });
  worker.on('success', (queue, job, result) => { log(`job success ${queue} ${JSON.stringify(job)} >> ${result}`) });
  worker.on('failure', (queue, job, failure) => { log(`job failure ${queue} ${JSON.stringify(job)} >> ${failure}`) });
  worker.on('error', (error, queue, job) => { log(`error ${queue} ${JSON.stringify(job)}  >> ${error}`) });
  worker.on('pause', () => { log('worker paused') });

  scheduler.on('start', () => { log('scheduler started') });
  scheduler.on('end', () => { log('scheduler ended') });
  scheduler.on('poll', () => { log('scheduler polling') });
  scheduler.on('master', (state) => { log('scheduler became master') });
  scheduler.on('cleanStuckWorker', (workerName, errorPayload, delta) => { log(`failing ${workerName} (stuck for ${delta}s) and failing job ${errorPayload}`) });
  scheduler.on('error', (error) => { log(`scheduler error >> ${error}`) });
  scheduler.on('workingTimestamp', (timestamp) => { log(`scheduler working timestamp ${moment.unix(timestamp).format('LTS')}`) });
  scheduler.on('transferredJob', (timestamp, job) => { log(`scheduler enquing job ${moment.unix(timestamp).format('LTS')} >> ${JSON.stringify(job)}`) });

  const queue = new NodeResque.Queue({ connection: connectionDetails }, jobs);
  queue.on('error', function (error) { log(error) });

  await queue.connect();
  await queue.enqueue('bot', 'actions', {
    username: process.env.IG_USERNAME,
    password: process.env.IG_PASSWORD,
    proxy: process.env.IG_PROXY
  });
})();
