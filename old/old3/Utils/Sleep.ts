import * as _debug from 'debug';
const debug = _debug.debug('Sleep');

export const Sleep = (ms: number, maxMs?: number) => {
  if (maxMs) {
    ms = Math.floor(Math.random() * (maxMs - ms + 1) + ms);
  }

  debug(`Sleeping ${Math.round(ms / 1000)}s`);

  return new Promise(resolve => setTimeout(resolve, ms));
};
