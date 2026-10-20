module.exports = {
    '*.{md,mdx}': 'cspell --no-must-find-files --unique',
    '*': 'prettier --write --ignore-unknown',
    '*.{css,scss}': 'stylelint --max-warnings=0 --fix',
    '*.{js,cjs,mjs,ts,cts,mts,html}': 'eslint --max-warnings=0 --no-warn-ignored --fix'
};
