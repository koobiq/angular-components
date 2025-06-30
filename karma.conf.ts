import { ConfigOptions, constants } from 'karma';

const isCI = !!process.env.CI;

module.exports = (): ConfigOptions => {
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
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        client: {
            clearContext: true,
            jasmine: {
                random: false,
                stopOnSpecFailure: true
            }
        },
        reporters: isCI ? ['dots'] : ['spec'],
        specReporter: {
            showSpecTiming: true,
            failFast: true
        },
        port: 9876,
        colors: true,
        logLevel: isCI ? constants.LOG_WARN : constants.LOG_INFO,
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
