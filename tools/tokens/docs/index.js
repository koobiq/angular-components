require('@koobiq/tokens-builder/build');
const StyleDictionary = require('style-dictionary');
const sdConfig = require('./sdConfig');

require('./formats')(StyleDictionary);

StyleDictionary.extend(sdConfig).buildAllPlatforms();
