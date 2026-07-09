import { KbqFilterBarHost, KbqPipeData, KbqSelectValue } from '../filter-bar.types';

/** The pieces {@link KbqMultiSelectPipeState} reads from its owning multi-select pipe. */
export interface KbqMultiSelectPipeStateHost {
    readonly data: KbqPipeData<KbqSelectValue[]>;
    readonly filterBar: KbqFilterBarHost | null;
    /** Whether every selectable option is currently selected (pipe-specific). */
    allOptionsSelected(): boolean;
}

/**
 * Shared "select all = select nothing" state for the multi-select pipes (`kbq-pipe-multi-select`,
 * `kbq-pipe-multi-tree-select`). Extracted as a plain composition helper — not a base class — because the
 * two pipes have different bases (`KbqBasePipe` vs `KbqTreeSelectPipeBase`) and cannot share a single
 * `@Directive()` base (the diamond), while a mixin would risk breaking AOT view-query inheritance.
 */
export class KbqMultiSelectPipeState {
    /** Snapshot of the committed selection, preserved across the "all selected → []" collapse. */
    internalSelected: KbqSelectValue[] | null = null;

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

    /** Refreshes the snapshot from the current value (only under "all = nothing"). */
    updateInternalSelected(): void {
        if (this.selectedAllEqualsSelectedNothing) {
            this.internalSelected = this.host.data.value?.slice() || [];
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
            (this.selectedAllEqualsSelectedNothing && this.host.allOptionsSelected())
        );
    }
}
