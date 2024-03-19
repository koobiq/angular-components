import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getSrcPckgPath = root => path.resolve(__dirname, '..', root);
const getDistPath = root => path.resolve(__dirname, '../../../', root);
const distCLIPath = 'dist/cli';

if (!fs.existsSync(getDistPath('dist'))) {
    fs.mkdirSync(getDistPath('dist'));
}

if (!fs.existsSync(getDistPath(distCLIPath))) {
    fs.mkdirSync(getDistPath(distCLIPath));
    fs.mkdirSync(getDistPath(`${distCLIPath}/bin`));
    fs.mkdirSync(getDistPath(`${distCLIPath}/dist`));
    fs.mkdirSync(getDistPath(`${distCLIPath}/dist/templates`));
}

fs.copyFileSync(getSrcPckgPath('package.json'), getDistPath(`${distCLIPath}/package.json`));
fs.copyFileSync(getSrcPckgPath('README.md'), getDistPath(`${distCLIPath}/README.md`));
fs.copyFileSync(getSrcPckgPath('LICENSE'), getDistPath(`${distCLIPath}/LICENSE`));
fs.copyFileSync(getSrcPckgPath('bin/cli'), getDistPath(`${distCLIPath}/bin/cli`));
fs.copyFileSync(getSrcPckgPath('dist/cli.js'), getDistPath(`${distCLIPath}/dist/cli.js`));
fs.copyFileSync(getSrcPckgPath('dist/cli.js.map'), getDistPath(`${distCLIPath}/dist/cli.js.map`));

// Add all templates to make cli work as external tool
['commit', 'template', 'footer', 'header'].forEach((template) => {
    fs.copyFileSync(
        getSrcPckgPath(`src/release/templates/${template}.hbs`), getDistPath(`${distCLIPath}/dist/templates/${template}.hbs`)
    );
})

// Update package version
const currentVersion = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
const packageContent = JSON.parse(fs.readFileSync(`${distCLIPath}/package.json`, 'utf8'));
packageContent.version = currentVersion;

fs.writeFileSync(`${distCLIPath}/package.json`, JSON.stringify(packageContent, undefined, 4))
