const { Line, LineBuffer } = require('clui');
const clc = require('cli-color');
const { spawn } = require('child_process');
const { createWriteStream } = require('fs');
const chance = require('chance').Chance();
const {last, get, compact, map, filter, reduce} = require('lodash');

const {
  sleep,
  getIP,
  getProxy,
} = require('../utils');

const minFollows = process.env.MIN;
if (!minFollows) {
  throw new Error(`MIN is required`);
}

const maxFollows = process.env.MAX;
if (!maxFollows) {
  throw new Error(`MAX is required`);
}

const proxyIndex = process.env.PROXY_INDEX;
if (!proxyIndex) {
  throw new Error(`PROXY_INDEX is required`);
}

const getColor = (thread) => {
  if (!thread.ready) {
    return clc.white;
  }

  if (thread.error) {
    return clc.red;
  }

  if (thread.warning) {
    return clc.yellow;
  }

  return clc.green;
};

const update = (outputBuffer, threads, config) => {
  outputBuffer.lines = [];

  new Line(outputBuffer)
    .column(`Proxy: ${config.proxyName} ${config.proxyAddress}`, outputBuffer.width())
    .fill()
    .store();

  const activeThreadsCount = filter(threads, 'running').length;
  new Line(outputBuffer)
    .column(`Threads: ${threads.length}`, 20)
    .column(`Active: ${activeThreadsCount}`, 10)
    .fill()
    .store();

  let status = config.status;
  if (status === `Done` && activeThreadsCount > 0) {
    status = `Waiting for threads`
  }
  const follows = reduce(threads, (sum, t) => sum + t.follows, 0);
  new Line(outputBuffer)
    .column(`Status: ${status}`, 20)
    .column(`Follows: ${follows}`, 20)
    .fill()
    .store();

  const cost = reduce(threads, (sum, t) => sum + t.cost, 0);
  const income = follows * 0.01 * 0.6;
  new Line(outputBuffer)
    .column(`Cost: ${(cost).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`, 20)
    .column(`Income: ${(income).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`, 20)
    .column(`Profit: ${(income - cost).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`, 20)
    .fill()
    .store();

  new Line(outputBuffer)
    .column(`ID`, 10, [clc.cyan])
    .column(`Start`, 10, [clc.cyan])
    .column(`IP`, 20, [clc.cyan])
    .column(`Username`, 20, [clc.cyan])
    .column(`Follows`, 10, [clc.cyan])
    .column(`Total`, 10, [clc.cyan])
    .column(`Active?`, 10, [clc.cyan])
    .column(`Ready?`, 10, [clc.cyan])
    .column(`Status`, 20, [clc.cyan])
    .fill()
    .store();

  for (let thread of threads) {
    const color = getColor(thread);

    new Line(outputBuffer)
      .column(thread.id.split('-')[0], 10, [color])
      .column(String(thread.start).split(' ')[4].split(':').slice(0, 2).join(':'), 10, [color])
      .column(thread.ip, 20, [color])
      .column(thread.username, 20, [color])
      .column(String(thread.follows), 10, [color])
      .column(String(thread.total), 10, [color])
      .column(thread.running ? 'Yes' : 'No', 10, [color])
      .column(thread.ready ? 'Yes' : 'No', 10, [color])
      .column(thread.status, 20, [color])
      .fill()
      .store();
  }

  outputBuffer.output();
};

const startUpdateThread = async (outputBuffer, threads, config) => {
  while (true) {
    update(outputBuffer, threads, config);
    await sleep(5 * 1000);
  }
};

