import { runV21Upgrade } from './testing';

// The rewrites and warnings of each area are covered by `spec/<area>.spec.ts`.
describe('v21-upgrade', () => {
    it('leaves a file that uses none of the removed APIs alone', async () => {
        const source =
            "import { KbqButtonModule } from '@koobiq/components/button';\nexport const used = KbqButtonModule;\n";
        const run = await runV21Upgrade({ 'plain.ts': source });

        expect(run.read('plain.ts')).toBe(source);
        expect(run.log).not.toContain('[v21-upgrade] /');
    });

    it('leaves the commas of the rest of a file alone when it removes an import specifier', async () => {
        const rest = [
            'const pair = [1, 2];',
            'export const [, second] = pair;',
            'export const values = (m: Record<string, number>) => Object.entries(m).map(([, v]) => v);',
            'export const words = (s: string) => s.split(/[\\s,]+/);',
            'export const separator = /[,;]/;',
            "export const doubled = 'a,,b';",
            'export const options = {',
            '    a: 1,',
            '};',
            'export const list = [',
            '    1,',
            '];',
            ''
        ].join('\n');
        const run = await runV21Upgrade({
            'commas.ts': [
                "import { ThemePalette } from '@koobiq/components/core';",
                'export const color = ThemePalette.Error;',
                rest
            ].join('\n')
        });

        expect(run.read('commas.ts')).toBe(
            [
                "import { KbqComponentColors } from '@koobiq/components/core';",
                'export const color = KbqComponentColors.Error;',
                rest
            ].join('\n')
        );
    });

    it('imports a symbol it writes as a value past a type-only import or an alias of it', async () => {
        const core = " from '@koobiq/components/core';";
        const run = await runV21Upgrade({
            'type-clause.ts': [
                `import type { KbqThemeConfig }${core}`,
                `import { KbqDefaultSizes, ThemePalette }${core}`,
                'export const color = ThemePalette.Error;',
                'export type Theme = [KbqThemeConfig, KbqDefaultSizes];',
                ''
            ].join('\n'),
            'type-clause-only.ts': [
                `import type { KbqThemeConfig }${core}`,
                `import { ThemePalette }${core}`,
                'export const color = ThemePalette.Error;',
                'export type Theme = KbqThemeConfig;',
                ''
            ].join('\n'),
            'type-specifier.ts': [
                `import { type KbqComponentColors, ThemePalette }${core}`,
                'export const color: KbqComponentColors = ThemePalette.Error;',
                ''
            ].join('\n'),
            'type-import.ts': [
                `import type { KbqComponentColors, KbqThemeConfig }${core}`,
                `import { ThemePalette }${core}`,
                'export const color: KbqComponentColors = ThemePalette.Error;',
                'export type Theme = KbqThemeConfig;',
                ''
            ].join('\n'),
            'aliased.ts': [
                `import { KbqComponentColors as Colors, ThemePalette }${core}`,
                'export const colors = [Colors.Success, ThemePalette.Error];',
                ''
            ].join('\n'),
            'commented.ts': [
                'import {',
                '    KbqDefaultSizes, // sizes',
                '    KbqComponentColors,',
                '    ThemePalette',
                `}${core}`,
                'export const colors = [KbqDefaultSizes.Normal, KbqComponentColors.Success, ThemePalette.Error];',
                ''
            ].join('\n')
        });

        expect(run.read('type-clause.ts')).toBe(
            [
                `import type { KbqThemeConfig }${core}`,
                `import { KbqDefaultSizes, KbqComponentColors }${core}`,
                'export const color = KbqComponentColors.Error;',
                'export type Theme = [KbqThemeConfig, KbqDefaultSizes];',
                ''
            ].join('\n')
        );
        expect(run.read('type-clause-only.ts')).toBe(
            [
                `import { KbqComponentColors }${core}`,
                `import type { KbqThemeConfig }${core}`,
                'export const color = KbqComponentColors.Error;',
                'export type Theme = KbqThemeConfig;',
                ''
            ].join('\n')
        );
        expect(run.read('type-specifier.ts')).toBe(
            [
                `import { KbqComponentColors }${core}`,
                'export const color: KbqComponentColors = KbqComponentColors.Error;',
                ''
            ].join('\n')
        );
        expect(run.read('type-import.ts')).toBe(
            [
                `import { KbqComponentColors }${core}`,
                `import type { KbqThemeConfig }${core}`,
                'export const color: KbqComponentColors = KbqComponentColors.Error;',
                'export type Theme = KbqThemeConfig;',
                ''
            ].join('\n')
        );
        expect(run.read('aliased.ts')).toBe(
            [
                `import { KbqComponentColors as Colors, KbqComponentColors }${core}`,
                'export const colors = [Colors.Success, KbqComponentColors.Error];',
                ''
            ].join('\n')
        );
        expect(run.read('commented.ts')).toBe(
            [
                'import {',
                '    KbqDefaultSizes, // sizes',
                '    KbqComponentColors',
                `}${core}`,
                'export const colors = [KbqDefaultSizes.Normal, KbqComponentColors.Success, KbqComponentColors.Error];',
                ''
            ].join('\n')
        );
    });

    it('adds a symbol past a line comment that ends an import clause', async () => {
        const core = " from '@koobiq/components/core';";
        const source = (provider: string) => [
                `import { ThemePalette }${core}`,
                'import {',
                '    KbqDefaultSizes,',
                `    ${provider} // the provider`,
                `}${core}`,
                'export const color = ThemePalette.Error;',
                ''
            ].join('\n');
        const run = await runV21Upgrade({
            'comment.ts': source('kbqThemeProvider'),
            'comment-comma.ts': source('kbqThemeProvider,')
        });
        const expected = [
            'import {',
            '    KbqDefaultSizes,',
            '    kbqThemeProvider, // the provider',
            '    KbqComponentColors',
            `}${core}`,
            'export const color = KbqComponentColors.Error;',
            ''
        ].join('\n');

        expect(run.read('comment.ts')).toBe(expected);
        expect(run.read('comment-comma.ts')).toBe(expected);
    });

    it('keeps the line endings of a CRLF file when it adds an import', async () => {
        const core = " from '@koobiq/components/core';";
        const run = await runV21Upgrade({
            'crlf.ts': [
                '// Colors.',
                `import { ThemePalette }${core}`,
                'export const color = ThemePalette.Error;',
                ''
            ].join('\r\n'),
            'crlf-comment.ts': [
                'import {',
                '    KbqDefaultSizes // sizes',
                `}${core}`,
                `import { ThemePalette }${core}`,
                'export const colors = [KbqDefaultSizes.Normal, ThemePalette.Error];',
                ''
            ].join('\r\n')
        });

        expect(run.read('crlf.ts')).toBe(
            [
                '// Colors.',
                `import { KbqComponentColors }${core}`,
                'export const color = KbqComponentColors.Error;',
                ''
            ].join('\r\n')
        );
        expect(run.read('crlf-comment.ts')).toBe(
            [
                'import {',
                '    KbqDefaultSizes, // sizes',
                '    KbqComponentColors',
                `}${core}`,
                'export const colors = [KbqDefaultSizes.Normal, KbqComponentColors.Error];',
                ''
            ].join('\r\n')
        );
    });

    it('reports instead of writing with fix: false', async () => {
        const source =
            "import { KbqFilterBarRefresher } from '@koobiq/components/filter-bar';\nexport const r = KbqFilterBarRefresher;\n";
        const run = await runV21Upgrade({ 'dry.ts': source }, { fix: false });

        expect(run.read('dry.ts')).toBe(source);
    });
});
