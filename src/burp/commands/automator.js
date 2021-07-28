const { Line, LineBuffer } = require('clui');
const clc = require('cli-color');
const { spawn } = require('child_process');
const { createWriteStream } = require('fs');
const chance = require('chance').Chance();
const {last, get, compact, map} = require('lodash');

const {
  sleep,
  getIP,
} = require('../utils');

const minFollows = process.env.MIN;
if (!minFollows) {
  throw new Error(`MIN is required`);
}

const maxFollows = process.env.MAX;
if (!maxFollows) {
  throw new Error(`MAX is required`);
}

const proxy = process.env.PROXY;
if (!proxy) {
  throw new Error(`PROXY is required`);
}

const getColor = (thread) => {
  if (!thread.ready) {
    return clc.white;
  }

  if (thread.error) {
    return clc.red;
  }

  return clc.green;
};

const update = (outputBuffer, threads) => {
  outputBuffer.lines = [];

  new Line(outputBuffer)
    .column(`ID`, 10, [clc.cyan])
    .column(`Start`, 10, [clc.cyan])
    .column(`IP`, 20, [clc.cyan])
    .column(`Username`, 20, [clc.cyan])
    .column(`Follows`, 10, [clc.cyan])
    .column(`Active?`, 10, [clc.cyan])
    .column(`Ready?`, 10, [clc.cyan])
    .column(`Status`, 20, [clc.cyan])
    .fill()
    .store();

  for (let thread of threads) {
    const color = getColor(thread);

    new Line(outputBuffer)
      .column(thread.id, 10, [color])
      .column(String(thread.start).split(' ')[4].split(':').slice(0, 2).join(':'), 10, [color])
      .column(thread.ip, 20, [color])
      .column(thread.username, 20, [color])
      .column(String(thread.follows), 10, [color])
      .column(thread.running ? 'Yes' : 'No', 10, [color])
      .column(thread.ready ? 'Yes' : 'No', 10, [color])
      .column(thread.status, 20, [color])
      .fill()
      .store();
  }

  outputBuffer.output();
};

const startUpdateThread = async (outputBuffer, threads) => {
  while (true) {
    update(outputBuffer, threads);
    await sleep(1000);
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

  if (/bot:actions:openApp/.exec(data)) {
    return { status: `Open App` };
  }

  if (/bot:actions:signUpCompleteProfile/.exec(data)) {
    return { status: `Complete Profile` };
  }

  if (match = /bot:dizu IP \(start\): (.*)/.exec(data)) {
    return { ip: match[1] };
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

  if (match = /bot:dizu Follow (.*)/.exec(data)) {
    return { status: `Follow ${match[1]}`, follows: match[1] };
  }

  return { status: null, username: null };
};

const createThread = () => {
  const id = chance.string({ length: 4, pool: '0123456789ABCDEF' });
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
    running: true,
    ready: false,
    error: false,
    command,
    args,
    stream,
  }
};

const execute = (thread) => {
  const cmd = spawn(thread.command, thread.args);

  cmd.stderr.on('data', async (data) => {
    thread.stream.write(data);

    const { status, username, follows, ip, ready, error } = getStatus(data);
    if (status) {
      thread.status = status;
    }
    if (username) {
      thread.username = username;
    }
    if (follows) {
      thread.follows = follows;
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
  });

  cmd.on('close', (code) => {
    thread.running = false;
    thread.stream.end();
  });
};

(async () => {
  const threads = [];
  const logStream = createWriteStream(`log/auto.log`, { flags: 'a' });

  try {
    const outputBuffer = new LineBuffer({
      x: 0,
      y: 0,
      width: `console`,
      height: `console`,
    });

    outputBuffer.fill(new Line().fill()).output();
    const updateThread = startUpdateThread(outputBuffer, threads);

    let pause = false;
    while (!pause) {
      let lastIp, lastReady, ip;
      let wait = false;

      do {
        if (wait) {
          logStream.write(`Wait 1 minute\n`);
          await sleep(60 * 1000);
        }

        lastIp = get(last(threads), 'ip', '');
        lastReady = get(last(threads), 'ready', true);
        ip = await getIP({ attrs: { proxy } });

        logStream.write(`IP=${ip} LAST_IP=${lastIp} LAST_READY=${lastReady}\n`);
        wait = true;
      } while (ip === lastIp || !lastReady);

      const thread = createThread();
      logStream.write(`Added thread ${thread.id}\n`);
      threads.push(thread);

      execute(thread);

      logStream.write(`Wait 5 minutes\n`);
      await sleep(5 * 60 * 1000);

      logStream.write(`Threads: ${threads.length}\n`);
      // if (threads.length >= 10) {
      //   pause = true;
      // }
      const errorCount = compact(map(threads, 'error')).length;
      logStream.write(`Error count: ${errorCount}\n`);
      if (errorCount >= 3) {
        pause = true;
      }
    }

    logStream.write(`Done!\n`);
  } catch (error) {
    console.error(error);

    for (let thread of threads) {
      thread.stream.end();
    }
  }
})();