const getStatus = (data) => {
  let match;

  if (/challenge_required/.exec(data)) {
    return { status: `Challenge Required`, ready: true, error: true };
  }
  if (/feedback_required/.exec(data)) {
    return { status: `Feedback Required`, ready: true, error: true };
  }
  if (/login_required/.exec(data)) {
    return { status: `Login Required`, ready: true, error: true };
  }

  if (/bot:sms ACCESS_CANCEL/.exec(data)) {
    return { status: `SMS didn't arrive`, ready: true, warning: true };
  }

  if (/bot:dizu No numbers available/.exec(data)) {
    return { status: `No numbers available`, ready: true, warning: true };
  }

  if (/bot:actions:openApp/.exec(data)) {
    return { status: `Open App` };
  }

  if (/bot:actions:signUpCompleteProfile/.exec(data)) {
    return { status: `Complete Profile` };
  }

  if (match = /bot:dizu IP \(start\): (.*)/.exec(data)) {
    return { ip: match[1] };
  }

  if (/bot:actions:signUp Validating SMS Code/.exec(data)) {
    return { cost: 0.35 };
  }

  if (match = /bot:dizu Account Created: username=(.*?) ip=(.*)/.exec(data)) {
    return { status: `Success`, username: match[1], ip: match[2], ready: true };
  }
  if (/bot:actions:signUp/.exec(data)) {
    return { status: `Sign Up` };
  }

  if (/bot:actions:feedSignUp/.exec(data)) {
    return { status: `Feed Sign Up` };
  }

  if (/bot:actions:visitSelfProfile/.exec(data)) {
    return { status: `Visit Self Profile` };
  }

  if (/bot:actions:visitEditProfile/.exec(data)) {
    return { status: `Visit Edit Profile` };
  }

  if (/bot:actions:updateBiography/.exec(data)) {
    return { status: `Update Biography` };
  }

  if (match = /bot:actions:addPost Start (.*)/.exec(data)) {
    return { status: `Add Post ${match[1]}` };
  }

  if (match = /bot:actions:addStory Start (.*)/.exec(data)) {
    return { status: `Add Story ${match[1]}` };
  }

  if (match = /bot:dizu Follow #(.*)/.exec(data)) {
    return { status: `Follow ${match[1]}`, follows: parseInt(match[1]) };
  }

  if (match = /bot:dizu Going to follow (.*)/.exec(data)) {
    return { total: parseInt(match[1]) };
  }

  return { status: null, username: null };
};

const createThread = () => {
  const id = chance.guid();
  const start = new Date();
  const status = `Start`;
  const stream = createWriteStream(`log/${id}.log`, { flags: 'a' });

  const command = `yarn`;
  const args = [`burp/dizu`];

  return {
    id,
    start,
    status,
    ip: '',
    username: '',
    follows: 0,
    total: 0,
    running: true,
    ready: false,
    error: false,
    warning: false,
    cost: 0,
    command,
    args,
    stream,
  }
};

const execute = (thread) => {
  const cmd = spawn(thread.command, thread.args);

  cmd.stderr.on('data', async (data) => {
    thread.stream.write(data);

    const { status, username, follows, total, ip, ready, error, warning, cost } = getStatus(data);
    if (status) {
      thread.status = status;
    }
    if (username) {
      thread.username = username;
    }
    if (follows) {
      thread.follows = follows;
    }
    if (total) {
      thread.total = total;
    }
    if (ip) {
      thread.ip = ip;
    }
    if (ready) {
      thread.ready = ready;
    }
    if (error) {
      thread.error = error;
    }
    if (warning) {
      thread.warning = warning;
    }
    if (cost) {
      thread.cost = cost;
    }
  });

  cmd.on('close', (code) => {
    thread.running = false;
    thread.stream.end();
  });
};

(async () => {
  const proxy = getProxy(proxyIndex);

  const config = {
    proxyName: proxy.name,
    proxyAddress: proxy.address,
    status: `Running`,
  };

  const threads = [];
  const logStream = createWriteStream(`log/auto.log`, { flags: 'a' });

  try {
    const outputBuffer = new LineBuffer({
      x: 0,
      y: 0,
      width: `console`,
      height: 200,
    });

    outputBuffer.fill(new Line().fill()).output();
    const updateThread = startUpdateThread(outputBuffer, threads, config);

    let pause = false;
    while (!pause) {
      let lastIp, lastReady, lastActive, ip;
      let wait = false;

      do {
        if (wait) {
          logStream.write(`Wait 1 minute\n`);
          await sleep(60 * 1000);
        }

        lastIp = get(last(threads), 'ip', '');
        lastReady = get(last(threads), 'ready', true);
        lastActive = get(last(threads), 'running', false);
        ip = await getIP({ attrs: { proxy: proxy.address } });

        logStream.write(`IP=${ip} LAST_IP=${lastIp} LAST_READY=${lastReady}\n`);
        wait = true;

        if (ip !== lastIp && (lastReady || !lastActive)) {
          break;
        }
      } while (true);

      const thread = createThread();
      logStream.write(`Added thread ${thread.id}\n`);
      threads.push(thread);

      execute(thread);

      logStream.write(`Wait 5 minutes\n`);
      await sleep(5 * 60 * 1000);

      logStream.write(`Threads: ${threads.length}\n`);

      const errorCount = compact(map(threads, 'error')).length;
      const errorCountLast3 = compact(map(threads, 'error').slice(-3)).length;

      logStream.write(`Error count: ${errorCount}; Error last three: ${errorCountLast3}\n`);
      if (errorCount >= 10 || errorCountLast3 === 3) {
        pause = true;
      }
    }

    config.status = `Done`;
    logStream.write(`Done!\n`);
  } catch (error) {
    console.error(error);

    for (let thread of threads) {
      thread.stream.end();
    }
  }
})();
