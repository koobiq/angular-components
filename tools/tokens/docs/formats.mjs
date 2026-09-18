import { CUSTOM_HEADER, NO_HEADER } from './config.mjs';
import { getTokensOverviewData, simpleMapColors, simpleMapTypography } from './templates.mjs';
import { sortSections, updateObject } from './utils.mjs';

/** DTCG sources carry `$value`; the pre-v4 shape carried `value`. Read whichever is there. */
const tokenValue = (token) => token.$value ?? token.value;
const originalValue = (token) => token.original?.$value ?? token.original?.value;

export default (StyleDictionary) => {
    StyleDictionary.registerFormat({
        name: 'docs/typography-ts',
        format: ({ dictionary }) => {
            const filtered = [];

            for (const token of dictionary.allTokens) {
                const isTypographyTypeMissing =
                    filtered.findIndex(({ attributes }) => attributes.type === token.attributes.type) === -1;

                // `fontSize`, not `font-size`: the preset is a DTCG composite, and its
                // sub-properties keep the camelCase keys the spec gives them.
                if (isTypographyTypeMissing && token.attributes.item === 'fontSize') {
                    filtered.push(token);
                }
            }

            // Sort by font-size, largest first. Reads `$value`: a DTCG token keeps the `$`-prefixed
            // key, so `token.value` is undefined here and every comparison would come out NaN,
            // quietly leaving the presets in source order.
            filtered.sort((a, b) => parseInt(tokenValue(b)) - parseInt(tokenValue(a)));

            const mappedTokens = filtered.map(simpleMapTypography);

            return `${CUSTOM_HEADER}\n\nexport const docsData = ${JSON.stringify(mappedTokens)} as const;\n`;
        }
    });

    StyleDictionary.registerFormat({
        name: 'docs/colors-ts',
        format: ({ dictionary }) => {
            // group tokens by types
            const groupedTokens = dictionary.allTokens.reduce((res, currentToken) => {
                const original = originalValue(currentToken);
                const section =
                    typeof original === 'string' && original.startsWith('{palette')
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
        format: ({ dictionary }) => {
            const unique = dictionary.allTokens.filter((token, pos, all) => all.indexOf(token) === pos);

            const grouped = unique.reduce((res, token) => updateObject(res, token.attributes.type, token), {});

            const sections = Object.entries(grouped).map(simpleMapColors);

            return `${CUSTOM_HEADER}\n\nexport const docsData = ${JSON.stringify(sections)};\n`;
        }
    });

    for (const name of ['docs/globals-ts', 'docs/border-radius-ts', 'docs/shadows-ts']) {
        StyleDictionary.registerFormat({ name, format: ({ dictionary }) => getTokensOverviewData(dictionary) });
    }
};
