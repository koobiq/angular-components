import { runV21Upgrade } from '../testing';

const DROPDOWN_TRIGGER_WIDTH = '`KbqDropdown.triggerWidth` was removed';
const PANEL_TRIGGER_WIDTH = '`KbqDropdownPanel.triggerWidth` was removed';
const OFFSET_Y = '`offsetY` was removed from `KbqSelect`';
const PANEL_HEIGHT = '`AUTOCOMPLETE_PANEL_HEIGHT` was removed';
const POSITION = '`DropdownPositionX` and `DropdownPositionY` were removed';
const PANEL_WIDTH = '`KbqSelectPanelWidth` and `KbqTreeSelectPanelWidth` were removed';
const CLEAR_VALUE = '`clearValue()` was removed from `KbqSelect`';
const GROUP_HEADER_SMALL = 'The `kbq-dropdown__group-header_small` modifier was removed';

describe('v21-upgrade: dropdown-and-select', () => {
    it('reports triggerWidth set on a KbqDropdown query', async () => {
        const source = [
            "import { KbqDropdown } from '@koobiq/components/dropdown';",
            'export class App {',
            '    readonly dropdown = viewChild.required(KbqDropdown);',
            "    constructor() { afterNextRender(() => (this.dropdown().triggerWidth = '200px')); }",
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'dropdown.ts': source });

        expect(run.read('dropdown.ts')).toBe(source);
        expect(run.log).toContain(DROPDOWN_TRIGGER_WIDTH);
    });

    it('reports triggerWidth set through the exportAs template reference', async () => {
        const template = [
            '<button [kbqDropdownTriggerFor]="menu" (click)="menu.triggerWidth = \'200px\'">Open</button>',
            '<kbq-dropdown #menu="kbqDropdown"></kbq-dropdown>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'dropdown.html': template });

        expect(run.read('dropdown.html')).toBe(template);
        expect(run.log).toContain(DROPDOWN_TRIGGER_WIDTH);
    });

    it('reports triggerWidth declared by a custom dropdown panel', async () => {
        const source = [
            "import { KbqDropdownPanel } from '@koobiq/components/dropdown';",
            'export abstract class CustomPanel implements KbqDropdownPanel {',
            "    triggerWidth = '';",
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'panel.ts': source });

        expect(run.read('panel.ts')).toBe(source);
        expect(run.log).toContain(PANEL_TRIGGER_WIDTH);
        expect(run.log).not.toContain(DROPDOWN_TRIGGER_WIDTH);
    });

    it('reports offsetY set on a KbqSelect query', async () => {
        const source = [
            "import { KbqSelect } from '@koobiq/components/select';",
            'export class App {',
            '    readonly select = viewChild.required(KbqSelect);',
            '    constructor() { afterNextRender(() => (this.select().offsetY = 8)); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'select.ts': source });

        expect(run.read('select.ts')).toBe(source);
        expect(run.log).toContain(OFFSET_Y);
    });

    it('reports offsetY read through a tree-select template reference', async () => {
        const template = [
            '<kbq-tree-select #treeSelect="kbqTreeSelect"></kbq-tree-select>',
            '<span>{{ treeSelect.offsetY }}</span>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'tree-select.html': template });

        expect(run.read('tree-select.html')).toBe(template);
        expect(run.log).toContain(OFFSET_Y);
    });

    it('reports offsetY overridden by a KbqTimezoneSelect subclass', async () => {
        const source = [
            "import { KbqTimezoneSelect } from '@koobiq/components/timezone';",
            'export class CustomTimezoneSelect extends KbqTimezoneSelect {',
            '    public override offsetY = 8;',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'timezone.ts': source });

        expect(run.read('timezone.ts')).toBe(source);
        expect(run.log).toContain(OFFSET_Y);
    });

    it('reports an AUTOCOMPLETE_PANEL_HEIGHT import', async () => {
        const source = [
            "import { AUTOCOMPLETE_PANEL_HEIGHT } from '@koobiq/components/autocomplete';",
            'export const maxHeight = AUTOCOMPLETE_PANEL_HEIGHT;',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'autocomplete.ts': source });

        expect(run.read('autocomplete.ts')).toBe(source);
        expect(run.log).toContain(PANEL_HEIGHT);
    });

    it('leaves the dropdown trigger offsetY, overlay positions, own names and files without the owners alone', async () => {
        const owners = [
            "import { ConnectedPosition } from '@angular/cdk/overlay';",
            "import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';",
            "import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';",
            "import { KbqSelectModule } from '@koobiq/components/select';",
            'export const MY_AUTOCOMPLETE_PANEL_HEIGHT = 320;',
            'export class App {',
            '    readonly trigger = viewChild.required(KbqDropdownTrigger);',
            '    readonly positions: ConnectedPosition[] = [',
            "        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 }",
            '    ];',
            '    get gap() { return this.trigger().offsetY(); }',
            '    width(el: HTMLElement) { const triggerWidth = el.offsetWidth; return triggerWidth; }',
            '}',
            ''
        ].join('\n');
        const template = [
            '<button [kbqDropdownTriggerFor]="menu" [offsetY]="4">Open</button>',
            '<kbq-dropdown #menu="kbqDropdown"></kbq-dropdown>',
            '<kbq-select></kbq-select>',
            ''
        ].join('\n');
        const elsewhere = [
            'export function shift(position: { offsetY?: number }, panel: { triggerWidth?: string }) {',
            '    position.offsetY = 4;',
            "    panel.triggerWidth = '';",
            '    return AUTOCOMPLETE_PANEL_HEIGHT;',
            '}',
            'const AUTOCOMPLETE_PANEL_HEIGHT = 256;',
            ''
        ].join('\n');
        const subclass = [
            "import { KbqSelect } from '@koobiq/components/select';",
            'export class CustomSelect extends KbqSelect {',
            '    override positions = [',
            '        {',
            "            originX: 'start',",
            "            originY: 'bottom',",
            "            overlayX: 'start',",
            "            overlayY: 'top',",
            '            offsetY: 4',
            '        }',
            '    ];',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({
            'owners.ts': owners,
            'owners.html': template,
            'elsewhere.ts': elsewhere,
            'subclass.ts': subclass
        });

        expect(run.read('owners.ts')).toBe(owners);
        expect(run.read('owners.html')).toBe(template);
        expect(run.read('elsewhere.ts')).toBe(elsewhere);
        expect(run.read('subclass.ts')).toBe(subclass);

        for (const message of [DROPDOWN_TRIGGER_WIDTH, PANEL_TRIGGER_WIDTH, OFFSET_Y, PANEL_HEIGHT]) {
            expect(run.log).not.toContain(message);
        }
    });

    it('renames DropdownPositionX / DropdownPositionY in a file that uses the dropdown', async () => {
        const run = await runV21Upgrade({
            'position.ts': [
                "import { DropdownPositionX, DropdownPositionY, KbqDropdown } from '@koobiq/components/dropdown';",
                "export const x: DropdownPositionX = 'before';",
                "export const y: DropdownPositionY = 'below';",
                'export type Panel = KbqDropdown;',
                ''
            ].join('\n'),
            'both.ts': [
                'import {',
                '    DropdownPositionX,',
                '    KbqDropdownPositionX,',
                '    KbqDropdownTrigger',
                "} from '@koobiq/components/dropdown';",
                "export const positions: [DropdownPositionX, KbqDropdownPositionX] = ['before', 'after'];",
                'export type Trigger = KbqDropdownTrigger;',
                ''
            ].join('\n')
        });

        expect(run.read('position.ts')).toBe(
            [
                "import { KbqDropdownPositionX, KbqDropdownPositionY, KbqDropdown } from '@koobiq/components/dropdown';",
                "export const x: KbqDropdownPositionX = 'before';",
                "export const y: KbqDropdownPositionY = 'below';",
                'export type Panel = KbqDropdown;',
                ''
            ].join('\n')
        );
        expect(run.read('both.ts')).toBe(
            [
                'import {',
                '    KbqDropdownPositionX,',
                '    KbqDropdownTrigger',
                "} from '@koobiq/components/dropdown';",
                "export const positions: [KbqDropdownPositionX, KbqDropdownPositionX] = ['before', 'after'];",
                'export type Trigger = KbqDropdownTrigger;',
                ''
            ].join('\n')
        );
        expect(run.log).not.toContain(POSITION);
    });

    it('reports DropdownPositionX in a file that does not name the dropdown', async () => {
        const source = [
            "import { DropdownPositionX } from './shared';",
            "export const x: DropdownPositionX = 'before';",
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'reexported.ts': source });

        expect(run.read('reexported.ts')).toBe(source);
        expect(run.log).toContain(POSITION);
    });

    it('moves KbqSelectPanelWidth and KbqTreeSelectPanelWidth to KbqPanelWidth of the core', async () => {
        const run = await runV21Upgrade({
            'select.ts': [
                "import { KbqSelectModule, KbqSelectPanelWidth } from '@koobiq/components/select';",
                'export class App {',
                "    panelWidth: KbqSelectPanelWidth = 'auto';",
                '}',
                ''
            ].join('\n'),
            'tree-select.ts': [
                "import { KbqOption } from '@koobiq/components/core';",
                "import { KbqTreeSelectPanelWidth } from '@koobiq/components/tree-select';",
                'export const width: KbqTreeSelectPanelWidth = 200;',
                'export type Option = KbqOption;',
                ''
            ].join('\n'),
            'both.ts': [
                "import { KbqPanelWidth } from '@koobiq/components/core';",
                "import { KbqSelectPanelWidth } from '@koobiq/components/select';",
                "import { KbqTreeSelect, KbqTreeSelectPanelWidth } from '@koobiq/components/tree-select';",
                'export type Widths = [KbqPanelWidth, KbqSelectPanelWidth, KbqTreeSelectPanelWidth];',
                'export type Select = KbqTreeSelect;',
                ''
            ].join('\n')
        });

        expect(run.read('select.ts')).toBe(
            [
                "import { KbqPanelWidth } from '@koobiq/components/core';",
                "import { KbqSelectModule } from '@koobiq/components/select';",
                'export class App {',
                "    panelWidth: KbqPanelWidth = 'auto';",
                '}',
                ''
            ].join('\n')
        );
        expect(run.read('tree-select.ts')).toBe(
            [
                "import { KbqOption, KbqPanelWidth } from '@koobiq/components/core';",
                'export const width: KbqPanelWidth = 200;',
                'export type Option = KbqOption;',
                ''
            ].join('\n')
        );
        expect(run.read('both.ts')).toBe(
            [
                "import { KbqPanelWidth } from '@koobiq/components/core';",
                "import { KbqTreeSelect } from '@koobiq/components/tree-select';",
                'export type Widths = [KbqPanelWidth, KbqPanelWidth, KbqPanelWidth];',
                'export type Select = KbqTreeSelect;',
                ''
            ].join('\n')
        );
        expect(run.log).not.toContain(PANEL_WIDTH);
    });

    it('removes the select panel width specifier with its type modifier from any place in its clause', async () => {
        const from = " from '@koobiq/components/select';\n";
        const cases: [string, string][] = [
            ['import { type KbqSelectPanelWidth, KbqSelectModule }', 'import { KbqSelectModule }'],
            [
                'import { KbqSelect, type KbqSelectPanelWidth, KbqSelectModule }',
                'import { KbqSelect, KbqSelectModule }'
            ],
            ['import { KbqSelectModule, type KbqSelectPanelWidth }', 'import { KbqSelectModule }'],
            ['import type { KbqSelectPanelWidth, KbqSelectChange }', 'import type { KbqSelectChange }'],
            ['import type { KbqSelectChange, KbqSelectPanelWidth }', 'import type { KbqSelectChange }'],
            ['import {\n    KbqSelectModule,\n    type KbqSelectPanelWidth,\n}', 'import {\n    KbqSelectModule,\n}']
        ];
        const files = Object.fromEntries(
            cases.map(([clause], i) => [`clause-${i}.ts`, `${clause}${from}export type Width = KbqSelectPanelWidth;\n`])
        );
        const run = await runV21Upgrade({
            ...files,
            'only.ts': `import { type KbqSelectPanelWidth }${from}export type Width = KbqSelectPanelWidth;\n`,
            'type-only.ts': `import type { KbqSelectPanelWidth }${from}export type Width = KbqSelectPanelWidth;\n`
        });
        const core = "import { KbqPanelWidth } from '@koobiq/components/core';\n";

        cases.forEach(([, clause], i) =>
            expect(run.read(`clause-${i}.ts`)).toBe(`${core}${clause}${from}export type Width = KbqPanelWidth;\n`)
        );
        expect(run.read('only.ts')).toBe(`${core}export type Width = KbqPanelWidth;\n`);
        expect(run.read('type-only.ts')).toBe(`${core}export type Width = KbqPanelWidth;\n`);
    });

    it('reports an aliased import and a re-export of a select panel width', async () => {
        const aliased = [
            "import { KbqSelectPanelWidth as Width } from '@koobiq/components/select';",
            "export const width: Width = 'auto';",
            ''
        ].join('\n');
        const reexported = ["export { KbqTreeSelectPanelWidth } from '@koobiq/components/tree-select';", ''].join('\n');
        const run = await runV21Upgrade({ 'aliased.ts': aliased, 'reexported.ts': reexported });

        expect(run.read('aliased.ts')).toBe(aliased);
        expect(run.read('reexported.ts')).toBe(reexported);
        expect(run.log).toContain(PANEL_WIDTH);
    });

    it('reports clearValue called on a select, through a reference or a query, and in a subclass', async () => {
        const template = [
            '<kbq-form-field>',
            '    <kbq-select #select [(value)]="value"></kbq-select>',
            '</kbq-form-field>',
            '<button (click)="select.clearValue($event)">Clear</button>',
            ''
        ].join('\n');
        const query = [
            "import { KbqTreeSelect } from '@koobiq/components/tree-select';",
            'export class App {',
            '    readonly select = viewChild.required(KbqTreeSelect);',
            '    reset(event: Event) { this.select().clearValue(event); }',
            '}',
            ''
        ].join('\n');
        const subclass = [
            "import { KbqSelect } from '@koobiq/components/select';",
            'export class CustomSelect extends KbqSelect {',
            '    override clearValue(event: Event) { super.clearValue(event); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'select.html': template, 'query.ts': query });
        const inherited = await runV21Upgrade({ 'subclass.ts': subclass });

        expect(run.read('select.html')).toBe(template);
        expect(run.read('query.ts')).toBe(query);
        expect(run.log.split(CLEAR_VALUE)).toHaveLength(3);
        expect(inherited.read('subclass.ts')).toBe(subclass);
        expect(inherited.log).toContain(CLEAR_VALUE);
    });

    it('reports kbq-dropdown__group-header_small in templates, styles and code', async () => {
        const template = '<div class="kbq-dropdown__group-header kbq-dropdown__group-header_small">Label</div>\n';
        const styles = '.kbq-dropdown__group-header_small {\n    color: red;\n}\n';
        const code = "export const SUBHEADING = 'kbq-dropdown__group-header kbq-dropdown__group-header_small';\n";
        const run = await runV21Upgrade({ 'menu.html': template, 'menu.scss': styles, 'menu.ts': code });

        expect(run.read('menu.html')).toBe(template);
        expect(run.read('menu.scss')).toBe(styles);
        expect(run.read('menu.ts')).toBe(code);
        expect(run.log.split(GROUP_HEADER_SMALL)).toHaveLength(4);
    });

    it('leaves the Kbq names, the form field clearValue, the group header and own names alone', async () => {
        const source = [
            "import { KbqPanelWidth } from '@koobiq/components/core';",
            "import { KbqDropdownPositionX, KbqDropdownPositionY } from '@koobiq/components/dropdown';",
            "import { KbqFormField } from '@koobiq/components/form-field';",
            "import { KbqSelect } from '@koobiq/components/select';",
            'export type MyDropdownPositionX = KbqDropdownPositionX | KbqDropdownPositionY;',
            'export type MySelectPanelWidth = KbqPanelWidth;',
            'export class App {',
            '    readonly formField = viewChild.required(KbqFormField);',
            '    readonly select = viewChild.required(KbqSelect);',
            '    clear(event: Event) { this.formField().clearValue(event); this.clearValue(); }',
            '    clearValue() {}',
            '}',
            ''
        ].join('\n');
        const template = [
            '<kbq-form-field #formField>',
            '    <kbq-select></kbq-select>',
            '    <button (click)="formField.clearValue($event)">Clear</button>',
            '</kbq-form-field>',
            '<div class="kbq-dropdown__group-header">Header</div>',
            ''
        ].join('\n');
        const own = [
            'export type DropdownPositionX = 1 | 2;',
            'export const x: DropdownPositionX = 1;',
            'export function clear(input: { clearValue(): void }) { input.clearValue(); }',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'kbq.ts': source, 'kbq.html': template, 'own.ts': own });

        expect(run.read('kbq.ts')).toBe(source);
        expect(run.read('kbq.html')).toBe(template);
        expect(run.read('own.ts')).toBe(own);

        for (const message of [PANEL_WIDTH, CLEAR_VALUE, GROUP_HEADER_SMALL]) {
            expect(run.log).not.toContain(message);
        }
    });
});
