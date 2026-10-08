import { runV21Upgrade } from '../testing';

const KBQ_THEME = '`KbqTheme` was renamed to `KbqThemeConfig`';
const THEME_SERVICE = '`ThemeService` was removed';
const OPTION_SCROLL_POSITION = '`getOptionScrollPosition()` was removed';

describe('v21-upgrade: core', () => {
    it('rewrites KbqThemeSelector.Default to Light', async () => {
        const run = await runV21Upgrade({
            'selector.ts': [
                "import { KbqThemeSelector } from '@koobiq/components/core';",
                'export const light = KbqThemeSelector.Default;',
                ''
            ].join('\n')
        });

        expect(run.read('selector.ts')).toContain('export const light = KbqThemeSelector.Light;');
    });

    it('rewrites KbqThemeNames.Default to Light', async () => {
        const run = await runV21Upgrade({
            'names.ts': [
                "import { KbqThemeNames } from '@koobiq/components/core';",
                'export const isLight = (name: string) => name === KbqThemeNames.Default;',
                ''
            ].join('\n')
        });

        expect(run.read('names.ts')).toContain('name === KbqThemeNames.Light');
    });

    it('rewrites the Default members in a template that reads the enums', async () => {
        const run = await runV21Upgrade({
            'enums.html': '<div [class]="KbqThemeSelector.Default" [title]="KbqThemeNames.Default"></div>\n'
        });

        expect(run.read('enums.html')).toBe(
            '<div [class]="KbqThemeSelector.Light" [title]="KbqThemeNames.Light"></div>\n'
        );
    });

    it('rewrites KbqDefaultThemes to KBQ_DEFAULT_THEMES', async () => {
        const run = await runV21Upgrade({
            'themes.ts': [
                "import { KbqDefaultThemes, kbqThemeProvider } from '@koobiq/components/core';",
                'export const provider = kbqThemeProvider({ themes: KbqDefaultThemes });',
                ''
            ].join('\n')
        });

        expect(run.read('themes.ts')).toBe(
            [
                "import { KBQ_DEFAULT_THEMES, kbqThemeProvider } from '@koobiq/components/core';",
                'export const provider = kbqThemeProvider({ themes: KBQ_DEFAULT_THEMES });',
                ''
            ].join('\n')
        );
    });

    it('rewrites KbqTheme to KbqThemeConfig and reports the changed shape', async () => {
        const run = await runV21Upgrade({
            'theme.ts': [
                "import { KbqTheme } from '@koobiq/components/core';",
                "export const theme: KbqTheme = { name: 'brand', className: 'brand', selected: false };",
                ''
            ].join('\n')
        });

        expect(run.read('theme.ts')).toBe(
            [
                "import { KbqThemeConfig } from '@koobiq/components/core';",
                "export const theme: KbqThemeConfig = { name: 'brand', className: 'brand', selected: false };",
                ''
            ].join('\n')
        );
        expect(run.log).toContain(`theme.ts\n  ${KBQ_THEME}`);
    });

    it('keeps one specifier when a clause imported the old and the new name', async () => {
        const run = await runV21Upgrade({
            'both.ts': [
                'import {',
                '    KBQ_DEFAULT_THEMES,',
                '    KbqDefaultThemes,',
                '    KbqTheme,',
                '    KbqThemeConfig as Config,',
                '    KbqThemeConfig',
                "} from '@koobiq/components/core';",
                'export const themes: KbqTheme[] = KbqDefaultThemes;',
                ''
            ].join('\n')
        });

        expect(run.read('both.ts')).toBe(
            [
                'import {',
                '    KBQ_DEFAULT_THEMES,',
                '    KbqThemeConfig as Config,',
                '    KbqThemeConfig',
                "} from '@koobiq/components/core';",
                'export const themes: KbqThemeConfig[] = KBQ_DEFAULT_THEMES;',
                ''
            ].join('\n')
        );
    });

    it('reports ThemeService imported from the library', async () => {
        const source = [
            "import { ThemeService } from '@koobiq/components/core';",
            'export class App {',
            '    private readonly themeService = inject(ThemeService);',
            '    dark() { this.themeService.setTheme(1); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'service.ts': source });

        expect(run.read('service.ts')).toBe(source);
        expect(run.log).toContain(`service.ts\n  ${THEME_SERVICE}`);
    });

    it('reports getOptionScrollPosition imported from the library', async () => {
        const source = [
            "import { getOptionScrollPosition } from '@koobiq/components/core';",
            'export const top = getOptionScrollPosition(3, 32, 0, 256);',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'scroll.ts': source });

        expect(run.read('scroll.ts')).toBe(source);
        expect(run.log).toContain(`scroll.ts\n  ${OPTION_SCROLL_POSITION}`);
    });

    it("leaves the replacements, an app's own ThemeService and similar names alone", async () => {
        const source = [
            "import { KBQ_DEFAULT_THEMES, KbqThemeConfig, KbqThemeSelector, KbqThemeService } from '@koobiq/components/core';",
            "import { ThemeService } from './theme.service';",
            "import { getOptionScrollPosition } from './scroll';",
            'export type AppTheme = KbqThemeConfig & { MyKbqTheme?: string };',
            'export enum Palette { Default = 0 }',
            'export class App {',
            '    readonly kbq = inject(KbqThemeService);',
            '    readonly own = inject(ThemeService);',
            '    readonly themes = KBQ_DEFAULT_THEMES;',
            '    readonly light = KbqThemeSelector.Light;',
            '    readonly palette = Palette.Default;',
            '    readonly top = getOptionScrollPosition();',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'unrelated.ts': source });

        expect(run.read('unrelated.ts')).toBe(source);
        expect(run.log).not.toContain('unrelated.ts');
    });
});
