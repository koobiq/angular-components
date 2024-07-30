module.exports = {
    '*.md': 'cspell --no-must-find-files --unique',
    '*.{css,scss,md,yml,json,js,ts,xml,html}': 'prettier --write',
    '*.{css,scss}': 'stylelint --max-warnings=0 --fix',
    '*.{js,ts,html}': 'eslint --max-warnings=0 --fix'
};
