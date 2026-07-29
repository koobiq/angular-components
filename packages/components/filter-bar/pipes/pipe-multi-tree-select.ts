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
        if (!this.select()) return 'unchecked';

        if (this.allOptionsSelected) {
            return 'checked';
        }

        const tally = this.unlockedTally;

        return tally && tally.selected > 0 ? 'indeterminate' : 'unchecked';
    }

    get numberOfSelectedLeaves(): number {
        return this.select().selected.filter(({ value }) => value !== kbqTreeSelectAllValue).length;
    }

    /** true if all options selected */
    get allOptionsSelected(): boolean {
        const tally = this.unlockedTally;

        // A tally of zero is not a full selection: with every node locked there is nothing for "select
        // all" to act on, and `0 === 0` would otherwise check the master checkbox over a tree the user
        // cannot toggle. Same reasoning as `allVisibleOptionsSelected` below.
        return !!tally && tally.total > 0 && tally.selected === tally.total;
    }

    /**
     * Selection tally restricted to the nodes the user can actually toggle — the one place the "ignore the
     * locked nodes" rule of "select all" is expressed. `null` until the tree data has been built.
     *
     * `triggerValues` is derived from the very same selection model as `selected`, so either would do.
     */
    private get unlockedTally(): { total: number; selected: number } | null {
        const dataNodes = this.treeControl?.dataNodes;

        if (!dataNodes) return null;

        return this.multiSelect.unlockedTally(
            dataNodes.filter(({ value }) => value !== kbqTreeSelectAllValue).map(({ value }) => value),
            (this.select()?.triggerValues ?? []).map(({ value }) => value)
        );
    }

    get selectedAllEqualsSelectedNothing(): boolean {
        return this.multiSelect.selectedAllEqualsSelectedNothing;
    }

    /** true if all visible options selected */
    get allVisibleOptionsSelected(): boolean {
        const visible = this.tree().renderedOptions.filter(
            (option) => option.value !== kbqTreeSelectAllValue && !option.disabled
        );

        // `[].every()` is `true`: with every visible node locked there is nothing for "select all" to act
        // on, and claiming "all selected" would send the toggle down the deselect branch instead.
        return visible.length > 0 && visible.every((option) => option.selected);
    }

    /** Flat nodes whose selection the user cannot remove, the subtree of a locked branch included. */
    private get lockedDataNodes(): KbqTreeSelectFlatNode[] {
        return this.lockedValues?.length ? (this.treeControl.dataNodes?.filter(this.isLockedNode) ?? []) : [];
    }

    /**
     * Values of every locked node, the subtree of a locked branch included. Resolved once per template
     * change rather than on demand — `isEmpty` reads it on every change-detection pass.
     */
    private lockedNodeValues: unknown[] = [];

    private readonly multiSelect = new KbqMultiSelectPipeState({
        data: this.data,
        filterBar: this.filterBar,
        allOptionsSelected: () => this.allOptionsSelected,
        lockedValues: () => this.lockedNodeValues,
        isSameValue: (first, second) => this.treeControl.compareValues(first, second),
        emptyValue: () => null
    });

    constructor() {
        super();

        // Resolve the select-all node's label on every read instead of the value baked into `name` by
        // `updateTemplates`, which only re-runs on `pipeTemplates` changes and so goes stale on a locale
        // change. The template calls `treeControl.getViewValue(node)` directly, so reading `localeData`
        // here registers this view as a consumer of the filter-bar's `configuration` signal.
        // `FlatTreeControl` captures the accessor by reference in `KbqTreeSelectPipeBase`'s constructor,
        // before this subclass's field initializers run — hence patching the instance, not overriding
        // the inherited `getViewValue` field, which the tree would never see.
        this.treeControl.getViewValue = (node: KbqTreeSelectFlatNode): string => {
            return node.value === kbqTreeSelectAllValue ? this.localeData.pipe.selectAll : node.name;
        };

        // Patched on the instance for the same reason as `getViewValue` above: `KbqTreeSelectPipeBase`
        // builds the control before this subclass's fields exist, so it cannot pass the predicate as the
        // `isDisabled` constructor argument. Routing the locked options through it buys the guards the
        // tree already has — blocked clicks, exclusion from "select all", disabled trigger values.
        this.treeControl.isDisabled = this.isLockedNode;

        // See the field-init note in `KbqTreeSelectPipeBase`: subscribing here (after this class's
        // `updateTemplates` initializer) ensures the initial replay writes `dataSource.data`.
        this.filterBar?.internalTemplatesChanges.pipe(takeUntilDestroyed()).subscribe(this.updateTemplates);
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.multiSelect.updateInternalSelected();
    }

    override ngAfterViewInit(): void {
        super.ngAfterViewInit();

        this.multiSelect.markViewInitialized();
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

            // `setStateChildren` and `toggleParents` cascade straight through the selection model, so a
            // locked descendant of a deselected branch has to be put back before the value is read.
            this.enforceLockedNodes();

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
            // `KbqTreeOption.setSelected()` does not consult `disabled`, so the locked options are filtered
            // out here rather than relying on the tree's own guards.
            const renderedOptions = this.tree().renderedOptions.filter(
                (option) => option.value !== kbqTreeSelectAllValue && !option.disabled
            );

            if (this.allVisibleOptionsSelected) {
                renderedOptions.forEach((option) => option.setSelected(false));
            } else {
                renderedOptions.forEach((option) => option.setSelected(true));
            }
        } else {
            // Same model the tree owns — see the note in `enforceLockedNodes`.
            const { selectionModel } = this.select();

            if (this.allOptionsSelected) {
                // `clear()` would drop the locked nodes along with the rest. Matched by value rather than
                // by reference: the last `dataSource.data` assignment rebuilds every flat node, so an
                // identity check would miss the ones the selection model still holds.
                selectionModel.deselect(...selectionModel.selected.filter((node) => !this.isLockedNode(node)));
            } else {
                const [, ...dataNodesForSelect] = this.treeControl.dataNodes;

                // The locked nodes are already selected and stay out of "select all" either way — leaving
                // them out here keeps them out of the model's `added` payload too.
                // @todo DS-3827
                selectionModel.select(...(dataNodesForSelect.filter((node) => !this.isLockedNode(node)) as any));
            }
        }

        setTimeout(() => {
            if (this.destroyed) return;

            this.enforceLockedNodes();

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

        // Expanded here rather than on demand: the `dataSource.data` assignment above is the only thing
        // that rewrites `treeControl.dataNodes`, so this is the single point where either input changes.
        this.lockedNodeValues = this.lockedDataNodes.map((node) => node.value);

        this.multiSelect.normalizeValue();
    };

    override onClear() {
        super.onClear();

        this.multiSelect.updateInternalSelected();
    }

    /** Clearing keeps the locked values; with none configured the pipe resets to `null` as before. */
    protected override clearedValue(): KbqSelectValue[] | null {
        return this.multiSelect.clearedValue();
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

    /**
     * Whether the node cannot be deselected: either its own value is locked, or it descends from a locked
     * branch. Locking a branch has to lock its subtree — deselecting a child would otherwise switch the
     * locked parent's own checkbox off.
     */
    private isLockedNode = (node: KbqTreeSelectFlatNode): boolean => {
        let current: KbqTreeSelectFlatNode | undefined = node;

        while (current) {
            const { value } = current;

            if (this.lockedValues?.some((locked) => this.treeControl.compareValues(locked, value))) return true;

            current = current.parent;
        }

        return false;
    };

    /** Puts back every locked node the tree's own cascades may have deselected. */
    private enforceLockedNodes(): void {
        // The tree-select exposes the very same model the tree owns, but untyped — which is what the
        // surrounding code (`toggleParents`) already relies on to pass flat nodes around.
        const { selectionModel } = this.select();
        const missing = this.lockedDataNodes.filter((node) => !selectionModel.isSelected(node));

        if (missing.length) {
            selectionModel.select(...missing);
        }
    }

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
