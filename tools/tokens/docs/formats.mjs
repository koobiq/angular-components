import { CUSTOM_HEADER, NO_HEADER } from './config.mjs';
import { getTokensOverviewData, simpleMapColors, simpleMapTypography } from './templates.mjs';
import { sortSections, tokenValue, updateObject } from './utils.mjs';

export default (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'docs/typography-ts',
        format: ({ dictionary }) => {
            const filtered = [];

            for (const token of dictionary.allTokens) {
                const isTypographyTypeMissing =
                    filtered.findIndex(({ attributes }) => attributes.type === token.attributes.type) === -1;

                // One entry per preset. `fontSize` is the sub-property every preset has, and the
                // one the sort below reads; DTCG keeps the composite's sub-properties camelCase.
                if (isTypographyTypeMissing && token.attributes.item === 'fontSize') {
                    filtered.push(token);
                }
            }

            // Sort by font-size
            filtered.sort((a, b) => {
                const aFontSize = parseInt(tokenValue(a));
                const bFontSize = parseInt(tokenValue(b));

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
        format: ({ dictionary }) => {
            // group tokens by types
            const groupedTokens = dictionary.allTokens.reduce(
                (res, currentToken) => updateObject(res, currentToken.attributes.type, currentToken),
                {}
            );

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
        format: ({ dictionary }) => {
            const unique = dictionary.allTokens.filter((token, pos, allTokens) => allTokens.indexOf(token) === pos);

            const grouped = unique.reduce((res, token) => updateObject(res, token.attributes.type, token), {});

            const sections = Object.entries(grouped).map(simpleMapColors);

            return `${CUSTOM_HEADER}\n\nexport const docsData = ${JSON.stringify(sections)};\n`;
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/globals-ts',
        format: ({ dictionary }) => getTokensOverviewData(dictionary)
    });

    StyleDictionary.registerFormat({
        name: 'docs/border-radius-ts',
        format: ({ dictionary }) => getTokensOverviewData(dictionary)
    });

    StyleDictionary.registerFormat({
        name: 'docs/shadows-ts',
        format: ({ dictionary }) => getTokensOverviewData(dictionary)
    });
};
