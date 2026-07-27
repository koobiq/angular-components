// @ts-check
import angular from '@analogjs/astro-angular';
import mdx from '@astrojs/mdx';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// Koobiq's `components`/`docs-examples` Angular libraries are built by the existing
// `yarn run build:components` / `build:docs-examples-module` / `build:docs-examples` scripts
// into `dist/components` and `dist/docs-examples` (Angular Package Format, with per-component
// secondary entry points). Aliasing the bare specifiers to those built package roots lets Vite's
// own node-style resolver follow each package's `exports` map for subpaths such as
// `@koobiq/docs-examples/components/accordion`, exactly like the existing `koobiq-docs` Angular
// app already does via `apps/docs/tsconfig.app.json`'s `paths`.
const distComponents = fileURLToPath(new URL('../../dist/components', import.meta.url));
const distDocsExamples = fileURLToPath(new URL('../../dist/docs-examples', import.meta.url));

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: 'Koobiq',
            social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/koobiq/angular-components' }],
            defaultLocale: 'ru',
            locales: {
                ru: { label: 'Русский', lang: 'ru' },
                en: { label: 'English', lang: 'en' }
            },
            customCss: ['./src/styles/global.scss'],
            // Koobiq's design tokens scope their color values under a `.kbq-light`/`.kbq-dark` class on
            // any ancestor element (see node_modules/@koobiq/design-tokens/web/css-tokens-light.css) —
            // matching the installation guide's `<body class="kbq-light">` step. Set on `<html>` instead
            // via an inline head script: it's the one element guaranteed to exist the instant this script
            // runs (unlike `<body>`, which isn't parsed yet), so there's no flash of unstyled content.
            head: [
                {
                    tag: 'script',
                    content: "document.documentElement.classList.add('kbq-light');"
                }
            ],
            sidebar: [
                {
                    label: 'Guides',
                    translations: { ru: 'Основное' },
                    items: [{ label: 'Installation', translations: { ru: 'Установка' }, slug: 'guides/installation' }]
                },
                {
                    label: 'Components',
                    translations: { ru: 'Компоненты' },
                    items: [
                        {
                            label: 'Accordion',
                            items: [
                                {
                                    label: 'Overview',
                                    translations: { ru: 'Обзор' },
                                    slug: 'components/accordion/overview'
                                },
                                { label: 'API', slug: 'components/accordion/api' },
                                {
                                    label: 'Examples',
                                    translations: { ru: 'Примеры' },
                                    slug: 'components/accordion/examples'
                                }
                            ]
                        }
                    ]
                }
            ]
        }),
        mdx(),
        angular({
            vite: {
                inlineStylesExtension: 'scss|sass|less',
                // Only run Angular's raw-TypeScript-decorator transform on first-party source we
                // author inside this app. Everything from `packages/docs-examples`/`packages/components`
                // is consumed pre-built (already Ivy-compiled .mjs) via the aliases below, and must NOT
                // be re-transformed. Scoping this also avoids the transform touching Starlight's own
                // files, per @analogjs/astro-angular's own Starlight-compatibility guidance.
                transformFilter: (_code, id) => id.endsWith('.ts') && id.includes('/apps/docs-v2/src/components/')
            }
        })
    ],
    vite: {
        resolve: {
            alias: [
                { find: /^@koobiq\/docs-examples$/, replacement: distDocsExamples },
                { find: /^@koobiq\/docs-examples\//, replacement: `${distDocsExamples}/` },
                { find: /^@koobiq\/components$/, replacement: distComponents },
                { find: /^@koobiq\/components\//, replacement: `${distComponents}/` }
            ]
        }
    }
});
