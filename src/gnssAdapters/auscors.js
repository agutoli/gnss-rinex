const fs = require('fs');
const zlib = require('zlib');
const uncompress = require('uncompress');
const rimraf = require("rimraf");
const path = require('path');
const BaseAdapter = require('./base');

const FILE_EXT = '.Z';
const TEMP_FOLDER_PREFIX = '/tmp/auscors_downloads';
const SERVERS = [
  { host: 'ftp.ga.gov.au', name: 'Geoscience Australia GNSS' }
];

const ftp = require('basic-ftp');

class AusCors extends BaseAdapter {
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

  buildUrl({ jdn, hour, year, block }) {
    const YY = year.substr(2);
    const YYYY = year;
    const DDD = jdn;
    const HH = hour;
    return `/geodesy-outgoing/gnss/data/hourly/${YYYY}/${YY}${DDD}/${HH}/${this.baseId}${DDD}${block}.${YY}d${FILE_EXT}`;
  }

  unzip(filename) {
    const txt = fs.readFileSync(filename);
    fs.writeFileSync(filename.replace(FILE_EXT, ''), uncompress(txt));
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
      if (client.closed) {
        await client.access({ host: server.host });
      }
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
          case 530:
            return opts.pending(this.download.bind(this, url, opts));
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

module.exports = AusCors;
