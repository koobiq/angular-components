module.exports = {
    '*.md': 'cspell --no-must-find-files --unique',
    '*': 'prettier --write --ignore-unknown',
    '*.{css,scss}': 'stylelint --max-warnings=0 --fix',
    '*.{js,ts,html}': 'eslint --max-warnings=0 --fix'
};
