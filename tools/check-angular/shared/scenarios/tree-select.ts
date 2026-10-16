import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';

interface FileNode {
    id: string;
    name: string;
    children?: FileNode[];
}

interface FlatFileNode {
    id: string;
    name: string;
    level: number;
    expandable: boolean;
}

const FILES: FileNode[] = [
    {
        id: 'documents',
        name: 'Documents',
        children: [
            { id: 'invoice', name: 'Invoice' },
            { id: 'report', name: 'Report' }
        ]
    },
    {
        id: 'pictures',
        name: 'Pictures',
        children: [
            { id: 'cat', name: 'Cat' },
            { id: 'dog', name: 'Dog' }
        ]
    },
    { id: 'readme', name: 'Readme' }
];

const TEMPLATE = `
    <kbq-form-field>
        <kbq-label>File</kbq-label>
        <kbq-tree-select
            data-testid="file"
            placeholder="Choose a file"
            [formControl]="file"
            (openedChange)="onOpenedChange($event)"
        >
            <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                    {{ treeControl.getViewValue(node) }}
                </kbq-tree-option>

                <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                    <kbq-tree-node-toggle [node]="node" />
                    {{ treeControl.getViewValue(node) }}
                </kbq-tree-option>
            </kbq-tree-selection>
        </kbq-tree-select>
    </kbq-form-field>
    <output data-testid="file-summary">{{ opened() ? 'open' : 'closed' }}: {{ fileValue() ?? 'none' }}</output>
`;

function createFlattener(): KbqTreeFlattener<FileNode, FlatFileNode> {
    return new KbqTreeFlattener<FileNode, FlatFileNode>(
        ({ id, name, children }, level) => ({ id, name, level, expandable: !!children }),
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.children
    );
}

/** What both file pickers share: the control, the tree control and the outputs they listen to. */
abstract class FilePicker {
    readonly file = new FormControl<string | null>(null);
    readonly fileValue = toSignal(this.file.valueChanges, { initialValue: this.file.value });

    readonly opened = signal(false);
    /** Every `openedChange` emission, in order. */
    readonly openedChanges = signal<boolean[]>([]);

    readonly treeControl = new FlatTreeControl<FlatFileNode>(
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.id,
        (node) => node.name
    );

    abstract readonly dataSource: KbqTreeFlatDataSource<FileNode, FlatFileNode>;

    protected readonly hasChild = (_: number, node: FlatFileNode): boolean => node.expandable;

    protected onOpenedChange(opened: boolean): void {
        this.opened.set(opened);
        this.openedChanges.update((events) => [...events, opened]);
    }
}

/** A file picker: a two-level flat tree in a tree-select on a reactive control; the value is the node id. */
@Component({
    selector: 'check-tree-select',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqTreeSelectModule],
    template: TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectScenario extends FilePicker {
    readonly dataSource = new KbqTreeFlatDataSource<FileNode, FlatFileNode>(this.treeControl, createFlattener());

    constructor() {
        super();
        this.dataSource.data = FILES;
    }
}

/** The same picker with its data handed to the data source constructor instead of assigned to `data`. */
@Component({
    selector: 'check-tree-select-initial-data',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqTreeSelectModule],
    template: TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectInitialDataScenario extends FilePicker {
    readonly dataSource = new KbqTreeFlatDataSource<FileNode, FlatFileNode>(this.treeControl, createFlattener(), FILES);
}
