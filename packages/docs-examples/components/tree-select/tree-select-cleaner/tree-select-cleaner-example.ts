import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

/**
 * @title Tree-select cleaner
 */
@Component({
    selector: 'tree-select-cleaner-example',
    imports: [FormsModule, KbqIconModule, KbqTreeModule, KbqTreeSelectModule],
    template: `
        <kbq-form-field>
            <kbq-tree-select placeholder="Placeholder" [(ngModel)]="selected">
                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i
                            kbq-icon="kbq-chevron-down-s_16"
                            kbqTreeNodeToggle
                            [style.transform]="treeControl.isExpanded(node) ? '' : 'rotate(-90deg)'"
                        ></i>
                        {{ treeControl.getViewValue(node) }}
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
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectCleanerExample {
    protected readonly selected = model('Database');

    protected readonly treeControl = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getValue);
    protected readonly dataSource: KbqTreeFlatDataSource<Node, FlatNode>;

    constructor() {
        this.dataSource = new KbqTreeFlatDataSource(
            this.treeControl,
            new KbqTreeFlattener(transformer, getLevel, isExpandable, getChildren)
        );
        this.dataSource.data = buildTree(TREE_DATA);
    }

    protected hasChild(_: number, node: FlatNode): boolean {
        return node.expandable;
    }
}
