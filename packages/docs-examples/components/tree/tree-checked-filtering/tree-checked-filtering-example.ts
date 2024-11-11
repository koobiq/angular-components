import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleChange, KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import {
    FilterByValues,
    FilterByViewValue,
    FilterParentsForNodes,
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule,
    KbqTreeSelection
} from '@koobiq/components/tree';

export class FileNode {
    children: FileNode[];
    name: string;
    type: any;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    name: string;
    type: any;
    level: number;
    expandable: boolean;
    parent: any;
}

/**
 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
 * The return value is the list of `FileNode`.
 */
export function buildFileTree(value: any, level: number): FileNode[] {
    const data: any[] = [];

    for (const k of Object.keys(value)) {
        const v = value[k];
        const node = new FileNode();

        node.name = `${k}`;

        if (v === null || v === undefined) {
            // no action
        } else if (typeof v === 'object') {
            node.children = buildFileTree(v, level + 1);
        } else {
            node.type = v;
        }

        data.push(node);
    }

    return data;
}

export const DATA_OBJECT = {
    docs: 'app',
    src: {
        cdk: {
            a11ly: {
                'aria describer': {
                    'aria-describer': 'ts',
                    'aria-describer.spec': 'ts',
                    'aria-reference': 'ts',
                    'aria-reference.spec': 'ts'
                },
                'focus monitor': {
                    'focus-monitor': 'ts',
                    'focus-monitor.spec': 'ts'
                }
            }
        },
        documentation: {
            source: '',
            tools: ''
        },
        mosaic: {
            autocomplete: '',
            button: '',
            'button-toggle': '',
            index: 'ts',
            package: 'json',
            version: 'ts'
        },
        'mosaic-dev': {
            alert: '',
            badge: ''
        },
        'mosaic-examples': '',
        'mosaic-moment-adapter': '',
        README: 'md',
        'tsconfig.build': 'json'
    },
    scripts: {
        deploy: {
            'cleanup-preview': 'ts',
            'publish-artifacts': 'sh',
            'publish-docs': 'sh',
            'publish-docs-preview': 'ts'
        },
        'tsconfig.deploy': 'json'
    },
    tests: ''
};

abstract class TreeParams {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;
    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;
    treeData: FileNode[];
    tree: KbqTreeSelection;

    constructor() {
        this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable, this.getValue, this.getViewValue);
        this.treeFlattener = new KbqTreeFlattener<FileNode, FileFlatNode>(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            this.getChildren
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.dataSource.data = this.treeData = buildFileTree(DATA_OBJECT, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    getLevel = (node: FileFlatNode) => node.level;

    getValue = (node: FileFlatNode) => node.name;

    getViewValue = (node: FileFlatNode): string => {
        const nodeType = node.type ? `.${node.type}` : '';

        return `${node.name}${nodeType}`;
    };

    isExpandable = (node: FileFlatNode) => node.expandable;

    getChildren = (node: FileNode) => node.children;

    transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children?.length;

        return flatNode;
    };
}

/**
 * @title Tree checked filtering
 */
@Component({
    standalone: true,
    selector: 'tree-checked-filtering-example',
    imports: [
        KbqFormFieldModule,
        FormsModule,
        KbqButtonToggleModule,
        KbqTreeModule,
        KbqHighlightModule,
        KbqIconModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field>
            <input
                [(ngModel)]="filterValue"
                (ngModelChange)="onFilterChange($event)"
                kbqInput
                type="text"
            />
        </kbq-form-field>
        <div class="layout-margin-top-4xl">
            <kbq-button-toggle-group
                #group1="kbqButtonToggleGroup"
                (change)="onToggleClick($event)"
            >
                <kbq-button-toggle
                    [checked]="true"
                    [value]="treeStates.ALL"
                >
                    <i kbq-icon="kbq-bell_16"></i>
                    All
                </kbq-button-toggle>
                <kbq-button-toggle [value]="treeStates.SELECTED">
                    <i kbq-icon="kbq-bell_16"></i>
                    Selected
                </kbq-button-toggle>
                <kbq-button-toggle [value]="treeStates.UNSELECTED">
                    <i kbq-icon="kbq-bell_16"></i>
                    Unselected
                </kbq-button-toggle>
            </kbq-button-toggle-group>
        </div>
        <kbq-tree-selection
            [(ngModel)]="modelValue"
            [autoSelect]="false"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            (ngModelChange)="onModelValueChange($event)"
            multiple="checkbox"
        >
            <kbq-tree-option
                *kbqTreeNodeDef="let node"
                [disabled]="node.name === 'tests'"
                kbqTreeNodePadding
            >
                <span [innerHTML]="treeControl.getViewValue(node) | mcHighlight: treeControl.filterValue.value"></span>
            </kbq-tree-option>

            <kbq-tree-option
                *kbqTreeNodeDef="let node; when: hasChild"
                kbqTreeNodePadding
            >
                <kbq-tree-node-toggle [node]="node" />

                <span [innerHTML]="treeControl.getViewValue(node) | mcHighlight: treeControl.filterValue.value"></span>
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
export class TreeCheckedFilteringExample extends TreeParams {
    treeControl: FlatTreeControl<FileFlatNode>;
    filterByValues: FilterByValues<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    modelValue: any = ['docs'];
    filterValue: string = '';

    readonly treeStates = {
        ALL: 0,
        SELECTED: 1,
        UNSELECTED: 2
    };

    constructor() {
        super();
        this.filterByValues = new FilterByValues<FileFlatNode>(this.treeControl);
        this.filterByValues.setValues(this.modelValue);

        this.treeControl.setFilters(
            new FilterByViewValue<FileFlatNode>(this.treeControl),
            this.filterByValues,
            new FilterParentsForNodes<FileFlatNode>(this.treeControl)
        );
    }

    onModelValueChange(values) {
        this.filterByValues.setValues(values);
    }

    onFilterChange(value: string): void {
        this.treeControl.filterNodes(value);
    }

    onToggleClick({ value }: KbqButtonToggleChange) {
        if (value === this.treeStates.ALL) {
            this.filterByValues.setValues([]);
        } else if (value === this.treeStates.SELECTED) {
            this.filterByValues.setValues(this.modelValue);
        } else if (value === this.treeStates.UNSELECTED) {
            const values = this.treeControl.dataNodes
                .filter((node) => !this.modelValue.includes(this.treeControl.getValue(node)))
                .map((node) => this.treeControl.getValue(node));
            this.filterByValues.setValues(values);
        }

        this.treeControl.filterNodes(this.filterValue);
    }
}
