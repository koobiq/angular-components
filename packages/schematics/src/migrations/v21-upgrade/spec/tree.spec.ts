import { runV21Upgrade } from '../testing';

const IS_USER_INPUT = '`KbqTreeOptionChange.isUserInput` was removed';
const CONSTRUCTOR = '`KbqTreeOptionChange` takes only the option now';
const SELECTION_OUTPUTS = '`onSelectAll` and `onCopy` of `KbqTreeSelection` are deprecated';
const OPTION_OUTPUT = '`KbqTreeOption.onSelectionChange` is deprecated';
const MOST_RECENT_TREE_NODE = '`KbqTreeNode.mostRecentTreeNode` is deprecated';

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

        expect(run.read('tree.html')).toBe(template.replace('(onSelectionChange)', '(selectionChange)'));
        expect(run.log).toContain(IS_USER_INPUT);
        expect(run.log).not.toContain(OPTION_OUTPUT);
    });

    it('reports $event.isUserInput after a > inside a quoted value', async () => {
        const template = [
            '<kbq-tree-option [disabled]="level > 2" (selectionChange)="onChange($event.isUserInput)">',
            '</kbq-tree-option>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'tree-quoted.html': template });

        expect(run.read('tree-quoted.html')).toBe(template);
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

    describe('outputs deprecated for removal in 22.0.0', () => {
        it('renames them on the tree selection and the tree option, in external and inline templates', async () => {
            const template = [
                '<kbq-tree-selection',
                '    *ngIf="nodes.length > 0"',
                '    [dataSource]="dataSource"',
                '    (onSelectAll)="selectAll($event)"',
                '    (onCopy) = "copy($event)"',
                '>',
                '    <kbq-tree-option *kbqTreeNodeDef="let node" (onSelectionChange)="changed($event.option)">',
                '        {{ node.name }}',
                '    </kbq-tree-option>',
                '</kbq-tree-selection>',
                ''
            ].join('\n');
            const source = [
                '@Component({',
                '    template: `<kbq-tree-selection (onCopy)="copy($event)" (onSelectAll)="all()"></kbq-tree-selection>`',
                '})',
                'export class App {}',
                ''
            ].join('\n');
            const run = await runV21Upgrade({ 'outputs.html': template, 'outputs.ts': source });

            expect(run.read('outputs.html')).toBe(
                template
                    .replace('(onSelectAll)', '(selectAllChange)')
                    .replace('(onCopy)', '(copyChange)')
                    .replace('(onSelectionChange)', '(selectionChange)')
            );
            expect(run.read('outputs.ts')).toBe(
                source.replace('(onCopy)', '(copyChange)').replace('(onSelectAll)', '(selectAllChange)')
            );
            expect(run.log).not.toContain(SELECTION_OUTPUTS);
            expect(run.log).not.toContain(OPTION_OUTPUT);
        });

        it('reports them read in code, and mostRecentTreeNode', async () => {
            const source = [
                "import { KbqTreeNode, KbqTreeOption, KbqTreeSelection } from '@koobiq/components/tree';",
                'export class App {',
                '    readonly tree = viewChild.required(KbqTreeSelection);',
                '    readonly options = viewChildren(KbqTreeOption);',
                '    init() {',
                '        this.tree().onCopy.subscribe((event) => this.copy(event));',
                '        outputToObservable(this.tree().onSelectAll).subscribe();',
                '        this.options()[0].onSelectionChange.subscribe();',
                '        return KbqTreeNode.mostRecentTreeNode;',
                '    }',
                '}',
                ''
            ].join('\n');
            const run = await runV21Upgrade({ 'outputs-code.ts': source });

            expect(run.read('outputs-code.ts')).toBe(source);
            expect(run.log).toContain(SELECTION_OUTPUTS);
            expect(run.log).toContain(OPTION_OUTPUT);
            expect(run.log).toContain(MOST_RECENT_TREE_NODE);
        });

        it('leaves the list selection, the tree-select, other options and the CDK tree alone', async () => {
            const template = [
                '<kbq-list-selection (onSelectAll)="all()" (onCopy)="copy($event)">',
                '    <kbq-list-option value="a">A</kbq-list-option>',
                '</kbq-list-selection>',
                '<kbq-tree-select (onSelectAll)="all()">',
                '    <kbq-tree-selection [dataSource]="dataSource">',
                '        <kbq-tree-option *kbqTreeNodeDef="let node" (selectionChange)="changed()">',
                '            (onSelectAll) (onCopy) (onSelectionChange)',
                '        </kbq-tree-option>',
                '    </kbq-tree-selection>',
                '</kbq-tree-select>',
                '<kbq-select><kbq-option value="a" (onSelectionChange)="changed()">A</kbq-option></kbq-select>',
                ''
            ].join('\n');
            const source = [
                "import { CdkTreeNode } from '@angular/cdk/tree';",
                "import { KbqListSelection } from '@koobiq/components/list';",
                "import { KbqTreeSelect } from '@koobiq/components/tree-select';",
                'export class App {',
                '    readonly list = viewChild.required(KbqListSelection);',
                '    readonly select = viewChild.required(KbqTreeSelect);',
                '    init() {',
                '        this.list().onCopy.subscribe();',
                '        this.select().onSelectAll.subscribe();',
                '        return CdkTreeNode.mostRecentTreeNode;',
                '    }',
                '}',
                ''
            ].join('\n');
            const run = await runV21Upgrade({ 'others.html': template, 'others.ts': source });

            expect(run.read('others.html')).toBe(template);
            expect(run.read('others.ts')).toBe(source);
            expect(run.log).not.toContain(SELECTION_OUTPUTS);
            expect(run.log).not.toContain(OPTION_OUTPUT);
            expect(run.log).not.toContain(MOST_RECENT_TREE_NODE);
        });
    });
});
