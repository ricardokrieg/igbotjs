const { difference, map, sample, random, isEmpty } = require('lodash');
const Bluebird = require('bluebird');
const fs = require('fs');
const util = require('util');

const readdir = util.promisify(fs.readdir);

const { logger, quickSleep, call, randomLocation } = require('../utils');

const log = (message) => logger('Publish', message);


async function publish({ ig, accountDetails, uploadsCol }) {
  log('Start');

  log(`Publish Percentage: ${accountDetails.publishPercentage}%`);
  log(`Path: ${accountDetails.path}`);
  if (random(1, 100) > accountDetails.publishPercentage) {
    log('Not going to publish');
    return;
  }

  const images = await readdir(accountDetails.path);
  const blacklist = map(await uploadsCol.find().toArray(), '_id');
  const validImages = difference(images, blacklist);

  log(`Images: ${images}`);
  log(`Blacklist: ${blacklist}`);
  log(`Valid Images: ${validImages}`);

  if (isEmpty(validImages)) {
    log('There is no image to publish.');
    return;
  }

  const image = sample(validImages);
  log(`Going to upload ${image}`);

  const { latitude, longitude } = randomLocation();

  const locations = await ig.search.location(latitude, longitude);
  const mediaLocation = sample(locations);
  log(mediaLocation);

  const publishResult = await ig.publish.photo({
    file: await Bluebird.fromCallback(cb => fs.readFile(`${accountDetails.path}/${image}`, cb)),
    location: mediaLocation,
  });

  await uploadsCol.insertOne({ _id: image, account: accountDetails._id });

  log(publishResult);
  log('End');
}

module.exports = { publish };
