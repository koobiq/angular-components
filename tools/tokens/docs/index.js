require('@koobiq/tokens-builder/build');
const StyleDictionary = require('style-dictionary');
require('./formats')(StyleDictionary);
require('./transforms')(StyleDictionary);

const sdConfig = require('./sdConfig');

StyleDictionary.extend(sdConfig).buildAllPlatforms();
