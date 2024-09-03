const { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
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
    mkdirSync(getDistPath(`${distCLIPath}/dist/templates`));
}

copyFileSync(getSrcPckgPath('package.json'), getDistPath(`${distCLIPath}/package.json`));
copyFileSync(getSrcPckgPath('README.md'), getDistPath(`${distCLIPath}/README.md`));
copyFileSync(getSrcPckgPath('LICENSE'), getDistPath(`${distCLIPath}/LICENSE`));
copyFileSync(getSrcPckgPath('bin/cli'), getDistPath(`${distCLIPath}/bin/cli`));
copyFileSync(getSrcPckgPath('dist/cli.js'), getDistPath(`${distCLIPath}/dist/cli.js`));
copyFileSync(getSrcPckgPath('dist/cli.js.map'), getDistPath(`${distCLIPath}/dist/cli.js.map`));

// Add all templates to make cli work as external tool
['commit', 'template', 'footer', 'header'].forEach((template) => {
    copyFileSync(
        getSrcPckgPath(`src/release/templates/${template}.hbs`),
        getDistPath(`${distCLIPath}/dist/templates/${template}.hbs`)
    );
});

// Update package version
const currentVersion = JSON.parse(readFileSync('package.json', 'utf8')).version;
const packageContent = JSON.parse(readFileSync(`${distCLIPath}/package.json`, 'utf8'));
packageContent.version = currentVersion;

writeFileSync(`${distCLIPath}/package.json`, JSON.stringify(packageContent, undefined, 4));
