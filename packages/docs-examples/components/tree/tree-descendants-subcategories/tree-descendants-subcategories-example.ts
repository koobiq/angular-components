import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqHighlightModule } from '@koobiq/components/core';
import {
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule,
    KbqTreeOption,
    KbqTreeSelection,
    KbqTreeSelectionChange
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
        koobiq: {
            autocomplete: '',
            button: '',
            'button-toggle': '',
            index: 'ts',
            package: 'json',
            version: 'ts'
        },
        'koobiq-dev': {
            alert: '',
            badge: ''
        },
        'koobiq-examples': '',
        'koobiq-moment-adapter': '',
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
 * @title Tree descendants subcategories
 */
@Component({
    standalone: true,
    selector: 'tree-descendants-subcategories-example',
    imports: [
        KbqTreeModule,
        FormsModule,
        KbqHighlightModule
    ],
    template: `
        <kbq-tree-selection
            [(ngModel)]="modelValue"
            [autoSelect]="false"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            (selectionChange)="onSelectionChange($event)"
            multiple="checkbox"
        >
            <kbq-tree-option
                *kbqTreeNodeDef="let node"
                [checkboxThirdState]="true"
                kbqTreeNodePadding
            >
                <span [innerHTML]="treeControl.getViewValue(node) | mcHighlight: treeControl.filterValue.value"></span>
            </kbq-tree-option>

            <kbq-tree-option
                *kbqTreeNodeDef="let node; when: hasChild"
                [checkboxThirdState]="true"
                kbqTreeNodePadding
            >
                <kbq-tree-node-toggle [node]="node" />

                <span [innerHTML]="treeControl.getViewValue(node) | mcHighlight: treeControl.filterValue.value"></span>
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
export class TreeDescendantsSubcategoriesExample extends TreeParams {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    modelValue: any = ['docs'];

    @ViewChild(KbqTreeSelection) tree: KbqTreeSelection;

    constructor() {
        super();
    }

    onSelectionChange($event: KbqTreeSelectionChange<KbqTreeOption>) {
        const option: KbqTreeOption = $event.option;

        if (option.isExpandable) {
            this.tree.setStateChildren(option, !option.selected);
        }

        this.toggleParents(($event.option.data as any)?.parent);
    }

    private toggleParents(parent) {
        if (!parent) {
            return;
        }

        const descendants = this.treeControl.getDescendants(parent);
        const isParentSelected = this.tree.selectionModel.selected.includes(parent);

        if (!isParentSelected && descendants.every((d: any) => this.tree.selectionModel.selected.includes(d))) {
            this.tree.selectionModel.select(parent);
            this.toggleParents(parent.parent);
        } else if (isParentSelected) {
            this.tree.selectionModel.deselect(parent);
            this.toggleParents(parent.parent);
        }
    }
}
