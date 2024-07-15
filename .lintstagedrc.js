module.exports = {
    '*.md': 'cspell --no-must-find-files --unique',
    '*.{css,scss,md,yml}': 'prettier --write',
    '*.{css,scss}': 'stylelint --fix',
};
