import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';
import { buildFileTree, DATA_OBJECT, FileFlatNode, type FileNode } from '../tree-select-data';

/**
 * @title Tree-select icon
 */
@Component({
    selector: 'tree-select-icon-example',
    imports: [FormsModule, KbqTreeModule, KbqTreeSelectModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <i kbqPrefix color="contrast-fade" kbq-icon="kbq-globe_16"></i>
            <kbq-tree-select [(ngModel)]="selected">
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
        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-column layout-align-center-center'
    }
})
export class TreeSelectIconExample {
    selected = 'docs';
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

    private readonly transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    private readonly getLevel = (node: FileFlatNode) => {
        return node.level;
    };

    private readonly isExpandable = (node: FileFlatNode) => {
        return node.expandable;
    };

    private readonly getChildren = (node: FileNode): FileNode[] | undefined => {
        return node.children;
    };

    private readonly getValue = (node: FileFlatNode): string => {
        return node.name;
    };

    private readonly getViewValue = (node: FileFlatNode): string => {
        return `${node.name} view`;
    };
}
