import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';

type DirectoryNode = {
    name: string;
    children?: DirectoryNode[];
};

type DirectoryFlatNode = {
    name: string;
    level: number;
    expandable: boolean;
};

const directory: DirectoryNode[] = [
    {
        name: 'security.com',
        children: [
            { name: 'Administrators', children: [{ name: 'a.koobiq' }, { name: 'b.koobiq' }] },
            { name: 'Operators', children: [{ name: 'c.koobiq' }] }
        ]
    },
    {
        name: 'corp.local',
        children: [{ name: 'Developers' }]
    }
];

/**
 * @title Skeleton with tree
 */
@Component({
    selector: 'skeleton-tree-example',
    imports: [KbqSkeleton, KbqToggleModule, FormsModule, KbqTreeModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        <kbq-tree-selection
            class="example-tree"
            [dataSource]="dataSource"
            [disabled]="loading()"
            [treeControl]="treeControl"
            [(ngModel)]="selected"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                <span [kbqSkeleton]="loading()">{{ node.name }}</span>
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle [kbqSkeleton]="loading()" [node]="node" />
                <span [kbqSkeleton]="loading()">{{ node.name }}</span>
            </kbq-tree-option>
        </kbq-tree-selection>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }

        .example-tree {
            align-self: stretch;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonTreeExample {
    protected readonly loading = model(true);
    protected readonly selected = model<string>('');
    protected readonly treeControl = new FlatTreeControl<DirectoryFlatNode>(
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.name,
        (node) => node.name
    );
    protected readonly dataSource = new KbqTreeFlatDataSource(
        this.treeControl,
        new KbqTreeFlattener<DirectoryNode, DirectoryFlatNode>(
            (node, level) => ({ name: node.name, level, expandable: !!node.children }),
            (node) => node.level,
            (node) => node.expandable,
            (node) => node.children
        )
    );

    constructor() {
        this.dataSource.data = directory;
        this.treeControl.expandAll();
    }

    protected hasChild(_: number, node: DirectoryFlatNode): boolean {
        return node.expandable;
    }
}
