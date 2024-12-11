const { NO_HEADER } = require('./config');
const capitalize = (wordOrWordParts, opts = {}) => {
    let wordParts;
    if (Array.isArray(wordOrWordParts)) {
        wordParts = wordOrWordParts.map((word) => word[0].toUpperCase() + word.substring(1));
    }

    if (typeof wordOrWordParts === 'string') {
        wordParts = wordOrWordParts.split(opts?.separator);
    }

    return wordParts.map((word) => word[0].toUpperCase() + word.substring(1)).join(opts?.outputSeparator || ' ');
};

const updateObject = (res, key, value) => {
    if (!res[key]) {
        res[key] = [value];
        return res;
    }
    res[key].push(value);
    return res;
};

const sortSections = (a, b) => {
    if (a.type.toLowerCase() === NO_HEADER) return -1;
    if (b.type.toLowerCase() === NO_HEADER) return 1;
};

module.exports = {
    capitalize,
    updateObject,
    sortSections
};
