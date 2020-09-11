const fs = require('fs');
const rimraf = require("rimraf");
const path = require('path');
const BaseAdapter = require('./base');
const gunzip = require('gunzip-file');

const TEMP_FOLDER_PREFIX = '/tmp/noaa_downloads';

const SERVERS = [
  { host: 'geodesy.noaa.gov', name: 'Primary' },
  { host: 'alt.ngs.noaa.gov', name: 'Alternative' }
];

const ftp = require('basic-ftp');

class NOAA extends BaseAdapter {
  constructor(opts) {
    super(opts);
    this.createTempFolder(`${TEMP_FOLDER_PREFIX}_${new Date().getTime()}`);
    this.pendingQueue = [];
  }

  log(text) {
    if (this.verbose) {
      console.log(text);
    }
  }

  buildUrl({ jdn, year, block }) {
    return `/cors/rinex/${year}/${jdn}/${this.baseId}/${this.baseId}${jdn}${block}.${String(year).substr(0,2)}o.gz`;
  }

  unzip(filename) {
    gunzip(filename, filename.replace('.gz', ''));
  }

  cleanUp() {
    try {
      // Security check to make sure is same temp
      // prefix to avoid remove wrong folders
      if (this.tempFolder.startsWith(TEMP_FOLDER_PREFIX)) {
        this.log('Cleanup')
        try {
          fs.rmdirSync(this.tempFolder, { recursive: true });
        } catch(e) {
          rimraf.sync(this.tempFolder);
        }
      }
    } catch(err) {
      this.log(err);
    }
  }

  async download(url, opts = {}) {
    const client = new ftp.Client();
    const filename = `${this.tempFolder}/${path.basename(url)}`;

    const doDownload = async (server) => {
      await client.access({ host: server.host });
      return client.downloadTo(filename, url)
        .then(() => {
          opts.success(url, filename);
          return client.close();
        });
    }

    for (let index in SERVERS) {
      const isLastLoop = parseInt(index) === SERVERS.length - 1;

      try {
        await doDownload(SERVERS[index]);
        break;
      } catch(err) {
        if (!isLastLoop) {
          const nextServer = SERVERS[parseInt(index) + 1];
          this.log(`${url} (Retrying with ${nextServer.name} server ${nextServer.host})`);
          continue;
        }
        switch(err.code) {
          case 421:
            await opts.pending(this.download.bind(this, url, opts));
          case 550:
          case 'ENOTFOUND':
          default:
            opts.error(err);
            await client.close();
        }
      }
    }
  }
}

module.exports = NOAA;
