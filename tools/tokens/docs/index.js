require('@koobiq/tokens-builder/build');
const StyleDictionary = require('style-dictionary');
const sdConfig = require('./sdConfig');
const { join } = require('path');
const fs = require('fs');
const { BUILD_PATH, LINE_SEP } = require('./config');

require('./formats')(StyleDictionary);

const files = sdConfig.platforms.css.files.map(({ destination }) => destination);

StyleDictionary.extend(sdConfig).buildAllPlatforms();

const outputFilePath = join(BUILD_PATH, 'design-tokens.md');
if (fs.existsSync(outputFilePath)) fs.rmSync(outputFilePath);

for (const file of files) {
    const fileData = fs.readFileSync(join(BUILD_PATH, file), 'utf8');
    fs.writeFileSync(outputFilePath, `${LINE_SEP}${fileData}${LINE_SEP}`, { encoding: 'utf8', flag: 'a+' });
    fs.rmSync(join(BUILD_PATH, file));
}
