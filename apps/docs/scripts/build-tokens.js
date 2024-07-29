const StyleDictionary = require('style-dictionary');
const getPlatformConfig = require('@koobiq/tokens-builder/configs/index.js');

// ==== Include custom transforms ====
require('@koobiq/tokens-builder/transforms/attribute/md-typography.js')(StyleDictionary);
require('@koobiq/tokens-builder/transforms/attribute/typography.js')(StyleDictionary);
require('@koobiq/tokens-builder/transforms/attribute/palette.js')(StyleDictionary);
require('@koobiq/tokens-builder/transforms/attribute/prefix.js')(StyleDictionary);
require('@koobiq/tokens-builder/transforms/attribute/font.js')(StyleDictionary);
require('@koobiq/tokens-builder/transforms/attribute/theme.js')(StyleDictionary);

// ==== Include custom filters ====
require('@koobiq/tokens-builder/filters/palette.js')(StyleDictionary);
require('@koobiq/tokens-builder/filters/css-variables.js')(StyleDictionary);
require('@koobiq/tokens-builder/filters/color.js')(StyleDictionary);
require('@koobiq/tokens-builder/filters/typography.js')(StyleDictionary);
require('@koobiq/tokens-builder/filters/md-typography.js')(StyleDictionary);

// ==== Include custom transform groups ====
require('@koobiq/tokens-builder/transformGroups/scss.js')(StyleDictionary);
require('@koobiq/tokens-builder/transformGroups/css.js')(StyleDictionary);
require('@koobiq/tokens-builder/transformGroups/ts.js')(StyleDictionary);

// ==== Include custom formats ====
require('@koobiq/tokens-builder/formats/typography.js')(StyleDictionary);
require('@koobiq/tokens-builder/formats/palette.js')(StyleDictionary);
require('@koobiq/tokens-builder/formats/variables.js')(StyleDictionary);

function buildTokens(themeConfig) {
    StyleDictionary.registerFileHeader({
        name: 'customHeader',
        fileHeader: () => [`Do not edit directly`]
    });

    // ==== Run build ====
    console.log('Build started...');
    console.log('==============================================');

    themeConfig.map((platform) => {
        // APPLY THE CONFIGURATION
        // Very important: the registration of custom transforms
        // needs to be done _before_ applying the configuration
        const extendedPlatform = getPlatformConfig(platform);
        delete extendedPlatform.platforms.figma;

        extendedPlatform.platforms.css.files[0].options.selector = `.${platform.skin}`;

        const StyleDictionaryExtended = StyleDictionary.extend(extendedPlatform);
        delete StyleDictionaryExtended.platforms.figma;

        // FINALLY, BUILD ALL THE PLATFORMS
        StyleDictionaryExtended.buildAllPlatforms();
    });

    console.log('\n==============================================');
    console.log('\nBuild completed!');
}

const kbq = 'koobiq';

const themesConfig = [];

const themeColorNames = ['default-theme'];

for (const skin of [kbq]) {
    const koobiqTokensProps = `node_modules/@koobiq/design-tokens/web/properties/**/*.json5`;
    const koobiqTokensComponents = `node_modules/@koobiq/design-tokens/web/components/**/*.json5`;

    for (const theme of themeColorNames) {
        themesConfig.push({
            skin,
            name: theme,
            buildPath: [
                koobiqTokensProps,
                `apps/docs/src/styles/${skin}/${theme}/properties/**/*.json5`,
                koobiqTokensComponents
            ],
            outputPath: `apps/docs/src/styles/${skin}/${theme}/`
        });
    }
}

buildTokens(themesConfig);
