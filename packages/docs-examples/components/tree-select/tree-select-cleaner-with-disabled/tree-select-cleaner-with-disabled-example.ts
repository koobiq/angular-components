import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqOptionBase } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';
import {
    buildTree,
    FlatNode,
    getChildren,
    getLevel,
    getValue,
    isExpandable,
    Node,
    transformer,
    TREE_DATA
} from '../tree-select-cleaner-data';

/** Nodes the user is not allowed to deselect. */
const lockedNodes = ['Load balancer'];

/**
 * @title Tree-select cleaner with disabled nodes
 */
@Component({
    selector: 'tree-select-cleaner-with-disabled-example',
    imports: [FormsModule, KbqIconModule, KbqTreeModule, KbqTreeSelectModule],
    template: `
        <kbq-form-field>
            <kbq-tree-select multiple placeholder="Kept" [(ngModel)]="kept">
                <kbq-tree-selection [dataSource]="keptDataSource" [treeControl]="keptTreeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding [disabled]="isLocked(node)">
                        {{ keptTreeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i
                            kbq-icon="kbq-chevron-down-s_16"
                            kbqTreeNodeToggle
                            [style.transform]="keptTreeControl.isExpanded(node) ? '' : 'rotate(-90deg)'"
                        ></i>
                        {{ keptTreeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>

                <kbq-cleaner />
            </kbq-tree-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-tree-select multiple placeholder="Cleared" [clearPredicate]="clearEverything" [(ngModel)]="cleared">
                <kbq-tree-selection [dataSource]="clearedDataSource" [treeControl]="clearedTreeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding [disabled]="isLocked(node)">
                        {{ clearedTreeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i
                            kbq-icon="kbq-chevron-down-s_16"
                            kbqTreeNodeToggle
                            [style.transform]="clearedTreeControl.isExpanded(node) ? '' : 'rotate(-90deg)'"
                        ></i>
                        {{ clearedTreeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>

                <kbq-cleaner />
            </kbq-tree-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 240px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectCleanerWithDisabledExample {
    protected readonly kept = model(['Database', 'Load balancer', 'Message queue']);
    protected readonly cleared = model(['Database', 'Load balancer', 'Message queue']);

    // Each tree-select needs its own control and data source: they share neither selection nor expansion.
    protected readonly keptTreeControl = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getValue);
    protected readonly clearedTreeControl = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getValue);

    protected readonly keptDataSource = this.createDataSource(this.keptTreeControl);
    protected readonly clearedDataSource = this.createDataSource(this.clearedTreeControl);

    /** Opts out of the default, which leaves the disabled nodes selected. */
    protected readonly clearEverything = (_option: KbqOptionBase) => true;

    protected isLocked(node: FlatNode): boolean {
        return lockedNodes.includes(node.name);
    }

    protected hasChild(_: number, node: FlatNode): boolean {
        return node.expandable;
    }

    private createDataSource(treeControl: FlatTreeControl<FlatNode>): KbqTreeFlatDataSource<Node, FlatNode> {
        const dataSource = new KbqTreeFlatDataSource(
            treeControl,
            new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren)
        );

        dataSource.data = buildTree(TREE_DATA);

        return dataSource;
    }
}
