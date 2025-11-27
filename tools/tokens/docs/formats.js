const { simpleMapColors, simpleMapTypography, getTokensOverviewData } = require('./templates');
const { updateObject, sortSections } = require('./utils');
const { NO_HEADER, CUSTOM_HEADER } = require('./config');

module.exports = (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'docs/typography-ts',
        formatter: function ({ dictionary }) {
            const filtered = [];

            for (const token of dictionary.allTokens) {
                const isTypographyTypeMissing =
                    filtered.findIndex(({ attributes }) => attributes.type === token.attributes.type) === -1;

                if (isTypographyTypeMissing && token.attributes.item === 'font-size') {
                    filtered.push(token);
                }
            }

            // Sort by font-size
            filtered.sort((a, b) => {
                const aFontSize = parseInt(a.value);
                const bFontSize = parseInt(b.value);

                if (aFontSize < bFontSize) return 1;
                if (aFontSize > bFontSize) return -1;

                return 0;
            });

            const mappedTokens = filtered.map(simpleMapTypography);

            return `${CUSTOM_HEADER}\n\nexport const docsData = ${JSON.stringify(mappedTokens)} as const;\n`;
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/colors-ts',
        formatter: function ({ dictionary }) {
            // filter duplicates (light/dark)
            dictionary.allTokens = dictionary.allTokens.filter((token, pos, allTokens) => {
                const foundIndex = allTokens.findIndex(({ name }) => name === token.name);

                return foundIndex !== pos;
            });

            // group tokens by types
            const groupedTokens = dictionary.allTokens.reduce((res, currentToken) => {
                const section =
                    typeof currentToken.original.value === 'string' &&
                    currentToken.original.value.startsWith('{palette')
                        ? NO_HEADER
                        : currentToken.attributes.type;

                return updateObject(res, section, currentToken);
            }, {});

            // since there is only 1 group with recursive data
            // made it manually to not overload the logic
            groupedTokens.states = groupedTokens.states?.reduce((res, currentToken) => {
                const section = !currentToken.attributes.subitem ? NO_HEADER : currentToken.attributes.item;

                return updateObject(res, section, currentToken);
            }, {});

            const mappedTokens = Object.entries(groupedTokens).map(simpleMapColors);

            // sort token tables, so those of them without the header
            // will be under the higher header
            mappedTokens.sort(sortSections);
            mappedTokens.forEach(({ sections }) => sections?.sort(sortSections));

            return `${CUSTOM_HEADER}\n\nexport const docsData = ${JSON.stringify(mappedTokens)};\n`;
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/palette-ts',
        formatter: function ({ dictionary }) {
            dictionary.allTokens = dictionary.allTokens.filter(
                (token, pos, allTokens) => allTokens.indexOf(token) === pos
            );

            return getTokensOverviewData(dictionary);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/globals-ts',
        formatter: function ({ dictionary }) {
            return getTokensOverviewData(dictionary);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/border-radius-ts',
        formatter: function ({ dictionary }) {
            return getTokensOverviewData(dictionary);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/border-radius-ts',
        formatter: function ({ dictionary }) {
            return getTokensOverviewData(dictionary);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/shadows-ts',
        formatter: function ({ dictionary }) {
            return getTokensOverviewData(dictionary);
        }
    });
};
