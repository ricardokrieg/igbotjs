const { readFile } = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);
const _debug = require('debug');
const {isEmpty} = require('lodash');

const {
  sleep,
} = require('../utils');

const {
  ruploadIgphoto,
} = require('../requests/accounts');

const {
  creativesGetUnlockableStickerNux,
  creativesStickerTray,
} = require('../requests/creatives');

const {
  statusGetViewableStatuses,
} = require('../requests/generic');

const {
  highlightsCreateReel,
} = require('../requests/highlights');

const {
  igFbXpostingAccountLinkingUserXpostingDestination,
} = require('../requests/igFbXposting');

const {
  livePreLiveTools,
} = require('../requests/live');

const {
  mediaConfigureToStory,
} = require('../requests/media');

const {
  usersReelSettings,
} = require('../requests/users');

const debug = _debug('bot:actions:addStory');

module.exports = async (client, i, photoPath, reelTitle = ``) => {
  debug(`Start ${i}`);

  debug(`Loading photo from disk: ${photoPath}`);
  const photo = await readFileAsync(photoPath);

  await creativesGetUnlockableStickerNux(client);
  await livePreLiveTools(client);
  await igFbXpostingAccountLinkingUserXpostingDestination(client);
  await usersReelSettings(client);

  await sleep(5000);

  await statusGetViewableStatuses(client);
  await igFbXpostingAccountLinkingUserXpostingDestination(client);

  await sleep(5000);

  await creativesStickerTray(client);

  await sleep(5000);

  debug(`Uploading photo`);
  const { uploadId } = await ruploadIgphoto(client, photo);
  debug(`UploadID: ${uploadId}`);

  await sleep(5000);

  debug(`Configuring media`);
  const { media: { id } } = await mediaConfigureToStory(client, uploadId);

  await sleep(5000);

  await igFbXpostingAccountLinkingUserXpostingDestination(client);

  if (!isEmpty(reelTitle)) {
    debug(`Saving reel: ${reelTitle}`);
    await sleep(10000);

    await highlightsCreateReel(client, id, reelTitle);
  }

  debug(`End`);
};
