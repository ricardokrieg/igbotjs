const { logHandler } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { isEmpty, random, difference, sample } = require('lodash');
const fs = require('fs');
const child_process = require('child_process');
const util = require('util');
const Bluebird = require('bluebird');
const { decimalToSexagesimal } = require('geolib');
const moment = require('moment');

const readdir  = util.promisify(fs.readdir);
const copyFile = util.promisify(fs.copyFile);
const exec     = util.promisify(child_process.exec);

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
    log(`Coordinates: ${latitude}, ${longitude}`);

    const locations = await this.ig.search.location(latitude, longitude);
    const mediaLocation = sample(locations);
    log(`Location: ${mediaLocation['name']}`);

    const oldPath = `${this.imagesPath}/${image}`;
    const newPath = `/tmp/${moment().unix()}.jpg`;

    log(`Copying ${oldPath} to ${newPath}`);
    await copyFile(oldPath, newPath);

    log(`Applying EXIF...`);
    await PublishManager.applyExif({
      filePath: newPath,
      basePath: `${this.imagesPath}/base.jpg`,
    });

    log(`Uploading...`);
    const publishResult = await this.ig.publish.photo({
      file: await Bluebird.fromCallback(cb => fs.readFile(newPath, cb)),
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

  static async applyExif({ filePath, basePath, sLat, sLng, latDir, lngDir, seaLevel }) {
    await exec(`exiftool -all= ${filePath}`);
    await exec(`exiftool -TagsFromFile ${basePath} ${filePath}`);

    const datetime = moment().subtract(10, 'minutes');
    const formatted = datetime.format('YYYY:MM:DD HH:mm:ss');
    await exec(`exiftool ` +
                `"-FileModifyDate=${formatted}" ` +
                `"-ModifyDate=${formatted}" ` +
                `"-CreateDate=${formatted}" ` +
                `"-DateTimeOriginal=${formatted}" ` +
                // `"-GPSDateStamp=${datetime.format('YYYY:MM:DD')}" ` +
                // `"-GPSTimeStamp=${datetime.format('HH:mm:ss')}" ` +
                // `"-GPSLatitudeRef=${latDir}" ` +
                // `"-GPSLongitudeRef=${lngDir}" ` +
                // `"-GPSAltitude=${seaLevel}.5 m Below Sea Level" ` +
                // `"-GPSLatitude=${sLat.replace('"', '\\"')}" ` +
                // `"-GPSLatitude=${sLat}" ` +
                // `"-GPSLatitude=23° 15' 49.1688\" S" ` +
                // `"-GPSLongitude=${sLng.replace('"', '\\"')}" ` +
                // `"-GPSLongitude=${sLng}" ` +
                // `"-GPSLongitude=46° 04' 16.23\" W" ` +
                `${filePath}`);

    await exec(`exiftool -ExifImageWidth= -ExifImageHeight= -XMPToolkit= -EncodingProcess= -JFIFVersion= -ThumbnailImage= -ThumbnailOffset= -ThumbnailLength= ${filePath}`);
    await exec(`exiftool -GPSVersionID= -GPSLatitudeRef= -GPSLongitudeRef= -GPSAltitudeRef= -GPSTimeStamp= -GPSProcessingMethod= -GPSDateStamp= -GPSAltitude= -GPSDateTime= -GPSLatitude= -GPSLongitude= -GPSPosition= ${filePath}`);
  }
}

module.exports = PublishManager;
