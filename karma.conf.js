// @ts-check

const { constants } = require('karma');
const isCI = !!process.env.CI;

/**
 * @see https://karma-runner.github.io/6.4/config/configuration-file.html
 *
 * @returns {import('karma').ConfigOptions}
 */
module.exports = () => {
    return {
        basePath: '',
        frameworks: [
            'jasmine',
            '@angular-devkit/build-angular'
        ],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-spec-reporter'),
            require('karma-jasmine-html-reporter'),
            // @ts-ignore
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        client: {
            clearContext: true,
            jasmine: {
                random: false,
                stopOnSpecFailure: true
            }
        },
        reporters: isCI ? ['dot'] : ['spec', 'kjhtml'],
        specReporter: {
            maxLogLines: 5,
            suppressSummary: false,
            suppressErrorSummary: false,
            suppressFailed: false,
            suppressPassed: false,
            suppressSkipped: false,
            showSpecTiming: true,
            failFast: true
        },
        port: 9876,
        colors: true,
        logLevel: constants.LOG_INFO,
        autoWatch: false,
        singleRun: true,
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: [
                    '--window-size=1024,768',
                    '--no-sandbox'
                ]
            }
        },
        browsers: ['ChromeHeadlessNoSandbox']
    };
};
