import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';

type FileTree = { [name: string]: FileTree | string };

class FileNode {
    name!: string;
    type?: string;
    children?: FileNode[];
}

class FileFlatNode {
    id!: string;
    name!: string;
    type?: string;
    level!: number;
    expandable!: boolean;
}

function buildFileTree(value: FileTree): FileNode[] {
    return Object.keys(value).map((name) => {
        const node = new FileNode();
        const content = value[name];

        node.name = name;

        if (typeof content === 'object') {
            node.children = buildFileTree(content);
        } else {
            node.type = content;
        }

        return node;
    });
}

const DOCUMENTS: FileTree = {
    'Delivery terms': 'pdf',
    'Payment terms': 'pdf'
};

const DATA_OBJECT: FileTree = {
    Documents: DOCUMENTS,
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
 * @title Tree track by
 */
@Component({
    selector: 'tree-track-by-example',
    imports: [
        KbqTreeModule,
        KbqButtonModule
    ],
    template: `
        <div class="layout-column layout-align-center-center docs-example-vertical-margin">
            <kbq-tree-selection style="width: 300px" [dataSource]="dataSource" [treeControl]="treeControl">
                <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                    {{ treeControl.getViewValue(node) }}
                </kbq-tree-option>

                <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                    <kbq-tree-node-toggle [node]="node" />
                    {{ treeControl.getViewValue(node) }}
                </kbq-tree-option>
            </kbq-tree-selection>

            <button kbq-button class="layout-margin-top-l" type="button" (click)="addDraft()">
                Add a draft to Documents
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTrackByExample {
    protected readonly treeControl = new FlatTreeControl<FileFlatNode, string>(
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.id,
        (node) => (node.type ? `${node.name}.${node.type}` : node.name)
    );

    // Every update flattens the data into new node objects: the expanded ones are found by their key.
    protected readonly dataSource = new KbqTreeFlatDataSource(
        this.treeControl,
        new KbqTreeFlattener(
            this.transformer,
            (node) => node.level,
            (node) => node.expandable,
            (node) => node.children
        ),
        buildFileTree(DATA_OBJECT)
    );

    private readonly drafts: FileTree = {};

    constructor() {
        // Before anything is expanded: a key is matched only under the function that stored it.
        this.treeControl.trackBy = (node) => node.id;
    }

    protected hasChild(_: number, node: FileFlatNode): boolean {
        return node.expandable;
    }

    protected addDraft(): void {
        this.drafts[`Draft ${Object.keys(this.drafts).length + 1}`] = 'docx';

        this.dataSource.data = buildFileTree({ ...DATA_OBJECT, Documents: { ...DOCUMENTS, ...this.drafts } });
    }

    private transformer(node: FileNode, level: number, parent: FileFlatNode | null): FileFlatNode {
        const flatNode = new FileFlatNode();

        flatNode.id = parent ? `${parent.id}/${node.name}` : node.name;
        flatNode.name = node.name;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    }
}
