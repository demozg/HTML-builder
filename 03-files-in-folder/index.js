const path = require('path');
const fsPromises = require('fs').promises;

const filesList = async (folderName) => {
  const strings = await fsPromises.readdir(folderName, { withFileTypes: true });
  const files = await Promise.all(
    strings.map((string) => {
      if (string.isDirectory()) {
        return;
      }
      return string;
    })
  );
  return Array.prototype.concat(...files).filter(Boolean);
};

const folderName = path.resolve(__dirname, 'secret-folder');

filesList(folderName)
  .then(async (strings) => {
    for (const string of strings) {
      const filePath = path.resolve(folderName, string.name);
      const { name, ext } = path.parse(filePath);
      const { size: fileSize } = await fsPromises.stat(filePath);

      console.log(`${name} - ${ext.slice(1)} - ${fileSize / 1024}Kb`);
    }
  })
  .catch((err) => console.error(err));
