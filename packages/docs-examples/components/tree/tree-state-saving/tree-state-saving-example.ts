import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import {
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
    Documents: {
        'Delivery terms': 'pdf',
        'Payment terms': 'pdf'
    },
    Pictures: {
        Sun: 'png',
        Woods: 'jpg'
    },
    Downloads: {
        November: 'pdf',
        October: 'pdf'
    }
};

/**
 * @title Tree state saving
 */
@Component({
    selector: 'tree-state-saving-example',
    imports: [
        KbqTreeModule,
        KbqButtonModule
    ],
    template: `
        <div class="layout-column layout-align-center-center docs-example-vertical-margin">
            <kbq-tree-selection
                stateSavingKey="tree-state-saving-example"
                style="width: 300px"
                [dataSource]="dataSource"
                [treeControl]="treeControl"
            >
                <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                    {{ treeControl.getViewValue(node) }}
                </kbq-tree-option>

                <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                    <kbq-tree-node-toggle [node]="node" />
                    {{ treeControl.getViewValue(node) }}
                </kbq-tree-option>
            </kbq-tree-selection>

            <button kbq-button class="layout-margin-top-l" type="button" (click)="tree().clearSavedState()">
                Reset saved state
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeStateSavingExample {
    protected readonly tree = viewChild.required(KbqTreeSelection);

    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
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

    // The value expansion is persisted under. It must be stable across reloads, and unique within the
    // tree — a node object is re-created whenever the data is replaced, so it cannot serve as the key.
    private getValue = (node: FileFlatNode): string => {
        return node.name;
    };

    private getViewValue = (node: FileFlatNode): string => {
        const nodeType = node.type ? `.${node.type}` : '';

        return `${node.name}${nodeType}`;
    };
}
