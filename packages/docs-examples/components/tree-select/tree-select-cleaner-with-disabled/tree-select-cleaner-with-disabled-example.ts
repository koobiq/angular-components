import { ChangeDetectionStrategy, Component, effect, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import {
    FlatNode,
    getChildren,
    getLabel,
    getLevel,
    getTreeData,
    getValue,
    isExpandable,
    Node,
    transformer
} from '../tree-select-cleaner-data';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/** Ids of the nodes the user is not allowed to deselect. */
const lockedNodes = ['loadBalancer'];

/**
 * @title Tree-select cleaner with disabled nodes
 */
@Component({
    selector: 'tree-select-cleaner-with-disabled-example',
    imports: [FormsModule, KbqIconModule, KbqTreeModule, KbqTreeSelectModule],
    template: `
        <kbq-form-field>
            <kbq-tree-select multiple [placeholder]="t().kept" [(ngModel)]="kept">
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
            <kbq-tree-select
                multiple
                [placeholder]="t().cleared"
                [clearPredicate]="clearEverything"
                [(ngModel)]="cleared"
            >
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
export class TreeSelectCleanerWithDisabledExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly kept = model(['database', 'loadBalancer', 'messageQueue']);
    protected readonly cleared = model(['database', 'loadBalancer', 'messageQueue']);

    // Each tree-select needs its own control and data source: they share neither selection nor expansion.
    protected readonly keptTreeControl = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getLabel);
    protected readonly clearedTreeControl = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getLabel);

    protected readonly keptDataSource = this.createDataSource(this.keptTreeControl);
    protected readonly clearedDataSource = this.createDataSource(this.clearedTreeControl);

    /** Opts out of the default, which leaves the disabled nodes selected. */
    protected readonly clearEverything = (_node: FlatNode) => true;

    protected isLocked(node: FlatNode): boolean {
        return lockedNodes.includes(node.id);
    }

    protected hasChild(_: number, node: FlatNode): boolean {
        return node.expandable;
    }

    private createDataSource(treeControl: FlatTreeControl<FlatNode>): KbqTreeFlatDataSource<Node, FlatNode> {
        const dataSource = new KbqTreeFlatDataSource(
            treeControl,
            new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren)
        );

        return dataSource;
    }

    constructor() {
        super(TRANSLATIONS);
        effect(() => {
            // The nodes are keyed by stable ids, so a rebuild on a locale switch keeps the selection.
            this.keptDataSource.data = getTreeData(this.t());
            this.clearedDataSource.data = getTreeData(this.t());
        });
    }
}
