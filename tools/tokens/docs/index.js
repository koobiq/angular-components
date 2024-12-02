require('@koobiq/tokens-builder/build');
const StyleDictionary = require('style-dictionary');
const { outputTable, mapToken } = require('./templates');
const sdConfig = require('./sdConfig');

StyleDictionary.registerFormat({
    name: 'kbq-vars/docs',
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

StyleDictionary.extend(sdConfig).buildAllPlatforms();
