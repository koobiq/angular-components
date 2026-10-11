import { runV21Upgrade } from '../testing';

const KBQ_THEME = '`KbqTheme` was renamed to `KbqThemeConfig`';
const THEME_SERVICE = '`ThemeService` was removed';
const OPTION_SCROLL_POSITION = '`getOptionScrollPosition()` was removed';
const THEME_PALETTE = '`ThemePalette` was removed';
const POSITIONS = 'The pop-up position lists';
const SELECT_SCROLL_PROVIDER = '`KBQ_SELECT_SCROLL_STRATEGY_PROVIDER` was removed';
const CHECKABLE_ACCESSOR = '`KBQ_CHECKABLE_CONTROL_VALUE_ACCESSOR` is no longer exported';
const HOVER = '`KbqHover` was removed';
const CAN_COLOR = '`CanColor` was removed';
const ANIMATION_ENUMS = '`KbqAnimationCurves` and `KbqAnimationDurations` were removed';
const NO_REPLACEMENT = '`KbqRectangleItem` (left over from the removed navbar-ic)';
const PRIVATE_MEMBERS = '`KbqPopUp.handleBodyInteraction()` was removed';
const LEGACY_DATE_PIPES = 'The unprefixed date pipes';
const MC_HIGHLIGHT = 'The `mcHighlight` pipe (`KbqHighlightPipe`) is deprecated';
const DEPRECATED_HELPERS = '`isDigit()`, `isBoolean()` and `KbqMeasureScrollbarService`';
const FOCUS_ORIGIN = '`FocusKeyManager.getFocusOrigin()` is deprecated';

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

    it('rewrites the ThemePalette members KbqComponentColors holds and swaps the specifier', async () => {
        const run = await runV21Upgrade({
            'colors.ts': [
                "import { KbqDefaultSizes, ThemePalette } from '@koobiq/components/core';",
                'export const error = ThemePalette.Error;',
                'export const states = [ThemePalette.Warning, ThemePalette.Success];',
                ''
            ].join('\n')
        });

        expect(run.read('colors.ts')).toBe(
            [
                "import { KbqDefaultSizes, KbqComponentColors } from '@koobiq/components/core';",
                'export const error = KbqComponentColors.Error;',
                'export const states = [KbqComponentColors.Warning, KbqComponentColors.Success];',
                ''
            ].join('\n')
        );
        expect(run.log).not.toContain(THEME_PALETTE);
    });

    it('replaces an import of ThemePalette alone', async () => {
        const run = await runV21Upgrade({
            'error.ts': [
                "import { ThemePalette } from '@koobiq/components/core';",
                'export const color = ThemePalette.Error;',
                ''
            ].join('\n')
        });

        expect(run.read('error.ts')).toBe(
            [
                "import { KbqComponentColors } from '@koobiq/components/core';",
                'export const color = KbqComponentColors.Error;',
                ''
            ].join('\n')
        );
    });

    it('keeps ThemePalette and reports the uses it cannot rewrite', async () => {
        const run = await runV21Upgrade({
            'palette.ts': [
                "import { ThemePalette } from '@koobiq/components/core';",
                'export class App {',
                '    readonly palette = ThemePalette;',
                '    color: ThemePalette = ThemePalette.Primary;',
                '    error = ThemePalette.Error;',
                '}',
                ''
            ].join('\n')
        });

        expect(run.read('palette.ts')).toBe(
            [
                "import { ThemePalette, KbqComponentColors } from '@koobiq/components/core';",
                'export class App {',
                '    readonly palette = ThemePalette;',
                '    color: ThemePalette = ThemePalette.Primary;',
                '    error = KbqComponentColors.Error;',
                '}',
                ''
            ].join('\n')
        );
        expect(run.log).toContain(`palette.ts\n  ${THEME_PALETTE}`);
    });

    it("leaves an app's own ThemePalette alone", async () => {
        const source = [
            "import { KbqComponentColors } from '@koobiq/components/core';",
            "import { ThemePalette } from './palette';",
            'export const colors = [KbqComponentColors.Error, ThemePalette.Error, ThemePalette.Primary];',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'own.ts': source });

        expect(run.read('own.ts')).toBe(source);
        expect(run.log).not.toContain('own.ts');
    });

    it('reports each removed undocumented export imported from the library', async () => {
        const cases: [string, string, string][] = [
            ['positions.ts', 'POSITION_MAP, TOP_POSITION_PRIORITY, NUMBER_FORMAT_REGEXP', POSITIONS],
            ['scroll.ts', 'KBQ_SELECT_SCROLL_STRATEGY_PROVIDER', SELECT_SCROLL_PROVIDER],
            ['checkable.ts', 'KBQ_CHECKABLE_CONTROL_VALUE_ACCESSOR', CHECKABLE_ACCESSOR],
            ['hover.ts', 'KbqHover', HOVER],
            ['color.ts', 'type CanColor', CAN_COLOR],
            ['animation.ts', 'KbqAnimationCurves, KbqAnimationDurations', ANIMATION_ENUMS],
            ['rectangle.ts', 'KbqRectangleItem, countGroupLabelsBeforeOption', NO_REPLACEMENT]
        ];
        const run = await runV21Upgrade(
            Object.fromEntries(
                cases.map(([file, specifiers]) => [file, `import { ${specifiers} } from '@koobiq/components/core';\n`])
            )
        );

        for (const [file, , message] of cases) {
            expect(run.log).toContain(`${file}\n  ${message}`);
        }
    });

    it('reports the removed pop-up member and the private members of the number pipes', async () => {
        const run = await runV21Upgrade({
            'members.ts': [
                'export const close = (tooltip: any) => tooltip.handleBodyInteraction();',
                'export const options = (pipe: any) => pipe.roundingOptions;',
                ''
            ].join('\n')
        });

        expect(run.log).toContain(`members.ts\n  ${PRIVATE_MEMBERS}`);
    });

    it('rewrites the mcLine alias to kbq-line in templates and selectors', async () => {
        const run = await runV21Upgrade({
            'item.html': '<kbq-list-item><span mcLine>Title</span><span kbq-line>Subtitle</span></kbq-list-item>\n',
            'query.ts': "export const lines = (host: Element) => host.querySelectorAll('[mcLine]');\n"
        });

        expect(run.read('item.html')).toBe(
            '<kbq-list-item><span kbq-line>Title</span><span kbq-line>Subtitle</span></kbq-list-item>\n'
        );
        expect(run.read('query.ts')).toBe(
            "export const lines = (host: Element) => host.querySelectorAll('[kbq-line]');\n"
        );
    });

    it('reports the core API deprecated for removal in 22.0.0', async () => {
        const run = await runV21Upgrade({
            'date.html': '<span>{{ created | absoluteLongDate }} {{ range | rangeShortDateImpurePipe }}</span>\n',
            'date.ts': "import { DurationLongFormatterPipe } from '@koobiq/components/core';\n",
            'highlight.html': '<span [innerHTML]="item | mcHighlight: query"></span>\n',
            'helpers.ts': "import { isBoolean, KbqMeasureScrollbarService } from '@koobiq/components/core';\n",
            'keys.ts': 'export const origin = (manager: any) => manager.getFocusOrigin();\n'
        });

        expect(run.log).toContain(`date.html\n  ${LEGACY_DATE_PIPES}`);
        expect(run.log).toContain(`date.ts\n  ${LEGACY_DATE_PIPES}`);
        expect(run.log).toContain(`highlight.html\n  ${MC_HIGHLIGHT}`);
        expect(run.log).toContain(`helpers.ts\n  ${DEPRECATED_HELPERS}`);
        expect(run.log).toContain(`keys.ts\n  ${FOCUS_ORIGIN}`);
    });

    it('leaves the kbq date and highlight pipes and a logical or alone', async () => {
        const template =
            '<span>{{ created | kbqAbsoluteLongDate }} {{ item | kbqHighlightBold: query }} {{ a || durationLong }}</span>\n';
        const source =
            "import { BaseLocaleAwareFormatterPipe, KbqHighlightBoldPipe } from '@koobiq/components/core';\n";
        const run = await runV21Upgrade({ 'kbq.html': template, 'kbq.ts': source });

        expect(run.read('kbq.html')).toBe(template);
        expect(run.log).not.toContain('kbq.html');
        expect(run.log).not.toContain('kbq.ts');
    });

    it("leaves an app's own exports of the removed names alone", async () => {
        const source = [
            "import { KbqHover, POSITION_MAP } from './overlay';",
            "import { KbqComponentColors } from '@koobiq/components/core';",
            'export const mcLineCount = 2;',
            'export const colors = [KbqHover, POSITION_MAP, KbqComponentColors.Error];',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'own-exports.ts': source });

        expect(run.read('own-exports.ts')).toBe(source);
        expect(run.log).not.toContain('own-exports.ts');
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
