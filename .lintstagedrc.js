module.exports = {
    '*.md': 'cspell --no-must-find-files --unique',
    '*.{css,scss,md,yml,json,js,ts}': 'prettier --write',
    '*.{css,scss}': 'stylelint --fix',
};
