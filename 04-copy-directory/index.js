const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

const filesList = async (folderName) => {
  const strings = await fsPromises.readdir(folderName, { withFileTypes: true });
  const files = await Promise.all(
    strings.map((dirent) => {
      if (dirent.isDirectory()) {
        const folderPath = path.resolve(folderName, dirent.name);
        return filesList(folderPath);
      }
      return dirent;
    })
  );
  return Array.prototype.concat(...files);
};

const checkSelectFile = async (checkedFilePath, selectType) => {
  const isFolder = selectType === 'folder';

  try {
    await fsPromises.access(
      checkedFilePath,
      fs.constants.R_OK | fs.constants.W_OK
    );

    if (isFolder) {
      const strings = await filesList(checkedFilePath);
      await Promise.all(
        strings.map((dirent) => {
          fsPromises.unlink(path.resolve(checkedFilePath, dirent.name));
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
      strings.map((dirent) => {
        fsPromises.copyFile(
          path.resolve(sourseFolderPath, dirent.name),
          path.resolve(destinationFolderPath, dirent.name)
        );
      })
    );
    console.log('Copy is done');
  })
  .catch((err) => console.error(err));
