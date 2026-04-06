require('@koobiq/tokens-builder/build');
const StyleDictionary = require('style-dictionary');

require('../../../node_modules/@koobiq/tokens-builder/transforms/name/custom-kebab')(StyleDictionary);
require('./formats')(StyleDictionary);
require('./transforms')(StyleDictionary);

const sdConfig = require('./sdConfig');

StyleDictionary.extend(sdConfig).buildAllPlatforms();
