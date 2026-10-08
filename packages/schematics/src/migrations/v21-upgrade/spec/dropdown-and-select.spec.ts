import { runV21Upgrade } from '../testing';

const DROPDOWN_TRIGGER_WIDTH = '`KbqDropdown.triggerWidth` was removed';
const PANEL_TRIGGER_WIDTH = '`KbqDropdownPanel.triggerWidth` was removed';
const OFFSET_Y = '`offsetY` was removed from `KbqSelect`';
const PANEL_HEIGHT = '`AUTOCOMPLETE_PANEL_HEIGHT` was removed';

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
});
