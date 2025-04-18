require('@koobiq/tokens-builder/build');
const StyleDictionary = require('style-dictionary');

const BASE_PATH = 'node_modules/@koobiq/design-tokens/web';
const LINE_SEP = '\r\n';

const sdConfig = {
    source: [`${BASE_PATH}/properties/typography.json5`, `${BASE_PATH}/properties/font.json5`],
    platforms: {
        css: {
            buildPath: `packages/components/core/styles/typography/`,
            transformGroup: 'kbq/css',
            files: [
                {
                    filter: (token) => !['font'].includes(token.attributes.category),
                    destination: 'typography.css',
                    format: 'kbq-css/typography',
                    prefix: 'kbq'
                }
            ],
            options: {
                outputReferences: true
            }
        }
    }
};

const generateTokenBlock = (key, tokens, selector) => {
    const extraTab = selector && '\t';

    const typographyTypeCssVars = Object.values(tokens)
        .map(({ attributes, name }) => `${extraTab}\t\t${attributes.item}: var(--${name});`)
        .join(LINE_SEP);

    return `${extraTab}\t.kbq-${key} {${LINE_SEP}` + typographyTypeCssVars + `${LINE_SEP}${extraTab}\t}${LINE_SEP}`;
};

const generateCategoryBlock = (category, typographyStyle) => {
    const selector = category === 'typography' ? '' : `\t[lang='${category}']`;
    const categoryOutput = Object.entries(typographyStyle)
        .map(([key, tokens]) => generateTokenBlock(key, tokens, selector))
        .join(LINE_SEP);

    return selector ? `${selector} {${LINE_SEP}` + categoryOutput + `\t}${LINE_SEP}` : categoryOutput;
};

StyleDictionary.registerFormat({
    name: 'kbq-css/typography',
    formatter: function ({ dictionary }) {
        const baseTypography = Object.entries(dictionary.tokens)
            .map(([category, typographyStyle]) => generateCategoryBlock(category, typographyStyle))
            .join(LINE_SEP);

        return `@mixin kbq-base-typography() {${LINE_SEP}` + baseTypography + `}${LINE_SEP}`;
    }
});

StyleDictionary.extend(sdConfig).buildAllPlatforms();
