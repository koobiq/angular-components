const {
    mapColors,
    outputTable,
    mapTypography,
    mapGlobals,
    mapBorderRadius,
    mapShadows,
    outputTypographyTable
} = require('./templates');

module.exports = (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'docs/colors',
        formatter: function ({ dictionary }) {
            dictionary.allTokens = dictionary.allTokens
                .map((token) => {
                    token.name = token.name.replace(/(light|dark)-/, '');
                    return token;
                })
                .filter((token, pos, allTokens) => allTokens.indexOf(token) === pos);

            const mappedTokens = dictionary.allTokens.map(mapColors);
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
                if (parseInt(aFontSize) < parseInt(bFontSize)) return 1;
                if (parseInt(aFontSize) > parseInt(bFontSize)) return -1;
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
            dictionary.allTokens = dictionary.allTokens.map((token) => {
                token.name = token.name.replace(/(light|dark)-/, '');
                return token;
            });

            const mappedTokens = dictionary.allTokens.map(mapShadows);
            return outputTable(mappedTokens);
        }
    });
};
