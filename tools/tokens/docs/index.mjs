import StyleDictionary from 'style-dictionary';
// Side-effect import: registers the koobiq transforms, filters, formats and the
// `kbq/expand-typography` preprocessor on the shared Style Dictionary singleton.
import '@koobiq/tokens-builder/build';
import registerFormats from './formats.mjs';
import sdConfig from './sdConfig.mjs';
import registerTransforms from './transforms.mjs';

registerFormats(StyleDictionary);
registerTransforms(StyleDictionary);

await new StyleDictionary(sdConfig).buildAllPlatforms();
