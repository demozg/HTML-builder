const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

const filesList = async (folderName) => {
  const strings = await fsPromises.readdir(folderName, { withFileTypes: true });
  const files = await Promise.all(
    strings.map((string) => {
      if (string.isDirectory()) {
        const folderPath = path.resolve(folderName, string.name);
        return filesList(folderPath);
      }
      return string;
    })
  );
  return Array.prototype.concat(...files);
};

const checkSelectFile = async (checkedFilePath, selectType) => {
  const isFolder = selectType === 'folder';

  try {
    await fsPromises.access(
      checkedFilePath,
      fs.constants
    );

    if (isFolder) {
      const strings = await filesList(checkedFilePath);
      await Promise.all(
        strings.map((string) => {
          fsPromises.unlink(path.resolve(checkedFilePath, string.name));
        })
      );
    }
  } catch (error) {
    if (isFolder) {
      await fsPromises.mkdir(checkedFilePath);
    }
  }
  return checkedFilePath;
};

checkSelectFile(path.resolve(__dirname, 'files-copy'), 'folder')
  .then(async (destinationFolderPath) => {
    const sourseFolderPath = path.resolve(__dirname, 'files');
    const strings = await filesList(sourseFolderPath);

    await Promise.all(
      strings.map((string) => {
        fsPromises.copyFile(
          path.resolve(sourseFolderPath, string.name),
          path.resolve(destinationFolderPath, string.name)
        );
      })
    );
    console.log('Copy is done');
  })
  .catch((err) => console.error(err));
