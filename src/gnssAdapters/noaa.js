const fs = require('fs');
const path = require('path');
const BaseAdapter = require('./base');
const gunzip = require('gunzip-file');

const FTP_DOMAIN = 'www.ngs.noaa.gov';
const ftp = require('basic-ftp');

class NOAA extends BaseAdapter {
  constructor(opts) {
    super(opts);
    this.createTempFolder(`/tmp/noaa_downloads_${new Date().getTime()}`);

    this.pendingQueue = [];
  }

  buildUrl({ jdn, year, block }) {
    return `/cors/rinex/${year}/${jdn}/${this.baseId}/${this.baseId}${jdn}${block}.${String(year).substr(0,2)}o.gz`;
  }

  unzip(filename) {
    gunzip(filename, filename.replace('.gz', ''));
  }

  cleanUp(filename) {
    try {
      fs.unlinkSync(filename);
    } catch(err) {}
  }

  download(url, opts = {}) {
    const client = new ftp.Client();
    const filename = `${this.tempFolder}/${path.basename(url)}`;
  
    client.access({ host: FTP_DOMAIN })
      .then(() => {
        return client.downloadTo(filename, url);
      })
      .then(() => {
        opts.success(url, filename);
        return client.close();
      })
      .catch(err => {
        switch(err.code) {
          case 421:
            return opts.pending(this.download.bind(this, url, opts));
          case 550:
          case 'ENOTFOUND':
          default:
            opts.error(err);
            return client.close();
        }
      });
  }
}

module.exports = NOAA;