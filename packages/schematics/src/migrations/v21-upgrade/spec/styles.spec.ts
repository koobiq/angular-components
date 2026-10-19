import { runV21Upgrade } from '../testing';

const MIXIN_ARGUMENTS = '`koobiq-theme()`, `koobiq-typography()` and `kbq-core-theme()` take no arguments';
const THEME_FUNCTIONS = '`kbq-contrast()`, `kbq-palette()` and `kbq-color()` were removed';
const THEME_MAPS = '`kbq-light-theme()` and `kbq-dark-theme()` are deprecated';
const TYPOGRAPHY_CONFIG = '`kbq-typography-config()` was removed';
const TOKENS_MODULE = '`@koobiq/components/core/styles/tokens` was removed';
const MARKDOWN_CLASSES = 'The unprefixed markdown typography classes';
const UNUSED_MODULES = 'The Sass modules `core/styles/functions`';
const UNUSED_MEMBERS = '`kbq-markdown-typography-config()`, the getters of `typography-utils`';
const TIMING = 'Of the timing variables of `core/styles/functions/timing`';
const SCROLLBAR_CLASS = 'The `kbq-scrollbar` class and its `kbq-scrollbar-theme()` mixin are deprecated';
const SCROLLBAR_VARIABLES = 'The `--kbq-scrollbar-size-*`, `--kbq-scrollbar-thumb-disabled-background`';

const PREBUILT = 'node_modules/@koobiq/components/prebuilt-themes';

