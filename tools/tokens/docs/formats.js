const {
    mapToken,
    outputTable,
    mapTypography,
    mapGlobals,
    mapBorderWidth,
    mapBorderRadius,
    mapShadows
} = require('./templates');
const { LINE_SEP } = require('./config');

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

            const mappedTokens = dictionary.allTokens.map(mapToken);
            return `### Colors${LINE_SEP}` + outputTable(mappedTokens);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/typography',
        formatter: function ({ dictionary }) {
            const filtered = [];
            for (const token of dictionary.allTokens) {
                const typeMissed =
                    filtered.findIndex((filteredToken) => filteredToken.attributes.type === token.attributes.type) ===
                    -1;
                if (typeMissed) {
                    filtered.push(token);
                }
            }
            const mappedTokens = filtered.map(mapTypography);

            return `### Typography${LINE_SEP}` + outputTable(mappedTokens);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/globals',
        formatter: function ({ dictionary }) {
            const mappedTokens = dictionary.allTokens.map(mapGlobals);
            return `### Sizes${LINE_SEP}` + outputTable(mappedTokens);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/border-width',
        formatter: function ({ dictionary }) {
            const mappedTokens = dictionary.allTokens.map(mapBorderWidth);

            return `### Border-width${LINE_SEP}` + outputTable(mappedTokens);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/border-radius',
        formatter: function ({ dictionary }) {
            const mappedTokens = dictionary.allTokens.map(mapBorderRadius);
            return `### Border-radius${LINE_SEP}` + outputTable(mappedTokens);
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
            return `### Shadows${LINE_SEP}` + outputTable(mappedTokens);
        }
    });
};
