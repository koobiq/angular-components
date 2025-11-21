const { simpleMapColors, simpleMapToken } = require('./templates');
const { updateObject, sortSections } = require('./utils');
const { NO_HEADER } = require('./config');

module.exports = (StyleDictionary) => {
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

            return `export const docsData = ${JSON.stringify(mappedTokens)};`;
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/palette-ts',
        formatter: function ({ dictionary }) {
            dictionary.allTokens = dictionary.allTokens.filter(
                (token, pos, allTokens) => allTokens.indexOf(token) === pos
            );

            const mappedTokens = dictionary.allTokens.map(simpleMapToken);

            return `export const docsData = ${JSON.stringify(mappedTokens)};`;
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/globals-ts',
        formatter: function ({ dictionary }) {
            const mappedTokens = dictionary.allTokens.map(simpleMapToken);

            return `export const docsData = ${JSON.stringify(mappedTokens)};`;
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/border-radius-ts',
        formatter: function ({ dictionary }) {
            const mappedTokens = dictionary.allTokens.map(simpleMapToken);

            return `export const docsData = ${JSON.stringify(mappedTokens)};`;
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/border-radius-ts',
        formatter: function ({ dictionary }) {
            const mappedTokens = dictionary.allTokens.map(simpleMapToken);

            return `export const docsData = ${JSON.stringify(mappedTokens)};`;
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/shadows-ts',
        formatter: function ({ dictionary }) {
            const mappedTokens = dictionary.allTokens.map(simpleMapToken);

            return `export const docsData = ${JSON.stringify(mappedTokens)}`;
        }
    });
};
