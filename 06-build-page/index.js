const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

const ASSETS = 'assets';
const STYLES = 'styles';
const PROJECT_DIST = 'project-dist';

const FORMATS = {
  HTML: '.html',
  CSS: '.css',
};

const DEFAULT_FILE_NAMES = {
  TEMPLATE: 'index',
  STYLE: 'style',
};

const createTemplateHTML = async () => {
  let templateInner = await fsPromises.readFile(
    path.resolve(__dirname, 'template.html'),
    'utf-8'
  );

  const reg = /{{[^{]+(?:_[^}]+)*}}/g;
  const components = templateInner.match(reg);

  components?.forEach(async (component, index) => {
    const componentPath = path.resolve(
      __dirname,
      'components',
      `${component.split(/{{|}}/g)?.[1]}${FORMATS.HTML}`
    );

    const componentInner = await fsPromises.readFile(componentPath, 'utf-8');
    templateInner = templateInner.replace(component, componentInner);

    if (index === components.length - 1) {
      await fsPromises.writeFile(
        path.resolve(
          __dirname,
          PROJECT_DIST,
          `${DEFAULT_FILE_NAMES.TEMPLATE}${FORMATS.HTML}`
        ),
        templateInner,
        'utf-8'
      );
    }
  });
};

const joinStyles = async () => {
  const filesList = async (partOfPath) => {
    const strings = await fsPromises.readdir(path.join(__dirname, partOfPath), {
      withFileTypes: true,
    });

    const filesPathes = await Promise.all(
      strings.map((string) => {
        const stringPath = path.join(partOfPath, string.name);

        if (string.isDirectory()) {
          return filesList(stringPath);
        }

        const finishFilePath = path.resolve(__dirname, stringPath);
        const pathDetails = path.parse(finishFilePath);
        return pathDetails.ext === FORMATS.CSS && finishFilePath;
      })
    );
    return Array.prototype.concat(...filesPathes).filter(Boolean);
  };

  const cssFilesList = await filesList(STYLES);
  const writeStream = fs.createWriteStream(
    path.resolve(
      __dirname,
      PROJECT_DIST,
      `${DEFAULT_FILE_NAMES.STYLE}${FORMATS.CSS}`
    )
  );

  cssFilesList.forEach((cssFilePath) => {
    const readStream = fs.createReadStream(cssFilePath, {
      encoding: 'utf-8',
    });
    readStream.pipe(writeStream);
  });
};

const removeAssets = async () => {
  await fsPromises.mkdir(path.resolve(__dirname, PROJECT_DIST, ASSETS));
  const strings = await fsPromises.readdir(path.resolve(__dirname, ASSETS), {
    withFileTypes: true,
  });

  const removeFolder = async (assetsPartPath) => {
    await fsPromises.mkdir(
      path.resolve(__dirname, PROJECT_DIST, assetsPartPath)
    );

    const strings = await fsPromises.readdir(
      path.resolve(__dirname, assetsPartPath),
      {
        withFileTypes: true,
      }
    );

    await Promise.all(
      strings.map((string) => {
        const stringPath = path.join(assetsPartPath, string.name);

        if (string.isDirectory()) {
          return removeFolder(stringPath);
        }

        fsPromises.copyFile(
          path.resolve(__dirname, stringPath),
          path.resolve(__dirname, PROJECT_DIST, stringPath)
        );
      })
    );
  };

  await Promise.all(
    strings.map((string) => {
      const stringPath = path.join(ASSETS, string.name);
      if (string.isDirectory()) {
        return removeFolder(path.join(stringPath));
      }

      fsPromises.copyFile(
        path.resolve(__dirname, stringPath),
        path.resolve(__dirname, PROJECT_DIST, stringPath)
      );
    })
  );
};

(async () => {
  const projectDistPath = path.resolve(__dirname, PROJECT_DIST);
  await fsPromises.rm(projectDistPath, {
    force: true,
    recursive: true,
  });

  await fsPromises.mkdir(projectDistPath);

  await Promise.all([createTemplateHTML(), joinStyles(), removeAssets()]);

  console.log('All done!');
})();
