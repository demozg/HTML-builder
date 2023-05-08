const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

const filesList = async (folderName, ext) => {
  const strings = await fsPromises.readdir(folderName, { withFileTypes: true });
  const files = await Promise.all(
    strings.map((string) => {
      if (string.isDirectory()) {
        const folderPath = path.resolve(folderName, string.name);  
        return filesList(folderPath);
      }
      const selectPath = path.resolve(folderName, string.name);
      const pathDetails = path.parse(selectPath);
      return pathDetails.ext === ext && string;
    })
  );
  return Array.prototype.concat(...files).filter(Boolean);
};

(async () => {
  try {
    const cssList = await filesList(path.resolve(__dirname, 'styles'), '.css');
    const writeStream = fs.createWriteStream(
      path.resolve(__dirname, 'project-dist', 'bundle.css')
    );

    for (const file of cssList) {
      const pathOfFile = path.resolve(__dirname, 'styles', file.name);
      const readStream = fs.createReadStream(pathOfFile, { encoding: 'utf-8' });
      readStream.pipe(writeStream);
    }
  } catch (error) {
    console.log(error);
  }
})();
