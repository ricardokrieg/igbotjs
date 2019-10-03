const { logHandler, sleep } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { isEmpty, random, difference, sample } = require('lodash');
const fs = require('fs');
const util = require('util');
const Bluebird = require('bluebird');

const readdir = util.promisify(fs.readdir);

const SessionManager = require('../SessionManager');


class PublishManager {
  constructor({ username, ig, imagesPath, getBlacklist, addStats, addUpload }) {
    this.username     = username;
    this.ig           = ig;
    this.imagesPath   = imagesPath;
    this.getBlacklist = getBlacklist;
    this.addStats     = addStats;
    this.addUpload    = addUpload;
  }

  async run() {
    log(`Going to publish image from "${this.imagesPath}"`);

    const images = await readdir(this.imagesPath);
    const blacklist = await this.getBlacklist();
    const validImages = difference(images, blacklist);

    if (isEmpty(validImages)) {
      log.warn('There is no image to publish.');
      return;
    }

    const image = sample(validImages);
    log(`Going to upload ${image}`);

    const { latitude, longitude } = PublishManager.randomLocation();

    const locations = await this.ig.search.location(latitude, longitude);
    const mediaLocation = sample(locations);
    log(`Location: ${mediaLocation['name']}`);

    const publishResult = await this.ig.publish.photo({
      file: await Bluebird.fromCallback(cb => fs.readFile(`${this.imagesPath}/${image}`, cb)),
      location: mediaLocation,
    });

    await this.addUpload({ image });
    await this.addStats({ type: 'publish', reference: image });

    log(`Published: ${publishResult['status']}`);
  }

  static randomLocation() {
    return {
      latitude: random(-23999999, -22000001) / 1000000.0,
      longitude: random(-46999999, -45000001) / 1000000.0,
    };
  }
}

module.exports = PublishManager;
