import { ChangeDetectionStrategy, Component, effect, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSkeletonTree } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

type DirectoryNode = {
    name: string;
    children?: DirectoryNode[];
};

type DirectoryFlatNode = {
    name: string;
    level: number;
    expandable: boolean;
};

/**
 * @title Skeleton tree preset
 */
@Component({
    selector: 'skeleton-tree-example',
    imports: [KbqSkeletonTree, KbqToggleModule, FormsModule, KbqTreeModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">{{ t().loading }}</kbq-toggle>

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
    protected readonly t = injectTranslation(TRANSLATIONS);

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
        this.dataSource.data = this.directory();

        effect(() => (this.dataSource.data = this.directory()));

        // The second node is the expanded one, as in the preset.
        const expanded = this.treeControl.dataNodes.find(({ name }) => name === 'corp.local');

        if (expanded) {
            this.treeControl.expand(expanded);
        }
    }

    protected hasChild(_: number, node: DirectoryFlatNode): boolean {
        return node.expandable;
    }

    private directory(): DirectoryNode[] {
        return [
            { name: 'security.com', children: [{ name: this.t().treeGroups[0]! }] },
            {
                name: 'corp.local',
                children: [
                    { name: this.t().treeGroups[1]!, children: [{ name: 'a.koobiq' }] },
                    { name: this.t().treeGroups[2]!, children: [{ name: 'b.koobiq' }] },
                    { name: this.t().treeGroups[3]!, children: [{ name: 'c.koobiq' }] }
                ]
            },
            { name: 'lab.local', children: [{ name: this.t().treeGroups[4]! }] }
        ];
    }
}
