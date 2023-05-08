const fs = require('fs');
const path = require('path');
const readStream = fs.createReadStream(path.resolve(__dirname, 'text.txt'), {
  encoding: 'utf-8',
});

let fileText = '';
readStream.on('data', (piece) => (fileText += piece));
readStream.on('end', () => console.log(fileText));
readStream.on('error', (error) => console.log(error));