describe('v21-upgrade: styles', () => {
    it('drops the arguments of koobiq-theme(), koobiq-typography() and kbq-core-theme()', async () => {
        const run = await runV21Upgrade({
            'theme.scss': [
                "@use '@koobiq/components' as kbq;",
                '@include kbq.koobiq-theme($light-theme);',
                '@include kbq.koobiq-typography($tokens, $config: $config);',
                '.kbq-dark {',
                '    @include kbq.kbq-core-theme(',
                '        $dark-theme',
                '    );',
                '}',
                ''
            ].join('\n')
        });

        expect(run.read('theme.scss')).toBe(
            [
                "@use '@koobiq/components' as kbq;",
                '@include kbq.koobiq-theme();',
                '@include kbq.koobiq-typography();',
                '.kbq-dark {',
                '    @include kbq.kbq-core-theme();',
                '}',
                ''
            ].join('\n')
        );
        expect(run.log).not.toContain(MIXIN_ARGUMENTS);
    });

    it('reports arguments it cannot drop and leaves them alone', async () => {
        const styles = [
            '@include koobiq-theme(kbq-light-theme($tokens));',
            '@include koobiq-typography((font-family: Inter));',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'nested.scss': styles });

        expect(run.read('nested.scss')).toBe(styles);
        expect(run.log).toContain(`nested.scss\n  ${MIXIN_ARGUMENTS}`);
    });

    it('reports kbq-contrast(), kbq-palette() and kbq-color()', async () => {
        const run = await runV21Upgrade({
            'contrast.scss': '$c: kbq-contrast($palette, 500);\n',
            'palette.scss': '$p: kbq.kbq-palette($base, $default);\n',
            'color.scss': '.a { color: kbq-color($palette, 0.5); }\n'
        });

        expect(run.log).toContain(`contrast.scss\n  ${THEME_FUNCTIONS}`);
        expect(run.log).toContain(`palette.scss\n  ${THEME_FUNCTIONS}`);
        expect(run.log).toContain(`color.scss\n  ${THEME_FUNCTIONS}`);
    });

    it('reports the deprecated kbq-light-theme() and kbq-dark-theme()', async () => {
        const styles = '$light: kbq.kbq-light-theme($tokens);\n$dark: kbq-dark-theme($tokens);\n';
        const run = await runV21Upgrade({ 'maps.scss': styles });

        expect(run.read('maps.scss')).toBe(styles);
        expect(run.log).toContain(`maps.scss\n  ${THEME_MAPS}`);
    });

    it('reports kbq-typography-config()', async () => {
        const run = await runV21Upgrade({
            'typography.scss': '$config: typography.kbq-typography-config($tokens);\n'
        });

        expect(run.log).toContain(`typography.scss\n  ${TYPOGRAPHY_CONFIG}`);
    });

    it('reports a load of core/styles/tokens', async () => {
        const run = await runV21Upgrade({
            'use.scss': "@use '@koobiq/components/core/styles/tokens' as tokens;\n",
            'import.scss': "@import '~@koobiq/components/core/styles/_tokens.scss';\n",
            'forward.scss': '@forward "../../node_modules/@koobiq/components/core/styles/tokens";\n'
        });

        expect(run.log).toContain(`use.scss\n  ${TOKENS_MODULE}`);
        expect(run.log).toContain(`import.scss\n  ${TOKENS_MODULE}`);
        expect(run.log).toContain(`forward.scss\n  ${TOKENS_MODULE}`);
    });

    it('reports a load of the removed Sass modules', async () => {
        const run = await runV21Upgrade({
            'functions.scss': "@use '@koobiq/components/core/styles/functions' as fn;\n",
            'string.scss': "@use '~@koobiq/components/core/styles/functions/string';\n",
            'utils.scss': "@import '@koobiq/components/core/styles/typography/_typography-utils.scss';\n",
            'popup.scss': '@use "../../node_modules/@koobiq/components/core/styles/common/popup" as *;\n'
        });

        for (const file of ['functions.scss', 'string.scss', 'utils.scss', 'popup.scss']) {
            expect(run.log).toContain(`${file}\n  ${UNUSED_MODULES}`);
        }
    });

    it('reports the removed Sass members and timing variables', async () => {
        const run = await runV21Upgrade({
            'members.scss': [
                "@use '@koobiq/components/core/styles/common/tokens' as tokens;",
                '$md: kbq-markdown-typography-config($tokens);',
                '.a { @include tokens.kbq-typography-css-variables(button, text); }',
                ''
            ].join('\n'),
            'timing.scss': [
                "@use '@koobiq/components/core/styles/functions/timing' as *;",
                '.b { transition: opacity 1s $ease-in-out-quad, transform 1s $ease-out-back; }',
                ''
            ].join('\n'),
            'kept.scss': [
                "@use '@koobiq/components/core/styles/functions/timing' as *;",
                '.c { transition: opacity 1s $ease-out-circ, transform 1s $ease-in-out-circ; }',
                ''
            ].join('\n')
        });

        expect(run.log).toContain(`members.scss\n  ${UNUSED_MEMBERS}`);
        expect(run.log).toContain(`timing.scss\n  ${TIMING}`);
        expect(run.log).not.toContain('kept.scss');
    });

    it('leaves the typography mixin that stays and similar names alone', async () => {
        const styles = [
            "@use '@koobiq/components/core/styles/common/tokens' as tokens;",
            '$ease-in-quad: linear;',
            '.a { @include tokens.kbq-typography-level-to-styles-css-variables(typography, text-big); }',
            '.b { line-height: var(--kbq-line-height); font-size: my-kbq-font-size(1); }',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'kept-styles.scss': styles });

        expect(run.read('kept-styles.scss')).toBe(styles);
        expect(run.log).not.toContain('kept-styles.scss');
    });

    it('rewrites light-theme.css and dark-theme.css to theme.css and keeps one load of it', async () => {
        const run = await runV21Upgrade({
            'themes.scss': [
                "@use '@koobiq/components/prebuilt-themes/light-theme.css';",
                "@use '@koobiq/components' as kbq;",
                '',
                '// The dark one.',
                "@use '@koobiq/components/prebuilt-themes/dark-theme.css';",
                '.app { display: block; }',
                ''
            ].join('\n'),
            'dark.css': `@import url('${PREBUILT}/dark-theme.css');\n`,
            'themes.html': [
                `<link rel="stylesheet" href="${PREBUILT}/light-theme.css">`,
                `<link rel="stylesheet" href="${PREBUILT}/dark-theme.css">`,
                ''
            ].join('\n')
        });

        expect(run.read('themes.scss')).toBe(
            [
                "@use '@koobiq/components/prebuilt-themes/theme.css';",
                "@use '@koobiq/components' as kbq;",
                '',
                '// The dark one.',
                '.app { display: block; }',
                ''
            ].join('\n')
        );
        expect(run.read('dark.css')).toBe(`@import url('${PREBUILT}/theme.css');\n`);
        expect(run.read('themes.html')).toBe(`<link rel="stylesheet" href="${PREBUILT}/theme.css">\n`);
    });

    it('keeps a load of theme.css that repeats one outside its import block', async () => {
        const source = [
            'export function themeUrl(scheme: string): string {',
            '    switch (scheme) {',
            "        case 'light':",
            "            return '@koobiq/components/prebuilt-themes/light-theme.css';",
            "        case 'dark':",
            "            return '@koobiq/components/prebuilt-themes/dark-theme.css';",
            '    }',
            '}',
            ''
        ].join('\n');
        const styles = [
            '@media (prefers-color-scheme: light) {',
            "    @import '@koobiq/components/prebuilt-themes/light-theme.css';",
            '}',
            '@media (prefers-color-scheme: dark) {',
            "    @import '@koobiq/components/prebuilt-themes/dark-theme.css';",
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'theme-url.ts': source, 'schemes.scss': styles });
        const single = (text: string) => text.replace(/(?:light|dark)-theme\.css/g, 'theme.css');

        expect(run.read('theme-url.ts')).toBe(single(source));
        expect(run.read('schemes.scss')).toBe(single(styles));
    });

    it('rewrites the themes in the styles of angular.json and drops the duplicate', async () => {
        const run = await runV21Upgrade({}, {}, [
            `${PREBUILT}/light-theme.css`,
            `${PREBUILT}/dark-theme.css`,
            { input: `${PREBUILT}/dark-theme.css`, bundleName: 'koobiq', inject: false },
            'projects/app/src/styles.scss'
        ]);

        expect(run.buildStyles()).toEqual([
            `${PREBUILT}/theme.css`,
            { input: `${PREBUILT}/theme.css`, bundleName: 'koobiq', inject: false },
            'projects/app/src/styles.scss'
        ]);
    });

    it('only reports the angular.json change with fix: false', async () => {
        const styles = [`${PREBUILT}/light-theme.css`, 'projects/app/src/styles.scss'];
        const run = await runV21Upgrade({}, { fix: false }, styles);

        expect(run.buildStyles()).toEqual(styles);
        expect(run.log).toContain('would update the styles in angular.json');
    });

    it('rewrites the unprefixed markdown classes in class attributes, class bindings and selectors', async () => {
        const run = await runV21Upgrade({
            'markdown.html': [
                '<h1 class="md-h1 title">Title</h1>',
                '<p class=\'lead md-body\' [class.md-caption]="small"></p>',
                ''
            ].join('\n'),
            'markdown.scss': '.content .md-h2,\ntd.md-table-cell:hover {\n    @extend .md-body-mono;\n}\n',
            'markdown.ts': [
                '@Component({ template: \'<th class="md-table-header"></th>\' })',
                'export class Markdown {',
                "    readonly heading = document.querySelector('.md-h6');",
                '}',
                ''
            ].join('\n')
        });

        expect(run.read('markdown.html')).toBe(
            [
                '<h1 class="kbq-md-h1 title">Title</h1>',
                '<p class=\'lead kbq-md-body\' [class.kbq-md-caption]="small"></p>',
                ''
            ].join('\n')
        );
        expect(run.read('markdown.scss')).toBe(
            '.content .kbq-md-h2,\ntd.kbq-md-table-cell:hover {\n    @extend .kbq-md-body-mono;\n}\n'
        );
        expect(run.read('markdown.ts')).toContain('<th class="kbq-md-table-header"></th>');
        expect(run.read('markdown.ts')).toContain("document.querySelector('.kbq-md-h6')");
        expect(run.log).not.toContain(MARKDOWN_CLASSES);
    });

    it('reports an unprefixed markdown class it cannot rewrite and leaves it alone', async () => {
        const source = "export const mark = (el: HTMLElement) => el.classList.add('md-h3');\n";
        const template = '<p [ngClass]="{ \'md-caption\': small }"></p>\n';
        const run = await runV21Upgrade({ 'class-list.ts': source, 'ng-class.html': template });

        expect(run.read('class-list.ts')).toBe(source);
        expect(run.read('ng-class.html')).toBe(template);
        expect(run.log).toContain(`class-list.ts\n  ${MARKDOWN_CLASSES}`);
        expect(run.log).toContain(`ng-class.html\n  ${MARKDOWN_CLASSES}`);
    });

    it('reports the deprecated kbq-scrollbar class and its theme mixin and leaves them alone', async () => {
        const files = {
            'selector.scss': '.panel.kbq-scrollbar {\n    --kbq-scrollbar-thumb-default-background: red;\n}\n',
            'mixin.scss': [
                "@use '@koobiq/components/core/styles/theming/scrollbar-theme' as scrollbar;",
                '@include scrollbar.kbq-scrollbar-theme();',
                ''
            ].join('\n'),
            'attribute.html': '<div class="panel kbq-scrollbar"></div>\n',
            'binding.html': '<div [class.kbq-scrollbar]="scrollable"></div>\n',
            'ng-class.html': '<div [ngClass]="{ \'kbq-scrollbar\': scrollable }"></div>\n',
            'host.ts': "@Directive({ host: { class: 'panel kbq-scrollbar' } })\nexport class Panel {}\n",
            'class-list.ts': "export const mark = (el: HTMLElement) => el.classList.add('kbq-scrollbar');\n",
            'query.ts': "export const body = () => document.querySelector('.kbq-modal-body.kbq-scrollbar');\n"
        };
        const run = await runV21Upgrade(files);

        for (const [name, content] of Object.entries(files)) {
            expect(run.read(name)).toBe(content);
            expect(run.log).toContain(`${name}\n  ${SCROLLBAR_CLASS}`);
        }

        expect(run.log).not.toContain(SCROLLBAR_VARIABLES);
    });

    it('reports the variables of the kbq-scrollbar class the new scrollbar does not share', async () => {
        const run = await runV21Upgrade({
            'size.scss': '.panel {\n    --kbq-scrollbar-size-track-dimension: 12px;\n}\n',
            'track.css': '.panel { border-color: var(--kbq-scrollbar-track-hover-border); }\n',
            'disabled.ts': "panel.style.setProperty('--kbq-scrollbar-thumb-disabled-background', 'grey');\n"
        });

        expect(run.log).toContain(`size.scss\n  ${SCROLLBAR_VARIABLES}`);
        expect(run.log).toContain(`track.css\n  ${SCROLLBAR_VARIABLES}`);
        expect(run.log).toContain(`disabled.ts\n  ${SCROLLBAR_VARIABLES}`);
        expect(run.log).not.toContain(SCROLLBAR_CLASS);
    });

    it('leaves the new scrollbar, its variables and the classes that share the prefix alone', async () => {
        const run = await runV21Upgrade({
            'new-scrollbar.html': [
                '<kbq-scrollbar class="list"></kbq-scrollbar>',
                '<div kbqNativeScrollbar kbqNativeScrollbarDescendants class="list kbq-scrollbar-viewport"></div>',
                '<div kbq-scrollbar></div>',
                ''
            ].join('\n'),
            'new-scrollbar.scss': [
                'kbq-scrollbar,',
                '[kbq-scrollbar],',
                '.kbq-scrollbar-viewport,',
                '.kbq-scrollbar-component,',
                '.kbq-scrollbar__content,',
                '.my-kbq-scrollbar {',
                '    --kbq-scrollbar-track-size: 12px;',
                '    --kbq-scrollbar-thumb-gap: 2px;',
                '    --kbq-scrollbar-thumb-min-size: 24px;',
                '    --kbq-scrollbar-track-background: transparent;',
                '    --kbq-scrollbar-thumb-hover-background: red;',
                '    @include kbq-scrollbar-component-theme();',
                '}',
                ''
            ].join('\n'),
            'new-scrollbar.ts': [
                "@Component({ selector: 'kbq-scrollbar', template: '<kbq-scrollbar class=\"list\"></kbq-scrollbar>' })",
                'export class ScrollbarStub {',
                "    readonly scrollbar = document.querySelector('kbq-scrollbar');",
                "    readonly viewport = document.querySelector('.kbq-scrollbar-viewport');",
                '}',
                ''
            ].join('\n')
        });

        expect(run.log).not.toContain(SCROLLBAR_CLASS);
        expect(run.log).not.toContain(SCROLLBAR_VARIABLES);
    });

    it('leaves unrelated styles, classes and style entries alone', async () => {
        const styles = [
            "@use '@koobiq/components/core/styles/common/tokens' as *;",
            "@use '@koobiq/components/prebuilt-themes/theme.css';",
            '@include koobiq-theme();',
            '@include brand-koobiq-theme($theme);',
            '$c: kbq-color-scheme(dark);',
            '$b: brand-kbq-dark-theme($tokens);',
            '.kbq-md-h1, .md-body-x, .cmd-body {',
            '    color: var(--kbq-color-contrast);',
            '    @include kbq-typography-level-to-styles-css-variables(md-typography, md-body);',
            '}',
            ''
        ].join('\n');
        const template = '<p class="kbq-md-h1 md-body-x cmd-body" [class.kbq-md-caption]="small"></p>\n';
        const entries = [`${PREBUILT}/theme.css`, 'projects/app/src/styles.scss', 'projects/app/src/styles.scss'];
        const run = await runV21Upgrade({ 'plain.scss': styles, 'plain.html': template }, {}, entries);

        expect(run.read('plain.scss')).toBe(styles);
        expect(run.read('plain.html')).toBe(template);
        expect(run.buildStyles()).toEqual(entries);
        expect(run.log).not.toContain('[v21-upgrade] /');
    });
});
