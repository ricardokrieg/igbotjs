import { sample } from 'lodash';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function x(n) {
  const t = sample([1, 2, 3, 4, 5]);
  await sleep(t * 1000);
  console.log(n);
}

console.log('Start');
(async () => {
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].slice(0, 5)) {
    await x(n);
  }
})();
