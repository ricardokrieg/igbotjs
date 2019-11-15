const { logHandler } = require('../utils');
const log = require('log-chainable').namespace(module).handler(logHandler);
const { isEmpty, random, difference, sample, filter } = require('lodash');
const fs = require('fs');
const child_process = require('child_process');
const util = require('util');
const Bluebird = require('bluebird');
const { decimalToSexagesimal } = require('geolib');
const moment = require('moment');

const readdir  = util.promisify(fs.readdir);
const copyFile = util.promisify(fs.copyFile);
const readFile = util.promisify(fs.readFile);
const exec     = util.promisify(child_process.exec);

const SessionManager = require('../SessionManager');


class PublishManager {
  constructor({ username, ig, imagesPath, getBlacklist, addStats, addUpload, addAction }) {
    this.username = username;
    this.ig       = ig;

    this.imagesPath   = imagesPath;
    this.getBlacklist = getBlacklist;

    this.addStats  = addStats;
    this.addUpload = addUpload;
    this.addAction = addAction;
  }

  async publish() {
    log(`Going to publish from "${this.imagesPath}"`);

    const images = filter(await readdir(this.imagesPath), (path) => path.endsWith('.jpg') || path.endsWith('.jpeg'));
    const blacklist = await this.getBlacklist();
    const validImages = difference(images, blacklist);

    log('Images');
    log(images);
    log('Blacklist');
    log(blacklist);

    if (isEmpty(validImages)) {
      log.warn('There is no image to publish.');
      return;
    }

    const image = sample(validImages);
    log(`Going to upload ${image}`);

    if (false) {
      const { latitude, longitude } = PublishManager.randomLocation();
      log(`Coordinates: ${latitude}, ${longitude}`);

      const locations = await this.ig.search.location(latitude, longitude);
      const mediaLocation = sample(locations);
      log(`Location: ${mediaLocation['name']}`);
    }

    const oldPath = `${this.imagesPath}/${image}`;
    const newPath = `/tmp/${moment().unix()}.jpg`;

    log(`Copying ${oldPath} to ${newPath}`);
    await copyFile(oldPath, newPath);

    //log(`Applying EXIF...`);
    //await PublishManager.applyExif({
    //  filePath: newPath,
    //  basePath: `./base.jpg`,
    //});

    const caption = await this.getCaptionFor({ path: oldPath });
    log('Caption');
    log(caption);

    log(`Uploading...`);
    const publishResult = await this.ig.publish.photo({
      file: await Bluebird.fromCallback(cb => fs.readFile(newPath, cb)),
      //location: mediaLocation,
      caption: caption,
    });

    await this.addUpload({ image });
    await this.addAction({ type: 'publish', reference: image });

    log(publishResult);
    log(`Published: ${publishResult['status']}`);
  }

  async getCaptionFor({ path }) {
    let array = path.split('.');
    array.pop();
    const captionPath = array.join('.') + '.txt';

    if (fs.existsSync(captionPath)) {
      return await readFile(captionPath, 'utf8');
    }

    return null;
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
