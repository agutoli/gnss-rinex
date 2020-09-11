const fs = require('fs');
const moment = require('moment');
const mkdirp = require('mkdirp');
/**
 * Base adapter class with common functions
 * and instance constructions
 */
const FIRST_CHAR = 97;

class Adapter {
  constructor(args) {
    this.verbose = args.verbose;
    this.baseId = args.baseId;
    this.start = moment(args.date_start, 'YYYY-MM-DDTHH:mm:ss');
    this.end = moment(args.date_end, 'YYYY-MM-DDTHH:mm:ss');
    this.tempFolder = '/tmp'
  }

  /**
   * It requires implementations from
   * every specific adpater
   */
  buildUrl({ jdn, year, block }) {
    throw new Error('Not implemented');
  }

  /**
   * It requires implementations from
   * every specific adpater
   * @param arg1 url - string: Url or file name
   * @params arg2 statusObj - Obj[sucess:func, error:func, pending:func]
   */
  download(url, { sucess, error, pending }) {
    throw new Error('Not implemented');
  }

  /**
   * It requires implementation from parent class
   */
  unzip() {
    throw new Error('Not implemented');
  }

  /**
   * It requires implementation from parent class
   */
  cleanUp() {
    throw new Error('Not implemented');
  }

  downloadedFiles() {
    const files = fs.readdirSync(this.tempFolder).map(x => `${this.tempFolder}/${x}`);
    files.sort();
    return files;
  }

  createTempFolder(tempFoder) {
    this.tempFolder = tempFoder;
    mkdirp.sync(tempFoder);
  }

  /**
   * It returns an map from a=0 to z=23
   */
  getHourBlock(hour) {
    return String.fromCharCode(FIRST_CHAR + parseInt(hour));
  }

  getFilesToDownload() {
    const fileList = [];
    while(true) {
      // julian day number
      const jdn = this.start.format('DDDD');
      const year = this.start.format('YYYY');
      const hour = this.start.format('HH');
      const block = this.getHourBlock(hour)
      fileList.push(this.buildUrl({ jdn, hour, year, block }));
      if (this.start >= this.end) {
        break;
      }
      this.start.add(1, 'hour');
    }
    return fileList;
  }
}

module.exports = Adapter;
