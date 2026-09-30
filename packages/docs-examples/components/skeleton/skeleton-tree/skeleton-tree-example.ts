import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSkeletonTree } from '@koobiq/components/skeleton';
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

const DIRECTORY: DirectoryNode[] = [
    { name: 'security.com', children: [{ name: 'Operators' }] },
    {
        name: 'corp.local',
        children: [
            { name: 'Administrators', children: [{ name: 'a.koobiq' }] },
            { name: 'Developers', children: [{ name: 'b.koobiq' }] },
            { name: 'Testers', children: [{ name: 'c.koobiq' }] }
        ]
    },
    { name: 'lab.local', children: [{ name: 'Guests' }] }
];

/**
 * @title Skeleton tree preset
 */
@Component({
    selector: 'skeleton-tree-example',
    imports: [KbqSkeletonTree, KbqToggleModule, FormsModule, KbqTreeModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-tree />
        } @else {
            <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl" [(ngModel)]="selected">
                <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>{{ node.name }}</kbq-tree-option>

                <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                    <kbq-tree-node-toggle [node]="node" />
                    {{ node.name }}
                </kbq-tree-option>
            </kbq-tree-selection>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
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
        this.dataSource.data = DIRECTORY;

        // The second node is the expanded one, as in the preset.
        const expanded = this.treeControl.dataNodes.find(({ name }) => name === 'corp.local');

        if (expanded) {
            this.treeControl.expand(expanded);
        }
    }

    protected hasChild(_: number, node: DirectoryFlatNode): boolean {
        return node.expandable;
    }
}
