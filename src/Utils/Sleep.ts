import * as _debug from 'debug';
const debug = _debug.debug('Sleep');

export const Sleep = (ms) => {
  debug(`Sleeping ${Math.round(ms / 1000)}s`);

  return new Promise(resolve => setTimeout(resolve, ms));
};
