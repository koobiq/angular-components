import { runV21Upgrade } from '../testing';

const KBQ_THEME = '`KbqTheme` was renamed to `KbqThemeConfig`';
const THEME_SERVICE = '`ThemeService` was removed';
const OPTION_SCROLL_POSITION = '`getOptionScrollPosition()` was removed';
const THEME_PALETTE = '`ThemePalette` was removed';
const THEME_PALETTE_REEXPORT = 'A re-export of `ThemePalette` from `@koobiq/components/core` is left as is';
const POSITIONS = 'The pop-up position lists';
const SELECT_SCROLL_PROVIDER = '`KBQ_SELECT_SCROLL_STRATEGY_PROVIDER` was removed';
const CHECKABLE_ACCESSOR = '`KBQ_CHECKABLE_CONTROL_VALUE_ACCESSOR` is no longer exported';
const HOVER = '`KbqHover` was removed';
const CAN_COLOR = '`CanColor` was removed';
const ANIMATION_ENUMS = '`KbqAnimationCurves` and `KbqAnimationDurations` were removed';
const NO_REPLACEMENT = '`KbqRectangleItem` (left over from the removed navbar-ic)';
const PRIVATE_MEMBERS = '`KbqPopUp.handleBodyInteraction()` was removed';
const POP_UP_MEMBERS = '`KbqPopUp.markForCheck()`, `warning` and the protected `closeOnInteraction` were removed';
const POP_UP_ELEMENT_REF = '`KbqPopUp.elementRef` is a protected getter';
const FORM_ELEMENT_ROW = '`KbqFormElement.isRow` was removed';
const LEGACY_DATE_PIPES = 'The unprefixed date pipes';
const MC_HIGHLIGHT = 'The `mcHighlight` pipe (`KbqHighlightPipe`) is deprecated';
const DEPRECATED_HELPERS = '`isDigit()`, `isBoolean()` and `KbqMeasureScrollbarService`';
const LINE_SETTER = '`KbqLineSetter` was removed';
const LINE_CLASSES = 'A list item no longer gets the `kbq-2-line`';
const FOCUS_ORIGIN = '`FocusKeyManager.getFocusOrigin()` is deprecated';
const DATE_INPUT = '`dateInput` of the datepicker locale configuration is deprecated';

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

    it('removes the ThemePalette specifier from any place in its clause', async () => {
        const from = " from '@koobiq/components/core';\n";
        const cases: [string, string][] = [
            ['import { ThemePalette, KbqDefaultSizes }', 'import { KbqDefaultSizes }'],
            [
                'import { KbqDefaultSizes, ThemePalette, kbqThemeProvider }',
                'import { KbqDefaultSizes, kbqThemeProvider }'
            ],
            ['import { KbqDefaultSizes, ThemePalette }', 'import { KbqDefaultSizes }'],
            ['import type { ThemePalette, KbqDefaultSizes }', 'import type { KbqDefaultSizes }'],
            ['import { type ThemePalette, KbqDefaultSizes }', 'import { KbqDefaultSizes }'],
            ['import { KbqDefaultSizes, type ThemePalette }', 'import { KbqDefaultSizes }'],
            ['import {\n    ThemePalette,\n    KbqDefaultSizes,\n}', 'import {\n    KbqDefaultSizes,\n}'],
            ['import {\n    KbqDefaultSizes,\n    ThemePalette,\n}', 'import {\n    KbqDefaultSizes,\n}'],
            ['import {\n    KbqDefaultSizes,\n    ThemePalette\n}', 'import {\n    KbqDefaultSizes\n}']
        ];
        const files = Object.fromEntries(
            cases.map(([clause], i) => [`clause-${i}.ts`, `${clause}${from}export type Size = KbqDefaultSizes;\n`])
        );
        const run = await runV21Upgrade({
            ...files,
            'only.ts': "import type { ThemePalette } from '@koobiq/components/core';\nexport type Size = 'small';\n"
        });

        cases.forEach(([, clause], i) =>
            expect(run.read(`clause-${i}.ts`)).toBe(`${clause}${from}export type Size = KbqDefaultSizes;\n`)
        );
        expect(run.read('only.ts')).toBe("export type Size = 'small';\n");
    });

    it('adds KbqComponentColors to a clause that ended in a comma', async () => {
        const run = await runV21Upgrade({
            'trailing.ts': [
                'import {',
                '    KbqDefaultSizes,',
                '    ThemePalette,',
                "} from '@koobiq/components/core';",
                'export const color = ThemePalette.Error;',
                ''
            ].join('\n')
        });

        expect(run.read('trailing.ts')).toBe(
            [
                'import {',
                "    KbqDefaultSizes, KbqComponentColors } from '@koobiq/components/core';",
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

    it('keeps and reports a re-export of ThemePalette', async () => {
        const from = " from '@koobiq/components/core';\n";
        const barrels = [
            `export { ThemePalette }${from}`,
            `export type { KbqDefaultSizes, ThemePalette }${from}`,
            `export {\n    ThemePalette as Palette,\n    KbqDefaultSizes\n}${from}`
        ];
        const run = await runV21Upgrade(Object.fromEntries(barrels.map((source, i) => [`barrel-${i}.ts`, source])));

        barrels.forEach((source, i) => {
            expect(run.read(`barrel-${i}.ts`)).toBe(source);
            expect(run.log).toContain(`barrel-${i}.ts\n  ${THEME_PALETTE_REEXPORT}`);
        });
        expect(run.log).not.toContain(THEME_PALETTE);
    });

    it('drops the import of ThemePalette and keeps its re-export', async () => {
        const run = await runV21Upgrade({
            'mixed.ts': [
                "export { ThemePalette } from '@koobiq/components/core';",
                "import { ThemePalette } from '@koobiq/components/core';",
                'export const color = ThemePalette.Error;',
                ''
            ].join('\n')
        });

        expect(run.read('mixed.ts')).toBe(
            [
                "import { KbqComponentColors } from '@koobiq/components/core';",
                "export { ThemePalette } from '@koobiq/components/core';",
                'export const color = KbqComponentColors.Error;',
                ''
            ].join('\n')
        );
        expect(run.log).toContain(`mixed.ts\n  ${THEME_PALETTE_REEXPORT}`);
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

    it('reports the removed pop-up members used by a subclass of a pop-up or its trigger', async () => {
        const run = await runV21Upgrade({
            'trigger.ts': [
                "import { KbqTooltipTrigger } from '@koobiq/components/tooltip';",
                'export class HintTrigger extends KbqTooltipTrigger {',
                '    override updateClassMap(placement = this.placement) {',
                '        super.updateClassMap(placement);',
                '        this.instance?.markForCheck();',
                '    }',
                '}',
                ''
            ].join('\n'),
            'pop-up.ts': [
                "import { KbqPopUp } from '@koobiq/components/core';",
                'export abstract class Panel extends KbqPopUp {',
                '    refresh() { if (this.warning) this.markForCheck(); }',
                '}',
                ''
            ].join('\n'),
            'popover.ts': [
                "import { KbqPopoverComponent } from '@koobiq/components/popover';",
                'export class Hint extends KbqPopoverComponent {',
                '    protected override closeOnInteraction = false;',
                '}',
                ''
            ].join('\n')
        });

        expect(run.log).toContain(`trigger.ts\n  ${POP_UP_MEMBERS}`);
        expect(run.log).toContain(`pop-up.ts\n  ${POP_UP_MEMBERS}`);
        expect(run.log).toContain(`popover.ts\n  ${POP_UP_MEMBERS}`);
    });

    it('leaves markForCheck() of a change detector alone, in a pop-up subclass too', async () => {
        const run = await runV21Upgrade({
            'component.ts': [
                "import { ChangeDetectorRef, Component, inject } from '@angular/core';",
                "@Component({ template: '' })",
                'export class App {',
                '    private readonly cdr = inject(ChangeDetectorRef);',
                '    warning = false;',
                '    markForCheck() { this.cdr.markForCheck(); }',
                '    warn() { this.warning = true; this.markForCheck(); }',
                '}',
                ''
            ].join('\n'),
            'tooltip.ts': [
                "import { KbqTooltipComponent } from '@koobiq/components/tooltip';",
                'export class Hint extends KbqTooltipComponent {',
                "    warningText = '';",
                '    warn(text: string) { this.warningText = text; this.changeDetectorRef.markForCheck(); }',
                '}',
                ''
            ].join('\n')
        });

        expect(run.log).not.toContain(POP_UP_MEMBERS);
    });

    it('reports elementRef re-declared as a field by a subclass of a pop-up', async () => {
        const files = {
            'decorator.ts': [
                "import { ElementRef, ViewChild } from '@angular/core';",
                "import { KbqPopUp } from '@koobiq/components/core';",
                'export abstract class Panel extends KbqPopUp {',
                "    @ViewChild('panel') elementRef: ElementRef;",
                '}',
                ''
            ].join('\n'),
            'separate-line.ts': [
                "import { ElementRef, ViewChild } from '@angular/core';",
                "import { KbqTooltipComponent } from '@koobiq/components/tooltip';",
                'export class Hint extends KbqTooltipComponent {',
                "    @ViewChild('tooltip', { static: true })",
                '    override elementRef!: ElementRef<HTMLElement>;',
                '}',
                ''
            ].join('\n'),
            'initializer.ts': [
                "import { ElementRef, inject } from '@angular/core';",
                "import { KbqPopoverComponent } from '@koobiq/components/popover';",
                'export class Hint extends KbqPopoverComponent {',
                '    protected override readonly elementRef = inject(ElementRef);',
                '}',
                ''
            ].join('\n'),
            'parameter.ts': [
                "import { ElementRef } from '@angular/core';",
                "import { KbqNotificationCenterComponent } from '@koobiq/components/notification-center';",
                'export class Center extends KbqNotificationCenterComponent {',
                '    constructor(protected elementRef: ElementRef) {',
                '        super();',
                '    }',
                '}',
                ''
            ].join('\n')
        };
        const run = await runV21Upgrade(files);

        for (const file of Object.keys(files)) {
            expect(run.log).toContain(`${file}\n  ${POP_UP_ELEMENT_REF}`);
        }
    });

    it('leaves elementRef alone when a pop-up subclass reads or overrides the getter, and in a trigger', async () => {
        const run = await runV21Upgrade({
            'getter.ts': [
                "import { ElementRef, viewChild } from '@angular/core';",
                "import { KbqPopUp } from '@koobiq/components/core';",
                'export abstract class Panel extends KbqPopUp {',
                "    private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');",
                '    override get elementRef(): ElementRef<HTMLElement> {',
                '        return this.panel();',
                '    }',
                '    measure(elementRef: ElementRef) {',
                '        const host = this.elementRef.nativeElement;',
                '        return elementRef.nativeElement === host;',
                '    }',
                '}',
                ''
            ].join('\n'),
            'trigger.ts': [
                "import { ElementRef, inject } from '@angular/core';",
                "import { KbqTooltipTrigger } from '@koobiq/components/tooltip';",
                'export class HintTrigger extends KbqTooltipTrigger {',
                '    protected override readonly elementRef = inject(ElementRef);',
                '}',
                ''
            ].join('\n')
        });

        expect(run.log).not.toContain(POP_UP_ELEMENT_REF);
    });

    it('reports isRow read from a form element', async () => {
        const run = await runV21Upgrade({
            'form.html': '<div class="kbq-form__row" #row="kbqFormElement">{{ row.isRow ? "row" : "" }}</div>\n',
            'form.ts': [
                "import { KbqFormElement } from '@koobiq/components/core';",
                'export const isRow = (element: KbqFormElement) => element.isRow;',
                ''
            ].join('\n')
        });

        expect(run.log).toContain(`form.html\n  ${FORM_ELEMENT_ROW}`);
        expect(run.log).toContain(`form.ts\n  ${FORM_ELEMENT_ROW}`);
    });

    it('leaves isRow of other classes and the other form element members alone', async () => {
        const run = await runV21Upgrade({
            'grid.ts': 'export const isRow = (cell: { isRow: boolean }) => cell.isRow;\n',
            'fieldset.ts': [
                "import { KbqFormElement } from '@koobiq/components/core';",
                'export const state = (table: any, element: KbqFormElement) => [table.isRowSelected, element.isFieldSet];',
                ''
            ].join('\n')
        });

        expect(run.log).not.toContain(FORM_ELEMENT_ROW);
    });

    it('rewrites the mcLine and mcListIcon aliases in templates and selectors', async () => {
        const run = await runV21Upgrade({
            'item.html':
                '<kbq-list-item><i kbq-icon="kbq-bell_16" mcListIcon></i><span mcLine>Title</span>' +
                '<span kbq-line>Subtitle</span></kbq-list-item>\n',
            'query.ts': "export const lines = (host: Element) => host.querySelectorAll('[mcLine]');\n"
        });

        expect(run.read('item.html')).toBe(
            '<kbq-list-item><i kbq-icon="kbq-bell_16" kbq-list-icon></i><span kbq-line>Title</span>' +
                '<span kbq-line>Subtitle</span></kbq-list-item>\n'
        );
        expect(run.read('query.ts')).toBe(
            "export const lines = (host: Element) => host.querySelectorAll('[kbq-line]');\n"
        );
    });

    it('leaves mcLine and mcListIcon in code and in inline styles alone', async () => {
        const run = await runV21Upgrade({
            'line.ts': [
                "import { Component } from '@angular/core';",
                '',
                '@Component({',
                '    template: \'<span class="title" mcLine>Title</span>\',',
                "    styles: ['.mcLine { color: red; }', '[mcListIcon] { margin: 0; }']",
                '})',
                'export class Line {',
                '    mcLine = 1;',
                '    readonly mcListIcon = this.mcLine + 1;',
                '}',
                ''
            ].join('\n')
        });

        expect(run.read('line.ts')).toBe(
            [
                "import { Component } from '@angular/core';",
                '',
                '@Component({',
                '    template: \'<span class="title" kbq-line>Title</span>\',',
                "    styles: ['.mcLine { color: red; }', '[kbq-list-icon] { margin: 0; }']",
                '})',
                'export class Line {',
                '    mcLine = 1;',
                '    readonly mcListIcon = this.mcLine + 1;',
                '}',
                ''
            ].join('\n')
        );
    });

    it('rewrites the mcLine and mcListIcon attribute selectors in stylesheets', async () => {
        const unrelated = ['$mcLine: 1px;', '.mcLine { margin: $mcLine; }', '[data-mcLine] { margin: 0; }', ''];
        const run = await runV21Upgrade({
            'list.scss': [
                '.my-list [mcLine] { color: red; }',
                '.my-list [ mcListIcon ], [mcline]:first-child { margin: 0; }',
                ...unrelated
            ].join('\n'),
            'list.css': '.my-list [mcLine=""] + [MCLISTICON] { color: red; }\n'
        });

        expect(run.read('list.scss')).toBe(
            [
                '.my-list [kbq-line] { color: red; }',
                '.my-list [ kbq-list-icon ], [kbq-line]:first-child { margin: 0; }',
                ...unrelated
            ].join('\n')
        );
        expect(run.read('list.css')).toBe('.my-list [kbq-line=""] + [kbq-list-icon] { color: red; }\n');
    });

    it('reports KbqLineSetter and the line count classes of a list item', async () => {
        const run = await runV21Upgrade({
            'setter.ts': "import { KbqLine, KbqLineSetter } from '@koobiq/components/core';\n",
            'lines.scss': '.kbq-list-item.kbq-2-line { height: 56px; }\n'
        });

        expect(run.log).toContain(`setter.ts\n  ${LINE_SETTER}`);
        expect(run.log).toContain(`lines.scss\n  ${LINE_CLASSES}`);
    });

    it('reports the core API deprecated for removal in 22.0.0', async () => {
        const run = await runV21Upgrade({
            'date.html': '<span>{{ created | absoluteLongDate }} {{ range | rangeShortDateImpurePipe }}</span>\n',
            'date.ts': "import { DurationLongFormatterPipe } from '@koobiq/components/core';\n",
            'highlight.html': '<span [innerHTML]="item | mcHighlight: query"></span>\n',
            'helpers.ts': "import { isBoolean, KbqMeasureScrollbarService } from '@koobiq/components/core';\n",
            'keys.ts': 'export const origin = (manager: any) => manager.getFocusOrigin();\n',
            'locale.ts':
                "export const locale = { datepicker: { placeholder: 'дд.мм.гггг', dateInput: 'dd.MM.yyyy' } };\n",
            'provider.ts':
                "export const provider = { provide: TOKEN, useValue: { dateInput: 'yyyy-MM-dd', placeholder: 'гггг' } };\n",
            'read.ts': 'export const format = (locale: any) => locale.datepicker?.dateInput;\n'
        });

        expect(run.log).toContain(`date.html\n  ${LEGACY_DATE_PIPES}`);
        expect(run.log).toContain(`date.ts\n  ${LEGACY_DATE_PIPES}`);
        expect(run.log).toContain(`highlight.html\n  ${MC_HIGHLIGHT}`);
        expect(run.log).toContain(`helpers.ts\n  ${DEPRECATED_HELPERS}`);
        expect(run.log).toContain(`keys.ts\n  ${FOCUS_ORIGIN}`);
        expect(run.log).toContain(`locale.ts\n  ${DATE_INPUT}`);
        expect(run.log).toContain(`provider.ts\n  ${DATE_INPUT}`);
        expect(run.log).toContain(`read.ts\n  ${DATE_INPUT}`);
    });

    it('leaves the date formats and the dateInput output of the datepicker alone', async () => {
        const run = await runV21Upgrade({
            'formats.ts': "export const formats = { dateInput: 'yyyy-MM-dd', monthYearLabel: 'LLL yyyy' };\n",
            'input.html': '<input [kbqDatepicker]="picker" placeholder="Date" (dateInput)="onInput($event)" />\n'
        });

        expect(run.log).not.toContain(DATE_INPUT);
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
