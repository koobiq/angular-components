const getBaseKarmaConfig = require('../../karma.conf');

module.exports = function (config) {
    const baseConfig = getBaseKarmaConfig();
    return config.set({
        ...baseConfig,
        files: [
            { pattern: '../../dist/components/prebuilt-themes/theme.css', included: true, watched: true },
            { pattern: '../../node_modules/@koobiq/design-tokens/web/css-tokens.css', included: true, watched: true },
            {
                pattern: '../../node_modules/@koobiq/design-tokens/web/css-tokens-light.css',
                included: true,
                watched: true
            }
        ]
    });
};
