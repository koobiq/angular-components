module.exports = function (config) {
    config.set({
        basePath: './',
        frameworks: ['jasmine'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter')
        ],
        client: {
            clearContext: false // leave Jasmine Spec Runner output visible in browser
        },
        files: [{
            pattern: './dist/**/*.spec.js', included: true
        }],
        reporters: ['progress', 'kjhtml'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false,
        restartOnFileChange: true
    });
};
