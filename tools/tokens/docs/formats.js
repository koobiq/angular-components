const {
    mapColors,
    mapPalette,
    mapTypography,
    mapGlobals,
    mapBorderRadius,
    mapShadows,
    outputTypographyTable,
    outputTable,
    outputPage
} = require('./templates');
const { updateObject, sortSections } = require('./utils');
const { DEFAULT_MARKDOWN_HEADER_LEVEL, LINE_SEP, NO_HEADER } = require('./config');

module.exports = (StyleDictionary) => {
    StyleDictionary.registerTransform({
        type: 'name',
        name: `name/themeable-token`,
        transformer: (token) => token.name.replace(/(light|dark)-/, '')
    });
    StyleDictionary.registerTransformGroup({
        name: 'kbq/css-extended',
        transforms: [
            'attribute/cti',
            'kbq-attribute/palette',
            'kbq-attribute/font',
            'kbq-attribute/light',
            'kbq-attribute/dark',
            'name/cti/kebab',
            'color/css',
            'kbq/prefix',
            'name/themeable-token'
        ]
    });

    StyleDictionary.registerFormat({
        name: 'docs/colors',
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

            const mappedTokens = Object.entries(groupedTokens).map(mapColors);

            // sort token tables, so those of them without the header
            // will be under the higher header
            mappedTokens.sort(sortSections);
            mappedTokens.forEach(({ sections }) => sections?.sort(sortSections));
            return outputPage(DEFAULT_MARKDOWN_HEADER_LEVEL, mappedTokens).join(LINE_SEP);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/palette',
        formatter: function ({ dictionary }) {
            dictionary.allTokens = dictionary.allTokens.filter(
                (token, pos, allTokens) => allTokens.indexOf(token) === pos
            );

            const mappedTokens = dictionary.allTokens.map(mapPalette);
            return outputTable(mappedTokens);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/typography',
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
            const mappedTokens = filtered.map(mapTypography);
            return outputTypographyTable(mappedTokens);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/globals',
        formatter: function ({ dictionary }) {
            const mappedTokens = dictionary.allTokens.map(mapGlobals);
            return outputTable(mappedTokens);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/border-radius',
        formatter: function ({ dictionary }) {
            const mappedTokens = dictionary.allTokens.map(mapBorderRadius);
            return outputTable(mappedTokens);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/shadows',
        formatter: function ({ dictionary }) {
            const mappedTokens = dictionary.allTokens.map(mapShadows);
            return outputTable(mappedTokens);
        }
    });
};
