import { runV21Upgrade } from '../testing';

const IS_USER_INPUT = '`KbqTreeOptionChange.isUserInput` was removed';
const CONSTRUCTOR = '`KbqTreeOptionChange` takes only the option now';

describe('v21-upgrade: tree', () => {
    it('reports isUserInput read from a KbqTreeOptionChange', async () => {
        const source = [
            "import { KbqTreeOptionChange } from '@koobiq/components/tree';",
            'export class App {',
            '    onChange(event: KbqTreeOptionChange) {',
            '        if (event.isUserInput) console.log(event.source);',
            '    }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'tree.ts': source });

        expect(run.read('tree.ts')).toBe(source);
        expect(run.log).toContain(IS_USER_INPUT);
        expect(run.log).not.toContain(CONSTRUCTOR);
    });

    it('reports $event.isUserInput bound to a tree option output', async () => {
        const template = [
            '<kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">',
            '    <kbq-tree-option',
            '        *kbqTreeNodeDef="let node"',
            '        kbqTreeNodePadding',
            '        (onSelectionChange)="onChange($event.isUserInput)"',
            '    >',
            '        {{ treeControl.getViewValue(node) }}',
            '    </kbq-tree-option>',
            '</kbq-tree-selection>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'tree.html': template });

        expect(run.read('tree.html')).toBe(template);
        expect(run.log).toContain(IS_USER_INPUT);
    });

    it('reports a second constructor argument and a subclass passing one to super', async () => {
        const created = [
            "import { KbqTreeOption, KbqTreeOptionChange } from '@koobiq/components/tree';",
            'export const change = (option: KbqTreeOption) => new KbqTreeOptionChange(option, true);',
            ''
        ].join('\n');
        const subclass = [
            "import { KbqTreeOption, KbqTreeOptionChange } from '@koobiq/components/tree';",
            'export class CustomChange extends KbqTreeOptionChange {',
            '    constructor(option: KbqTreeOption, readonly user: boolean) {',
            '        super(option, user);',
            '    }',
            '}',
            ''
        ].join('\n');
        const first = await runV21Upgrade({ 'created.ts': created });
        const second = await runV21Upgrade({ 'subclass.ts': subclass });

        expect(first.read('created.ts')).toBe(created);
        expect(first.log).toContain(CONSTRUCTOR);
        expect(second.read('subclass.ts')).toBe(subclass);
        expect(second.log).toContain(CONSTRUCTOR);
    });

    it('leaves the select, tree-select and single-argument tree option changes alone', async () => {
        const select = [
            "import { KbqOptionSelectionChange } from '@koobiq/components/core';",
            "import { KbqSelect } from '@koobiq/components/select';",
            'export class App {',
            '    readonly select = viewChild.required(KbqSelect);',
            '    onChange(event: KbqOptionSelectionChange) { return event.isUserInput; }',
            '}',
            ''
        ].join('\n');
        const treeSelect = [
            "import { KbqTreeOption, KbqTreeOptionChange } from '@koobiq/components/tree';",
            "import { KbqTreeSelectChange } from '@koobiq/components/tree-select';",
            '@Component({',
            '    template: `',
            '        <kbq-tree-select (selectionChange)="onChange($event.isUserInput)">',
            '            <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">',
            '                <kbq-tree-option *kbqTreeNodeDef="let node" (selectionChange)="log($event.source)" />',
            '            </kbq-tree-selection>',
            '        </kbq-tree-select>',
            '    `',
            '})',
            'export class App {',
            '    emit(option: KbqTreeOption) { return new KbqTreeOptionChange(pick(option, 1)); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'select.ts': select, 'tree-select.ts': treeSelect });

        expect(run.read('select.ts')).toBe(select);
        expect(run.read('tree-select.ts')).toBe(treeSelect);
        expect(run.log).not.toContain(IS_USER_INPUT);
        expect(run.log).not.toContain(CONSTRUCTOR);
    });
});
