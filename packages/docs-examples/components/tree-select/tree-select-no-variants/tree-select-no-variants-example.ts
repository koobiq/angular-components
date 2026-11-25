import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqForm, KbqFormElement } from '@koobiq/components/core';
import { KbqSelectNoOptions } from '@koobiq/components/select';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

export class FileNode {
    children?: FileNode[];
    name = '';
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    name = '';
    level = 0;
    expandable = false;
    parent: any;
}

/**
 * @title Tree-select no variants
 */
@Component({
    selector: 'tree-select-no-variants-example',
    imports: [KbqTreeSelectModule, KbqTreeModule, KbqSelectNoOptions, KbqForm, KbqFormElement],
    template: `
        <form novalidate class="kbq-form-vertical">
            <div class="kbq-form__row">
                <label class="kbq-form__label">{{ t().emptySelect }}</label>
                <kbq-form-field>
                    <kbq-tree-select>
                        <!--
                            The tree stays empty, as it would after a backend that returned no nodes, so the panel
                            opens onto this message alone — the same directive the plain select reads.
                        -->
                        <kbq-select-no-options>{{ t().noOptions }}</kbq-select-no-options>

                        <!--
                            An empty tree-selection still has to be projected: without one the select never
                            resolves its options, and the panel does not open to show the message.
                        -->
                        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl" />
                    </kbq-tree-select>
                </kbq-form-field>
            </div>
        </form>
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
export class TreeSelectNoVariantsExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

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

        // No nodes: the panel has nothing to list, only the projected message.
        this.dataSource.data = [];
    }

    private readonly transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
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
        return node.name;
    };
}
