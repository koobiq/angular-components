import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqHighlightModule, KbqPseudoCheckboxModule, KbqPseudoCheckboxState } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTitleModule } from '@koobiq/components/title';
import {
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule,
    kbqTreeSelectAllValue,
    KbqTreeSelection
} from '@koobiq/components/tree';
import { KbqTreeSelect, KbqTreeSelectModule } from '@koobiq/components/tree-select';
import { Observable } from 'rxjs';
import { KbqPipeTemplate, KbqSelectValue, KbqTreeSelectFlatNode, KbqTreeSelectNode } from '../filter-bar.types';
import { getId, KbqBasePipe, KbqPipeMinWidth } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { KbqPipeTitleDirective } from './pipe-title';

@Component({
    standalone: true,
    selector: 'kbq-pipe-multi-tree-select',
    templateUrl: 'pipe-multi-tree-select.html',
    styleUrls: ['base-pipe.scss', 'pipe-multi-tree-select.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ],
    imports: [
        KbqButtonModule,
        KbqDividerModule,
        NgClass,
        KbqPipeState,
        KbqPipeButton,
        KbqTitleModule,
        KbqPipeTitleDirective,
        KbqPipeMinWidth,
        KbqFormFieldModule,
        KbqIcon,
        KbqInputModule,
        ReactiveFormsModule,
        KbqHighlightModule,
        KbqTreeModule,
        KbqTreeSelectModule,
        NgIf,
        FormsModule,
        KbqBadgeModule,
        KbqPseudoCheckboxModule
    ]
})
export class KbqPipeMultiTreeSelectComponent extends KbqBasePipe<KbqSelectValue[]> implements OnInit {
    /** control for search options */
    searchControl: UntypedFormControl = new UntypedFormControl();
    /** filtered by search options */
    filteredOptions: Observable<any[]>;

    treeControl: FlatTreeControl<KbqTreeSelectFlatNode>;
    treeFlattener: KbqTreeFlattener<KbqTreeSelectNode, KbqTreeSelectFlatNode>;

    dataSource: KbqTreeFlatDataSource<KbqTreeSelectNode, KbqTreeSelectFlatNode>;

    template: any;

    /** @docs-private */
    @ViewChild(KbqTreeSelect) select: KbqTreeSelect;

    /** @docs-private */
    @ViewChild(KbqTreeSelection) tree: KbqTreeSelection;

    /** selected value */
    get selected() {
        return this.data.value;
    }

    /** Whether the current pipe is empty. */
    get isEmpty(): boolean {
        return (
            super.isEmpty || (Array.isArray(this.data.value) && this.data.value.length === 0) || this.allOptionsSelected
        );
    }

    get selectAllCheckboxState(): KbqPseudoCheckboxState {
        if (!this.select) return 'unchecked';

        const arrayOfOptions = this.select.options.toArray().filter((option) => option.value !== kbqTreeSelectAllValue);

        if (arrayOfOptions.every((option) => option.selected)) {
            return 'checked';
        } else if (arrayOfOptions.every((option) => !option.selected)) {
            return 'unchecked';
        }

        return 'indeterminate';
    }

    get numberOfSelectedLeaves(): number {
        return this.select.selected.filter(({ value }) => value !== kbqTreeSelectAllValue).length;
    }

    /** true if all options selected */
    get allOptionsSelected(): boolean {
        const dataNodesLength = this.treeControl?.dataNodes?.length;
        const dataNodesForSelect = this.data.selectAll ? dataNodesLength - 1 : dataNodesLength;

        return this.select?.triggerValues?.length === dataNodesForSelect;
    }

    /** true if all visible options selected */
    get allVisibleOptionsSelected(): boolean {
        return this.tree.renderedOptions
            .filter((option) => option.value !== kbqTreeSelectAllValue)
            .every((option) => option.selected);
    }

    constructor() {
        super();

        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<KbqTreeSelectFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );

        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.filterBar?.internalTemplatesChanges.pipe(takeUntilDestroyed()).subscribe(this.updateTemplates);
    }

    ngOnInit(): void {
        this.searchControl.valueChanges.subscribe((value) => this.treeControl.filterNodes(value));
    }

    isNodeHasChild(_: number, nodeData) {
        return nodeData.expandable;
    }

    isNodeSelectAll(_: number, nodeData) {
        return nodeData.value === kbqTreeSelectAllValue;
    }

    onSelect({ value: option }) {
        if (!option) return;

        if (option.isExpandable) {
            this.tree.setStateChildren(option, !option.selected);
        }

        this.toggleParents(option.data.parent);

        this.data.value = this.select.selectedValues;
        this.filterBar?.onChangePipe.emit(this.data);
        this.stateChanges.next();
    }

    searchKeydownHandler() {
        if (this.data.selectAll && this.tree.keyManager.activeItemIndex === 0) {
            this.toggleSelectAllNode();
        }
    }

    toggleSelectAllNode() {
        if (this.select.search.ngControl.value) {
            const renderedOptions = this.tree.renderedOptions.filter(({ value }) => value !== kbqTreeSelectAllValue);

            if (this.allVisibleOptionsSelected) {
                renderedOptions.forEach((option) => option.setSelected(false));
            } else {
                renderedOptions.forEach((option) => option.setSelected(true));
            }
        } else {
            if (this.allOptionsSelected) {
                this.tree.selectionModel.clear();
            } else {
                const [, ...dataNodesForSelect] = this.treeControl.dataNodes;

                // @todo DS-3827
                this.tree.selectionModel.select(...(dataNodesForSelect as any));
            }
        }

        this.data.value = [...this.select.selectedValues];

        this.filterBar?.onChangePipe.emit(this.data);
        this.stateChanges.next();
    }

    /** updates values for selection and value template */
    override updateTemplates = (templates: KbqPipeTemplate[] | null) => {
        const template = templates?.find((template) => getId(template) === getId(this.data));

        if (template?.values) {
            this.values = template.values;
            this.valueTemplate = template.valueTemplate;

            const values = [...(template.values as KbqTreeSelectNode[])];

            if (this.data.selectAll) {
                values.unshift({
                    name: this.localeData.pipe.selectAll,
                    value: kbqTreeSelectAllValue,
                    children: null
                });
            }

            this.dataSource.data = values;
        }
    };

    /** opens select */
    override open() {
        setTimeout(() => this.select.open());
    }

    onOpen() {
        this.treeControl.expandAll();
    }

    onClose() {
        if (this.allOptionsSelected) {
            this.toggleSelectAllNode();
        }
    }

    private toggleParents(parent) {
        if (!parent) {
            return;
        }

        const descendants = this.treeControl.getDescendants(parent);
        const isParentSelected = this.select.selectionModel.selected.includes(parent);

        if (!isParentSelected && descendants.every((d: any) => this.select.selectionModel.selected.includes(d))) {
            this.select.selectionModel.select(parent);
            this.toggleParents(parent.parent);
        } else if (isParentSelected) {
            this.select.selectionModel.deselect(parent);
            this.toggleParents(parent.parent);
        }
    }

    private transformer = (node: KbqTreeSelectNode, level: number, parent: any) => {
        const flatNode = new KbqTreeSelectFlatNode();

        flatNode.name = node.name;
        flatNode.value = node.value;
        flatNode.parent = parent;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    private getLevel = (node: KbqTreeSelectFlatNode) => {
        return node.level;
    };

    private isExpandable = (node: KbqTreeSelectFlatNode) => {
        return node.expandable;
    };

    private getChildren = (node: KbqTreeSelectNode): KbqTreeSelectNode[] | null => {
        return node.children;
    };

    private getValue = (node: KbqTreeSelectFlatNode): unknown => {
        return node.value;
    };

    private getViewValue = (node: KbqTreeSelectFlatNode): string => {
        return `${node.name}`;
    };
}
