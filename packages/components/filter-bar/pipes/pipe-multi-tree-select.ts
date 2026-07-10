import { ChangeDetectionStrategy, Component, OnInit, viewChild, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqHighlightModule, KbqPseudoCheckboxModule, KbqPseudoCheckboxState } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqTreeModule, kbqTreeSelectAllValue, KbqTreeSelection } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';
import { KbqPipeTemplate, KbqSelectValue, KbqTreeSelectFlatNode, KbqTreeSelectNode } from '../filter-bar.types';
import { getId, KbqBasePipe, KbqPipeMinWidth } from './base-pipe';
import { KbqMultiSelectPipeState } from './multi-select-pipe-state';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { KbqTreeSelectPipeBase } from './tree-select-pipe-base';

@Component({
    selector: 'kbq-pipe-multi-tree-select',
    imports: [
        KbqButtonModule,
        KbqDividerModule,
        KbqPipeState,
        KbqPipeButton,
        KbqTitleModule,
        KbqPipeMinWidth,
        KbqIconModule,
        KbqInputModule,
        ReactiveFormsModule,
        KbqHighlightModule,
        KbqTreeModule,
        KbqTreeSelectModule,
        FormsModule,
        KbqBadgeModule,
        KbqPseudoCheckboxModule
    ],
    templateUrl: 'pipe-multi-tree-select.html',
    styleUrls: ['base-pipe.scss', 'pipe-multi-tree-select.scss'],
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqPipeMultiTreeSelectComponent extends KbqTreeSelectPipeBase<KbqSelectValue[]> implements OnInit {
    /** @docs-private */
    readonly tree = viewChild.required(KbqTreeSelection);

    /** selected value */
    get selected() {
        return this.multiSelect.selected;
    }

    /** Whether the current pipe is empty. */
    get isEmpty(): boolean {
        return this.multiSelect.isEmpty(super.isEmpty);
    }

    get selectAllCheckboxState(): KbqPseudoCheckboxState {
        const select = this.select();

        if (!select) return 'unchecked';

        if (this.allOptionsSelected) {
            return 'checked';
        } else if (select.selected?.length > 0) {
            return 'indeterminate';
        }

        return 'unchecked';
    }

    get numberOfSelectedLeaves(): number {
        return this.select().selected.filter(({ value }) => value !== kbqTreeSelectAllValue).length;
    }

    /** true if all options selected */
    get allOptionsSelected(): boolean {
        const dataNodesLength = this.treeControl?.dataNodes?.length;
        const dataNodesForSelect = this.data.selectAll ? dataNodesLength - 1 : dataNodesLength;

        return this.select()?.triggerValues?.length === dataNodesForSelect;
    }

    get selectedAllEqualsSelectedNothing(): boolean {
        return this.multiSelect.selectedAllEqualsSelectedNothing;
    }

    /** true if all visible options selected */
    get allVisibleOptionsSelected(): boolean {
        return this.tree()
            .renderedOptions.filter((option) => option.value !== kbqTreeSelectAllValue)
            .every((option) => option.selected);
    }

    private readonly multiSelect = new KbqMultiSelectPipeState({
        data: this.data,
        filterBar: this.filterBar,
        allOptionsSelected: () => this.allOptionsSelected
    });

    constructor() {
        super();

        // See the field-init note in `KbqTreeSelectPipeBase`: subscribing here (after this class's
        // `updateTemplates` initializer) ensures the initial replay writes `dataSource.data`.
        this.filterBar?.internalTemplatesChanges.pipe(takeUntilDestroyed()).subscribe(this.updateTemplates);
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.multiSelect.updateInternalSelected();
    }

    isNodeSelectAll(_: number, nodeData: KbqTreeSelectFlatNode) {
        return nodeData.value === kbqTreeSelectAllValue;
    }

    onSelect({ value: option }) {
        if (!option) return;

        const tree = this.tree();

        if (tree.treeControl.isExpandable(option.data)) {
            tree.setStateChildren(option, !option.selected);
        }

        this.toggleParents(option.data.parent);

        setTimeout(() => {
            if (this.destroyed) return;

            if (this.selectedAllEqualsSelectedNothing && this.allOptionsSelected) {
                this.data.value = [];
            } else {
                this.data.value = this.select().selectedValues;
            }

            this.multiSelect.emitChangePipeEvent();

            this.stateChanges.next();
        });
    }

    searchKeydownHandler() {
        if (this.data.selectAll && this.tree().keyManager.activeItemIndex === 0) {
            this.toggleSelectAllNode();
        }
    }

    toggleSelectAllNode(emitEvent: boolean = true) {
        if (this.select().search()?.ngControl.value) {
            const renderedOptions = this.tree().renderedOptions.filter(({ value }) => value !== kbqTreeSelectAllValue);

            if (this.allVisibleOptionsSelected) {
                renderedOptions.forEach((option) => option.setSelected(false));
            } else {
                renderedOptions.forEach((option) => option.setSelected(true));
            }
        } else {
            if (this.allOptionsSelected) {
                this.tree().selectionModel.clear();
            } else {
                const [, ...dataNodesForSelect] = this.treeControl.dataNodes;

                // @todo DS-3827
                this.tree().selectionModel.select(...(dataNodesForSelect as any));
            }
        }

        setTimeout(() => {
            if (this.destroyed) return;

            if (this.selectedAllEqualsSelectedNothing && this.allOptionsSelected) {
                this.data.value = [];
            } else {
                this.data.value = [...this.select().selectedValues];
            }

            if (emitEvent) {
                this.multiSelect.emitChangePipeEvent();
            }

            this.stateChanges.next();
        });
    }

    /**
     * Populates the tree data source from the pipe template. The shared `values`/`valueTemplate`
     * assignment is already performed by the base subscription, so this override only does the
     * tree-specific work and avoids a redundant double assignment.
     */
    override updateTemplates = (templates: KbqPipeTemplate[] | null) => {
        const template = templates?.find((item) => getId(item) === getId(this.data));

        if (template?.values) {
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

    override onClear() {
        super.onClear();

        this.multiSelect.updateInternalSelected();
    }

    /** @docs-private */
    onClose() {
        if (this.allOptionsSelected) {
            this.multiSelect.updateInternalSelected();
        }

        setTimeout(() => this.restoreTriggerFocus());
    }

    /** handler for select all options in select */
    selectAllHandler = (event: KeyboardEvent) => {
        event.preventDefault();

        this.toggleSelectAllNode();
    };

    private toggleParents(parent: KbqTreeSelectFlatNode | undefined) {
        if (!parent) {
            return;
        }

        const descendants = this.treeControl.getDescendants(parent);
        const isParentSelected = this.select().selectionModel.selected.includes(parent);

        if (
            !isParentSelected &&
            descendants.every((d: KbqTreeSelectFlatNode) => this.select().selectionModel.selected.includes(d))
        ) {
            this.select().selectionModel.select(parent);
            this.toggleParents(parent.parent);
        } else if (isParentSelected) {
            this.select().selectionModel.deselect(parent);
            this.toggleParents(parent.parent);
        }
    }
}
