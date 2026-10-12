import { BASE_PATH, OUTPUT_PATH } from './config.mjs';

const isDeprecated = (token) => Boolean(token.$deprecated ?? token.deprecated);

export default {
    source: [`${BASE_PATH}/properties/*.json5`],
    // Typography presets are DTCG composites; the docs data lists one variable per sub-property,
    // so they are expanded back into a token each. md-typography references those sub-properties,
    // which is why the expansion has to happen before Style Dictionary resolves references.
    preprocessors: ['kbq/expand-typography'],
    platforms: {
        css: {
            buildPath: OUTPUT_PATH,
            transformGroup: 'kbq/css-extended',
            prefix: 'kbq',
            files: [
                {
                    filter: (token) => token.attributes.category === 'typography',
                    destination: 'typography.ts',
                    format: 'docs/typography-ts'
                },
                {
                    filter: (token) =>
                        token.attributes.category === 'light' &&
                        token.attributes.item !== 'palette' &&
                        !isDeprecated(token),
                    destination: 'colors.ts',
                    format: 'docs/colors-ts'
                },
                {
                    filter: (token) => token.attributes.category === 'plt',
                    destination: 'palette.ts',
                    format: 'docs/palette-ts'
                },
                {
                    filter: (token) => token.attributes.category === 'semantic',
                    destination: 'semantic.ts',
                    format: 'docs/palette-ts'
                },
                {
                    filter: (token) =>
                        token.attributes.category === 'size' && !token.attributes.type.includes('border-radius'),
                    destination: 'sizes.ts',
                    format: 'docs/globals-ts'
                },
                {
                    filter: (token) =>
                        token.attributes.category === 'size' && token.attributes.type.includes('border-radius'),
                    destination: 'border-radius.ts',
                    format: 'docs/border-radius-ts'
                },
                {
                    filter: (token) => token.attributes.category === 'shadow' && token.attributes.type === 'light',
                    destination: 'shadows.ts',
                    format: 'docs/shadows-ts'
                }
            ]
        }
    }
};
