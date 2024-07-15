/* tslint:disable:no-reserved-keywords object-literal-key-quotes */
import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewEncapsulation } from '@angular/core';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener } from '@koobiq/components/tree';

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
                    'aria-reference.spec': 'ts',
                },
                'focus monitor': {
                    'focus-monitor': 'ts',
                    'focus-monitor.spec': 'ts',
                },
            },
        },
        documentation: {
            source: '',
            tools: '',
        },
        mosaic: {
            autocomplete: '',
            button: '',
            'button-toggle': '',
            index: 'ts',
            package: 'json',
            version: 'ts',
        },
        'components-dev': {
            alert: '',
            badge: '',
        },
        'koobiq-examples': '',
        'koobiq-moment-adapter': '',
        README: 'md',
        'tsconfig.build': 'json',
        wallabyTest: 'ts',
    },
    scripts: {
        deploy: {
            'cleanup-preview': 'ts',
            'publish-artifacts': 'sh',
            'publish-docs': 'sh',
            'publish-docs-preview': 'ts',
        },
        'tsconfig.deploy': 'json',
    },
    tests: '',
};

/**
 * @title Checklist tree
 */
@Component({
    selector: 'tree-multiple-checklist-example',
    templateUrl: 'tree-multiple-checklist-example.html',
    styleUrls: ['tree-multiple-checklist-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class TreeMultipleChecklistExample {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    modelValue: any = [];

    /** The selection for checklist */
    checklistSelection = new SelectionModel<FileFlatNode>(true /* multiple */);

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue,
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }

    onOptionClick($event, node: FileFlatNode): void {
        $event.preventDefault();
        this.fileSelectionToggle(node);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    /** Whether descendants of the node are selected or node selected. */
    selectedState(node: FileFlatNode): boolean {
        if (node.expandable) {
            return this.descendantsPartiallySelected(node) || (node.expandable && this.descendantsAllSelected(node));
        }

        return this.checklistSelection.isSelected(node);
    }

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: FileFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);

        return descendants.every((child) => this.checklistSelection.isSelected(child));
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: FileFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some((child) => this.checklistSelection.isSelected(child));

        return result && !this.descendantsAllSelected(node);
    }

    /** Toggle the to-do item selection. Select/deselect all the descendants node */
    fileSelectionToggle(node: FileFlatNode): void {
        this.checklistSelection.toggle(node);
        const descendants = this.treeControl.getDescendants(node);
        this.checklistSelection.isSelected(node)
            ? this.checklistSelection.select(...descendants)
            : this.checklistSelection.deselect(...descendants);

        // Force update for the parent
        descendants.every((child) => this.checklistSelection.isSelected(child));
        this.checkAllParentsSelection(node);
    }

    /* Checks all the parents when a leaf node is selected/unselected */
    checkAllParentsSelection(node: FileFlatNode): void {
        let parent: FileFlatNode | null = this.getParentNode(node);
        while (parent) {
            this.checkRootNodeSelection(parent);
            parent = this.getParentNode(parent);
        }
    }

    /** Check root node checked state and change it accordingly */
    checkRootNodeSelection(node: FileFlatNode): void {
        const nodeSelected = this.checklistSelection.isSelected(node);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.every((child) => this.checklistSelection.isSelected(child));
        if (nodeSelected && !descAllSelected) {
            this.checklistSelection.deselect(node);
        } else if (!nodeSelected && descAllSelected) {
            this.checklistSelection.select(node);
        }
    }

    /* Get the parent node of a node */
    getParentNode(node: FileFlatNode): FileFlatNode | null {
        const currentLevel = this.getLevel(node);

        if (currentLevel < 1) {
            return null;
        }

        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }

        return null;
    }

    private transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    private getLevel = (node: FileFlatNode) => {
        return node.level;
    };

    private isExpandable = (node: FileFlatNode) => {
        return node.expandable;
    };

    private getChildren = (node: FileNode): FileNode[] => {
        return node.children;
    };

    private getValue = (node: FileFlatNode): string => {
        return node.name;
    };

    private getViewValue = (node: FileFlatNode): string => {
        const nodeType = node.type ? `.${node.type}` : '';

        return `${node.name}${nodeType}`;
    };
}
