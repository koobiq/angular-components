import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { buildFileTree, DATA_OBJECT, FileFlatNode, FileNode } from '../tree-select-data';
import { TRANSLATIONS } from './l10n';

/** The leaf of the empty choice: it carries no value, its label follows the active locale. */
const NONE_NODE = 'none';

/**
 * @title Tree-select validation
 */
@Component({
    selector: 'tree-select-validation-example',
    imports: [FormsModule, ReactiveFormsModule, KbqTreeModule, KbqTreeSelectModule, KbqIconModule],
    template: `
        <div class="kbq-form-vertical layout-column">
            <div class="kbq-form__label">{{ t().valid }}</div>
            <kbq-form-field>
                <kbq-tree-select [placeholder]="t().placeholder" [(ngModel)]="validSelected">
                    <kbq-tree-selection [dataSource]="validDataSource" [treeControl]="validTreeControl">
                        <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                            {{ validTreeControl.getViewValue(node) }}
                        </kbq-tree-option>

                        <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                            <i
                                kbq-icon="kbq-chevron-down-s_16"
                                kbqTreeNodeToggle
                                [style.transform]="validTreeControl.isExpanded(node) ? '' : 'rotate(-90deg)'"
                            ></i>
                            {{ validTreeControl.getViewValue(node) }}
                        </kbq-tree-option>
                    </kbq-tree-selection>
                </kbq-tree-select>
            </kbq-form-field>
        </div>

        <div class="kbq-form-vertical layout-column">
            <div class="kbq-form__label">{{ t().invalid }}</div>
            <kbq-form-field>
                <kbq-tree-select [placeholder]="t().placeholder" [formControl]="invalidControl">
                    <kbq-tree-selection [dataSource]="invalidDataSource" [treeControl]="invalidTreeControl">
                        <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                            {{ invalidTreeControl.getViewValue(node) }}
                        </kbq-tree-option>

                        <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                            <i
                                kbq-icon="kbq-chevron-down-s_16"
                                kbqTreeNodeToggle
                                [style.transform]="invalidTreeControl.isExpanded(node) ? '' : 'rotate(-90deg)'"
                            ></i>
                            {{ invalidTreeControl.getViewValue(node) }}
                        </kbq-tree-option>
                    </kbq-tree-selection>
                </kbq-tree-select>
            </kbq-form-field>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            gap: var(--kbq-size-l);
        }

        .kbq-form-vertical {
            width: 50%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectValidationExample implements OnInit {
    protected readonly t = injectTranslation(TRANSLATIONS);

    /** The first field is template-driven; the second is reactive. */
    protected validSelected: string | null = null;
    readonly invalidControl = new FormControl(null, Validators.required);
    readonly validTreeControl: FlatTreeControl<FileFlatNode>;
    readonly validDataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;
    readonly invalidTreeControl: FlatTreeControl<FileFlatNode>;
    readonly invalidDataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.validTreeControl = this.createTreeControl();
        this.validDataSource = this.createDataSource(this.validTreeControl, buildFileTree(DATA_OBJECT, 0));

        this.invalidTreeControl = this.createTreeControl();
        this.invalidDataSource = this.createDataSource(this.invalidTreeControl, this.createInvalidTreeData());
    }

    /** Marks the control touched, so the required error shows without the user touching the field. */
    ngOnInit(): void {
        this.invalidControl.markAsTouched();
        this.invalidControl.updateValueAndValidity();
    }

    protected hasChild(_: number, node: FileFlatNode): boolean {
        return node.expandable;
    }

    /** The `none` leaf sits above the file tree, like the empty option of a plain select. */
    private createInvalidTreeData(): FileNode[] {
        const noneLeaf = new FileNode();

        noneLeaf.name = NONE_NODE;

        return [noneLeaf, ...buildFileTree(DATA_OBJECT, 0)];
    }

    private createTreeControl(): FlatTreeControl<FileFlatNode> {
        return new FlatTreeControl<FileFlatNode>(this.getLevel, this.isExpandable, this.getValue, this.getViewValue);
    }

    private createDataSource(
        treeControl: FlatTreeControl<FileFlatNode>,
        data: FileNode[]
    ): KbqTreeFlatDataSource<FileNode, FileFlatNode> {
        const dataSource = new KbqTreeFlatDataSource(
            treeControl,
            new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren)
        );

        dataSource.data = data;

        return dataSource;
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

    private readonly getLevel = (node: FileFlatNode) => node.level;

    private readonly isExpandable = (node: FileFlatNode) => node.expandable;

    private readonly getChildren = (node: FileNode): FileNode[] | undefined => node.children;

    /** The `none` leaf maps to no value, so picking it leaves the required control empty. */
    private readonly getValue = (node: FileFlatNode): string | null => (node.name === NONE_NODE ? null : node.name);

    private readonly getViewValue = (node: FileFlatNode): string =>
        node.name === NONE_NODE ? this.t().none : `${node.name} view`;
}
