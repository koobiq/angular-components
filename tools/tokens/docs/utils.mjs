import { NO_HEADER } from './config.mjs';

export const capitalize = (wordOrWordParts, opts = {}) => {
    let wordParts;

    if (Array.isArray(wordOrWordParts)) {
        wordParts = wordOrWordParts.map((word) => word[0].toUpperCase() + word.substring(1));
    }

    if (typeof wordOrWordParts === 'string') {
        wordParts = wordOrWordParts.split(opts?.separator);
    }

    return wordParts.map((word) => word[0].toUpperCase() + word.substring(1)).join(opts?.outputSeparator || ' ');
};

export const updateObject = (res, key, value) => {
    if (!res[key]) {
        res[key] = [value];

        return res;
    }

    res[key].push(value);

    return res;
};

export const sortSections = (a, b) => {
    if (a.type.toLowerCase() === NO_HEADER) return -1;
    if (b.type.toLowerCase() === NO_HEADER) return 1;
};

/**
 * A token's value, whichever key the sources use.
 *
 * @koobiq/design-tokens v4 authors its sources in DTCG, so Style Dictionary puts the value on
 * `$value`; the non-DTCG `value` is kept for a project still on the old shape.
 */
export const tokenValue = (token) => ('$value' in token ? token.$value : token.value);
