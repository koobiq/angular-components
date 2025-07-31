import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';

export class FileNode {
    children: FileNode[];
    name: string;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    name: string;
    description: string;
    level: number;
    expandable: boolean;
    parent: any;
}

/**
 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
 * The return value is the list of `FileNode`.
 */
export function buildFileTree(countries: any, level: number): FileNode[] {
    const data: any[] = [];

    for (const country of countries) {
        const node = new FileNode();

        node.name = country.name;

        if (country.children && country.children.length) {
            node.children = buildFileTree(country.children, level + 1);
        }

        data.push(node);
    }

    return data;
}

export const DATA_OBJECT = [
    { name: 'Lonely leaf' },
    {
        name: 'Branch 1',
        children: [
            {
                name: 'Arsenal'
            },
            {
                name: 'Chelsea'
            },
            {
                name: 'Liverpool'
            },
            {
                name: 'Manchester City'
            },
            {
                name: 'Tottenham Hotspur'
            }
        ]
    },
    {
        name: 'Branch 2',
        children: [
            {
                name: 'Atlético de Madrid'
            },
            {
                name: 'FC Barcelona'
            },
            {
                name: 'Real Betis'
            },
            {
                name: 'Real Madrid'
            },
            {
                name: 'Sevilla FC'
            },
            {
                name: 'Valencia CF'
            }
        ]
    },
    {
        name: 'Disabled Node'
    }
];

/**
 * @title tree-select-and-mark
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'tree-toggle-on-click-example',
    imports: [
        KbqTreeModule,
        FormsModule,
        KbqPseudoCheckboxModule
    ],
    template: `
        <kbq-tree-selection
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [autoSelect]="false"
            [(ngModel)]="modelValue"
        >
            <kbq-tree-option
                *kbqTreeNodeDef="let node; when: hasChild"
                kbqTreeNodePadding
                [selectable]="false"
                (click)="treeControl.toggle(node)"
                (keydown.enter)="treeControl.toggle(node)"
            >
                <kbq-tree-node-toggle [node]="node" />

                <span [innerHTML]="treeControl.getViewValue(node)"></span>
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding [disabled]="node.name === 'Disabled Node'">
                <span [innerHTML]="treeControl.getViewValue(node)"></span>
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
export class TreeToggleOnClickExample {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    modelValue: any = '';

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

    private getValue = (node: FileFlatNode): FileFlatNode => {
        return node;
    };

    private getViewValue = (node: FileFlatNode): string => {
        return `${node.name}`;
    };
}
