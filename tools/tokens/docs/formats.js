const { mapToken, outputTable } = require('./templates');

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
            return outputTable(mappedTokens);
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/typography',
        formatter: function ({ dictionary }) {
            dictionary.allTokens = dictionary.allTokens
                .map((token) => {
                    token.name = token.name.replace(/(light|dark)-/, '');
                    return token;
                })
                .filter((token, pos, allTokens) => allTokens.indexOf(token) === pos);

            const mappedTokens = dictionary.allTokens.map(mapToken);
            return outputTable(mappedTokens);
        }
    });
};
