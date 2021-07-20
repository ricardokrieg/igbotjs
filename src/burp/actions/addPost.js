const { readFile } = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);
const _debug = require('debug');

const {
  sleep,
} = require('../utils');

const {
  ruploadIgphoto,
} = require('../requests/accounts');

const {
  creativesCameraEffectsGraphql,
  creativesCameraModels,
  creativesGetUnlockableStickerNux,
} = require('../requests/creatives');

const {
  qpBatchFetch,
} = require('../requests/generic');

const {
  igFbXpostingAccountLinkingUserXpostingDestination,
} = require('../requests/igFbXposting');

const {
  livePreLiveTools,
} = require('../requests/live');

const {
  mediaConfigure,
  mediaUpdateMediaWithPdqHashInfo,
} = require('../requests/media');

const {
  warningCheckOffensiveText,
} = require('../requests/warning');

const {
  usersReelSettings,
} = require('../requests/users');

const debug = _debug('bot:actions:addPost');

module.exports = async (client, photoPath, caption = ``) => {
  debug(`Start`);

  debug(`Loading photo from disk: ${photoPath}`);
  const photo = await readFileAsync(photoPath);

  await creativesGetUnlockableStickerNux(client);
  await livePreLiveTools(client);
  await creativesCameraModels(client);
  await creativesCameraEffectsGraphql(client);
  await usersReelSettings(client);
  await igFbXpostingAccountLinkingUserXpostingDestination(client);

  await sleep(5000);

  await igFbXpostingAccountLinkingUserXpostingDestination(client);

  await sleep(5000);

  await qpBatchFetch(client, `share_post`);
  await igFbXpostingAccountLinkingUserXpostingDestination(client);
  debug(`Uploading photo`);
  const { uploadId } = await ruploadIgphoto(client, photo);
  debug(`UploadID: ${uploadId}`);

  await sleep(5000);
  await warningCheckOffensiveText(client, caption);
  debug(`Configuring media`);
  await mediaConfigure(client, caption, uploadId);
  await sleep(5000);
  // await mediaUpdateMediaWithPdqHashInfo(client);

  debug(`End`);
};
