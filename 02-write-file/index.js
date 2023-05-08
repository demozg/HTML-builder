const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

const createFileContent = async (pathOfFile) => {
  try {
    await fsPromises.access(pathOfFile, fs.constants);
  } catch (error) {
    const cleanContent = '';
    await fsPromises.writeFile(pathOfFile, cleanContent, { encoding: 'utf-8' });
  }
  return pathOfFile;
};

createFileContent(path.resolve(__dirname, 'text.txt')).then((addressFile) => {
  const exitText = 'exit';
  process.stdout.write('Hi! Please, enter text!\n');
  process.stdout.write(`For exit press Ctrl + C or write "${exitText}"\n\n`);

  process.stdin.on('data', (data) => {
    const dataText = Buffer.from(data, 'utf-8').toString();
    if (dataText.trim() === exitText) {
      process.exit();
    }
    fsPromises.appendFile(addressFile, data, { encoding: 'utf-8' });
  });

  process.on('exit', () => process.stdout.write('\nGoodbye!\n'));
  process.on('SIGINT', () => process.exit());
});
