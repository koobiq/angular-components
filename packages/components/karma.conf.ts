import { Config } from 'karma';

module.exports = (config: Config): void => {
    config.set({
        ...require('../../karma.conf')(),
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
