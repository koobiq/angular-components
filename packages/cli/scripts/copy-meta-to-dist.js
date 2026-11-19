// eslint-disable-next-line @angular-eslint/no-experimental -- `fs.cpSync` is stable since Node 22.3, @types/node still marks it experimental
const { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const getSrcPckgPath = (root) => resolve(__dirname, '..', root);
const getDistPath = (root) => resolve(__dirname, '../../../', root);
const distCLIPath = 'dist/cli';

if (!existsSync(getDistPath('dist'))) {
    mkdirSync(getDistPath('dist'));
}

if (!existsSync(getDistPath(distCLIPath))) {
    mkdirSync(getDistPath(distCLIPath));
    mkdirSync(getDistPath(`${distCLIPath}/bin`));
    mkdirSync(getDistPath(`${distCLIPath}/dist`));
}

copyFileSync(getSrcPckgPath('package.json'), getDistPath(`${distCLIPath}/package.json`));
copyFileSync(getSrcPckgPath('README.md'), getDistPath(`${distCLIPath}/README.md`));
copyFileSync(getSrcPckgPath('LICENSE'), getDistPath(`${distCLIPath}/LICENSE`));
copyFileSync(getSrcPckgPath('bin/cli'), getDistPath(`${distCLIPath}/bin/cli`));
copyFileSync(getSrcPckgPath('dist/cli.js'), getDistPath(`${distCLIPath}/dist/cli.js`));
copyFileSync(getSrcPckgPath('dist/cli.js.map'), getDistPath(`${distCLIPath}/dist/cli.js.map`));
// eslint-disable-next-line @angular-eslint/no-experimental -- `fs.cpSync` is stable since Node 22.3, @types/node still marks it experimental
cpSync(getSrcPckgPath('dist/release'), getDistPath(`${distCLIPath}/dist/release`), { recursive: true });

// Update package version
const currentVersion = JSON.parse(readFileSync('package.json', 'utf8')).version;
const packageContent = JSON.parse(readFileSync(`${distCLIPath}/package.json`, 'utf8'));

packageContent.version = currentVersion;

writeFileSync(`${distCLIPath}/package.json`, JSON.stringify(packageContent, undefined, 4));
