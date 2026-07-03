/**
 * Adapter describing how a component reads and writes selection state for a set of items,
 * so the shared select-all logic can operate regardless of how selection is stored
 * (per-option setter, `SelectionModel` on data nodes, etc.).
 */
export interface KbqSelectAllAdapter<T> {
    /** All candidate items, in render/model order. */
    items: readonly T[];
    /** Whether the item may participate (e.g. not disabled, and — for tree — `selectable()`). */
    isSelectable: (item: T) => boolean;
    /** Current selected state of the item. */
    isSelected: (item: T) => boolean;
    /** Applies the new selected state to the item. */
    setSelected: (item: T, selected: boolean) => void;
}

/** Options for {@link toggleSelectAll}. */
export interface KbqToggleSelectAllOptions {
    /**
     * When `true`, a repeated toggle deselects everything once all selectable items are already
     * selected. When `false` (default), the toggle only ever selects.
     */
    allowDeselect?: boolean;
}

/**
 * Canonical "select all / deselect all" toggle shared by the multi-select components (`Ctrl`/`Cmd` + `A`).
 *
 * Considers only selectable items and selects them all. When `allowDeselect` is `true` and every selectable
 * item is already selected, deselects them all instead; otherwise a repeated call is a no-op. No-op when
 * there are no selectable items.
 *
 * @returns the items whose selected state actually flipped, in input order.
 */
export function toggleSelectAll<T>(adapter: KbqSelectAllAdapter<T>, options?: KbqToggleSelectAllOptions): T[] {
    const selectable = adapter.items.filter((item) => adapter.isSelectable(item));

    if (selectable.length === 0) {
        return [];
    }

    const shouldSelect = !options?.allowDeselect || selectable.some((item) => !adapter.isSelected(item));
    const changed = selectable.filter((item) => adapter.isSelected(item) !== shouldSelect);

    selectable.forEach((item) => adapter.setSelected(item, shouldSelect));

    return changed;
}

/** Event emitted by the `onSelectAll` outputs when the select-all toggle runs. */
export class KbqSelectAllEvent<T, S = unknown> {
    constructor(
        /** Component that emitted the event. */
        public readonly source: S,
        /** The selectable options affected by the toggle. */
        public readonly options: T[],
        /** `true` when all options were selected, `false` when all were deselected. */
        public readonly selected: boolean
    ) {}
}

/**
 * Whether `Ctrl`/`Cmd` + `A` should select the text of a search `<input>` rather than toggle options.
 *
 * Returns `true` only when the input has text that is not already fully selected (nothing selected,
 * a partial selection, or just a caret). Returns `false` for an empty input (so select-all falls
 * straight through to the options) and when the whole value is already selected (a second press
 * then acts on the options).
 */
export function shouldSelectSearchText(input: HTMLInputElement | null | undefined): boolean {
    if (!input) {
        return false;
    }

    const length = input.value.length;

    if (length === 0) {
        return false;
    }

    return !(input.selectionStart === 0 && input.selectionEnd === length);
}
