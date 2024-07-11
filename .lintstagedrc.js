module.exports = {
    '*.{css,scss}': [
        'yarn prettier --write',
        'yarn stylelint --fix',
    ],
    '*.md': 'yarn run cspell --no-must-find-files --files',
    '*.yml': 'yamllint',
};
