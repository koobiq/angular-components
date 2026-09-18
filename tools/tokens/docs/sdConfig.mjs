import { BASE_PATH, BUILD_PATH } from './config.mjs';

export default {
    source: [`${BASE_PATH}/properties/*.json5`],
    // Typography presets are DTCG composites, but every consumer here is flat — one entry per
    // sub-property. Without this the composite's cross-references (`{typography.title.lineHeight}`)
    // resolve one segment short of where the token actually sits and the build throws.
    preprocessors: ['kbq/expand-typography'],
    platforms: {
        css: {
            buildPath: BUILD_PATH,
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
                        !token.attributes.category.includes('plt') &&
                        !token.deprecated,
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
            ],
            options: {
                outputReferences: true
            },
            // These files reference tokens the other files own, on purpose — the palette page lists
            // what the colors page points at. Style Dictionary's per-file "filtered out references"
            // warning is noise here.
            log: { warnings: 'disabled' }
        }
    }
};
