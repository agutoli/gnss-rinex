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
    this.baseId = args.baseId;
    this.start = moment(args.start, 'YYYY-MM-DDTHH:mm:ss');
    this.end = moment(args.end, 'YYYY-MM-DDTHH:mm:ss');
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
    // let count = 0;
    // const charMap = {};
    // for(let i=97; i <= 120; i++) {
    //   charMap[count] = String.fromCharCode(i);
    //   count++;
    // }
    // return charMap;
  }

  getFilesToDownload() {
    // const blocks = this.getHourBlock();
    const fileList = [];
    while(true) {
      // julian day number
      const jdn = this.start.format('DDDD');
      const year = this.start.year();
      // const block = blocks[this.start.hour()];
      const block = this.getHourBlock(this.start.hour())
      fileList.push(this.buildUrl({ jdn, year, block }));
      if (this.start >= this.end) {
        break;
      }
      this.start.add(1, 'hour');
    }
    return fileList;
  }
}

module.exports = Adapter;