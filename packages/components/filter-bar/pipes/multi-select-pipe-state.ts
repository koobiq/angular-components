import { KbqFilterBarHost, KbqPipeData, KbqSelectValue } from '../filter-bar.types';

/** The pieces {@link KbqMultiSelectPipeState} reads from its owning multi-select pipe. */
export interface KbqMultiSelectPipeStateHost {
    readonly data: KbqPipeData<KbqSelectValue[]>;
    readonly filterBar: KbqFilterBarHost | null;
    /** Whether every selectable option is currently selected (pipe-specific). */
    allOptionsSelected(): boolean;
    /**
     * Template-provided values whose selection the user cannot remove, already resolved into the shape
     * the pipe stores in `data.value` (pipe-specific).
     */
    lockedValues(): unknown[];
    /** Equality of two entries of `data.value` (pipe-specific: id comparator / tree value comparator). */
    isSameValue(first: unknown, second: unknown): boolean;
    /** Value the pipe settles on when nothing at all is selected (pipe-specific: `[]` vs `null`). */
    emptyValue(): KbqSelectValue[] | null;
}

/**
 * Shared "select all = select nothing" state for the multi-select pipes (`kbq-pipe-multi-select`,
 * `kbq-pipe-multi-tree-select`). Extracted as a plain composition helper — not a base class — because the
 * two pipes have different bases (`KbqBasePipe` vs `KbqTreeSelectPipeBase`) and cannot share a single
 * `@Directive()` base (the diamond), while a mixin would risk breaking AOT view-query inheritance.
 *
 * It also owns the locked-option semantics (`KbqPipeTemplate.lockedValues`): which entries cannot be
 * deselected, how they are folded into an incoming value, and what a cleared pipe is left with.
 */
export class KbqMultiSelectPipeState {
    /** Snapshot of the committed selection, preserved across the "all selected → []" collapse. */
    internalSelected: KbqSelectValue[] | null = null;

    /**
     * Whether the owning pipe's view is live. Until it is, the pipe's view queries cannot be read and no
     * user interaction has happened yet — so the "all selected" sentinel cannot exist.
     */
    private viewInitialized = false;

    constructor(private readonly host: KbqMultiSelectPipeStateHost) {}

    /** Whether selecting every option is treated as selecting nothing. */
    get selectedAllEqualsSelectedNothing(): boolean {
        return (
            this.host.data.selectedAllEqualsSelectedNothing ??
            this.host.filterBar?.selectedAllEqualsSelectedNothing() ??
            true
        );
    }

    /** Value to display: the preserved snapshot under "all = nothing", otherwise the raw value. */
    get selected(): KbqSelectValue[] | null {
        return this.selectedAllEqualsSelectedNothing ? this.internalSelected : this.host.data.value;
    }

    /** Values whose selection the user cannot remove. */
    get lockedValues(): unknown[] {
        return this.host.lockedValues();
    }

    /** Marks the owning pipe's view live. Called from its `ngAfterViewInit`. */
    markViewInitialized(): void {
        this.viewInitialized = true;
    }

    /**
     * Tally over the entries the user can actually toggle, both arrays given as entries of `data.value`.
     * Locked entries are selected no matter what, so counting them would pin the master checkbox to
     * `indeterminate` and put "select all" permanently out of reach.
     */
    unlockedTally(all: unknown[], selected: unknown[]): { total: number; selected: number } {
        return {
            total: all.filter((item) => !this.isLocked(item)).length,
            selected: selected.filter((item) => !this.isLocked(item)).length
        };
    }

    /**
     * Refreshes the snapshot from the current value (only under "all = nothing").
     *
     * The locked values are folded in rather than copied verbatim. The snapshot is what the panel
     * renders, and the value it is taken from may be the "all selected" sentinel, which deliberately
     * omits them — so a plain copy would reopen the panel with a locked option unchecked and, being
     * disabled, impossible for the user to put back. Merging into the assigned array rather than into
     * the `selected` getter keeps the reference stable across change detection: the getter feeds the
     * select's `value` binding, which would otherwise be rewritten on every pass.
     */
    updateInternalSelected(): void {
        if (this.selectedAllEqualsSelectedNothing) {
            this.internalSelected = this.mergeLocked(this.host.data.value?.slice() || []);
        }
    }

    /** Emits the change, collapsing the value to `[]` when everything is selected under "all = nothing". */
    emitChangePipeEvent(): void {
        if (this.selectedAllEqualsSelectedNothing && this.host.allOptionsSelected()) {
            this.host.filterBar?.onChangePipe.emit({ ...this.host.data, value: [] });
        } else {
            this.host.filterBar?.onChangePipe.emit(this.host.data);
        }
    }

    /** Whether the pipe reads as empty, given the base pipe's own emptiness. */
    isEmpty(baseIsEmpty: boolean): boolean {
        return (
            baseIsEmpty ||
            (Array.isArray(this.host.data.value) && !this.host.data.value.length) ||
            this.hasOnlyLockedValues() ||
            (this.selectedAllEqualsSelectedNothing && this.host.allOptionsSelected())
        );
    }

    /** Whether the given entry of the pipe's value is one the user cannot deselect. */
    isLocked(item: unknown): boolean {
        return this.lockedValues.some((locked) => this.host.isSameValue(locked, item));
    }

    /**
     * The given value with every locked value it is missing appended. Returns the value unchanged (same
     * reference) when nothing is missing, so a pipe without locked options keeps its own `null` / `[]`
     * representation of "empty".
     */
    mergeLocked(value: KbqSelectValue[] | null): KbqSelectValue[] | null {
        const missing = this.lockedValues.filter(
            (locked) => !value?.some((item) => this.host.isSameValue(locked, item))
        );

        if (!missing.length) return value;

        return [...(value || []), ...missing] as KbqSelectValue[];
    }

    /** Value a cleared pipe is left with: the locked values, or the pipe's own empty value. */
    clearedValue(): KbqSelectValue[] | null {
        return this.lockedValues.length ? ([...this.lockedValues] as KbqSelectValue[]) : this.host.emptyValue();
    }

    /** Whether the committed value holds nothing beyond the locked entries. */
    hasOnlyLockedValues(): boolean {
        const value = this.host.data.value;

        return (
            !!this.lockedValues.length &&
            Array.isArray(value) &&
            value.length > 0 &&
            value.every((item) => this.isLocked(item))
        );
    }

    /**
     * Silently folds the missing locked values into the committed value and refreshes the snapshot.
     *
     * Only ever called when a value arrives from outside the pipe (initialization, pipe-template changes)
     * — never from a selection handler, where `[]` is the "all selected = nothing selected" sentinel for
     * a full selection rather than an empty one.
     *
     * That sentinel still has to be recognised here: `internalTemplatesChanges` re-emits on every new
     * `pipeTemplates` reference, long after the user may have selected everything. Locked values are
     * deliberately absent from the sentinel — folding them in would silently downgrade "everything
     * selected" to "only the locked values selected", and without a change event, so the host's filter
     * model and the pipe would drift apart. Before the view is live no interaction has happened yet,
     * so a `[]` there is a genuinely empty value that should receive the locked ones.
     */
    normalizeValue(): void {
        if (this.viewInitialized && this.selectedAllEqualsSelectedNothing && this.host.allOptionsSelected()) return;

        const merged = this.mergeLocked(this.host.data.value);

        if (merged === this.host.data.value) return;

        this.host.data.value = merged;

        this.updateInternalSelected();
    }
}
