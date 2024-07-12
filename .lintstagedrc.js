module.exports = {
    '*.{css,scss}': [
        'prettier --write',
        'stylelint --fix',
    ],
    '*.md': 'yarn run cspell --no-must-find-files --files',
    '*.yml': 'yamllint',
};
