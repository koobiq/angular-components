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
            return `### Цвета${LINE_SEP}` + outputTable(mappedTokens);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/typography',
        formatter: function ({ dictionary }) {
            const filtered = [];
            for (const token of dictionary.allTokens) {
                const isTypographyTypeMissing =
                    filtered.findIndex(({ attributes }) => attributes.type === token.attributes.type) === -1;
                if (isTypographyTypeMissing) {
                    filtered.push(token);
                }
            }
            // Sort with design guidelines
            filtered.sort((a, b) => {
                if (a.attributes.type < b.attributes.type) {
                    return -1;
                }
                if (a.attributes.type > b.attributes.type) {
                    return 1;
                }
                return 0;
            });
            const mappedTokens = filtered.map(mapTypography);

            return `### Типографика${LINE_SEP}` + outputTable(mappedTokens);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/globals',
        formatter: function ({ dictionary }) {
            const mappedTokens = dictionary.allTokens.map(mapGlobals);
            return `### Размеры${LINE_SEP}` + outputTable(mappedTokens);
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
            return `### Тени${LINE_SEP}` + outputTable(mappedTokens);
        }
    });
};
