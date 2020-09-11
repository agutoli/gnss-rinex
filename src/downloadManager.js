
class DownloadManager {
  constructor({ adapter }) {
    this.adapter = adapter;
    // list of files to download
    this.filesToDownload = adapter.getFilesToDownload();

    this.eventListeners = {
      'start': () => {},
      'pending': () => {},
      'error': () => {},
      'finished': () => {}
    };

    this.pendingQueue = [];
  }

  call(eventName, args) {
    this.eventListeners[eventName].apply(this, args);
  }

  on(eventName, callback) {
    this.eventListeners[eventName] = callback;
  }

  async startBatchDownload(items) {
    const promises = [];

    for (let url of this.filesToDownload) {
      const queue = new Promise((resolve, reject) => {
        this.call('start', [ url ]);
        this.adapter.download(url, {
          resolve, reject,
          success: (url, filename) => {
            this.call('finished', [ url, filename ]);

            resolve();

            if (this.pendingQueue.length > 0) {
              const nextJob = this.pendingQueue.shift();
              nextJob();
            }

            this.adapter.unzip(filename);
          },
          pending: (pendingQueue) => {
            this.call('pending', [ url ]);
            this.pendingQueue.push(pendingQueue);
          },
          error: (url) => {
            this.call('error', [ url ]);
          }
        });
      });
      promises.push(queue);
    }

    return Promise.all(promises);
  }

  async init(status) {
    try {
      await this.startBatchDownload(this.filesToDownload);
      await status.success(this.adapter.downloadedFiles());
      await this.adapter.cleanUp();
    } catch(err) {
      return status.error(err);
    }
  }
}

module.exports = DownloadManager;
