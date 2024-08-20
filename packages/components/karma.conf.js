const getBaseKarmaConfig = require('../../karma.conf');

module.exports = function (config) {
    const baseConfig = getBaseKarmaConfig();
    return config.set({
        ...baseConfig,
        files: [{ pattern: '../../dist/components/prebuilt-themes/light-theme.css', included: true, watched: true }]
    });
};
