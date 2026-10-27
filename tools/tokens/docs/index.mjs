// Registers the koobiq transforms, preprocessors and formats on the StyleDictionary class.
import '@koobiq/tokens-builder/build';
import StyleDictionary from 'style-dictionary';
import registerFormats from './formats.mjs';
import sdConfig from './sdConfig.mjs';
import registerTransforms from './transforms.mjs';

registerFormats(StyleDictionary);
registerTransforms(StyleDictionary);

await new StyleDictionary(sdConfig).buildAllPlatforms();
