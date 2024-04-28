const getBaseKarmaConfig = require('../../karma.conf');

module.exports = function (config) {
    const baseConfig = getBaseKarmaConfig();
    return config.set({
        ...baseConfig,

        coverageReporter: {
            dir: '../../dist/coverage/angular-moment-adapter'
        }
    });
};
