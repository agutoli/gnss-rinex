const fs = require('fs');
const readline = require('readline');

class RinexMerge {
  constructor(output) {
    this.output = output;
  }

  readBodyChunks(filename, callback) {
    return new Promise((resolve) => {
      const stream = readline.createInterface({
        input: fs.createReadStream(filename)
      });
      let endOfHeader = false;
      stream.on('line', function (line) {
        if (line.toString().indexOf('END OF HEADER') !== -1) {
          endOfHeader = true;
          return;
        }
        if (!endOfHeader) return;
        callback(line + '\n');
      }).on('close', () => {
        resolve();
      });
    });
  }

  async mergeFiles(orderedFiles) {
    const first = orderedFiles.shift();

    // copy first file
    fs.copyFileSync(first, this.output);

    // open output file with append mode
    const append = fs.createWriteStream(this.output, { flags: 'a' });
    for(const filename of orderedFiles) {
      await this.readBodyChunks(filename, (chunk) => {
        append.write(chunk);
      });
    }
    append.end();
    return this.output;
  }
}
module.exports = RinexMerge;