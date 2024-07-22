module.exports = () => ({
    autoDetect: true,
    files: [
        'packages/**/*.ts',
        '!packages/**/*.spec.ts'
    ],
    tests: [
        'packages/**/*.spec.ts',
        '!packages/docs/**/*.*',
        '!packages/components-dev/**/*.*',
        '!packages/docs-examples/**/*.*'
    ]
});
