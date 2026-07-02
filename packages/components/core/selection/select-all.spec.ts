import { KbqSelectAllAdapter, shouldSelectSearchText, toggleSelectAll } from './select-all';

interface TestItem {
    disabled: boolean;
    selected: boolean;
}

const createAdapter = (items: TestItem[]): KbqSelectAllAdapter<TestItem> => ({
    items,
    isSelectable: (item) => !item.disabled,
    isSelected: (item) => item.selected,
    setSelected: (item, selected) => (item.selected = selected)
});

describe('toggleSelectAll', () => {
    it('should select all selectable items when none are selected', () => {
        const items: TestItem[] = [
            { disabled: false, selected: false },
            { disabled: false, selected: false }
        ];

        const changed = toggleSelectAll(createAdapter(items));

        expect(items.every((item) => item.selected)).toBe(true);
        expect(changed.length).toBe(2);
    });

    it('should select the remaining items when only some are selected', () => {
        const items: TestItem[] = [
            { disabled: false, selected: true },
            { disabled: false, selected: false }
        ];

        const changed = toggleSelectAll(createAdapter(items));

        expect(items.every((item) => item.selected)).toBe(true);
        // only the previously-unselected item flips
        expect(changed.length).toBe(1);
    });

    it('should deselect all items when every selectable item is already selected and allowDeselect is true', () => {
        const items: TestItem[] = [
            { disabled: false, selected: true },
            { disabled: false, selected: true }
        ];

        const changed = toggleSelectAll(createAdapter(items), { allowDeselect: true });

        expect(items.every((item) => !item.selected)).toBe(true);
        expect(changed.length).toBe(2);
    });

    it('should NOT deselect when all are selected and allowDeselect is false (default)', () => {
        const items: TestItem[] = [
            { disabled: false, selected: true },
            { disabled: false, selected: true }
        ];

        const changed = toggleSelectAll(createAdapter(items));

        expect(items.every((item) => item.selected)).toBe(true);
        expect(changed).toEqual([]);
    });

    it('should ignore non-selectable (disabled) items', () => {
        const items: TestItem[] = [
            { disabled: true, selected: false },
            { disabled: false, selected: false }
        ];

        toggleSelectAll(createAdapter(items));

        expect(items[0].selected).toBe(false);
        expect(items[1].selected).toBe(true);
    });

    it('should treat "all selected" based only on selectable items', () => {
        // disabled item is unselected but must not force a "select all"
        const items: TestItem[] = [
            { disabled: true, selected: false },
            { disabled: false, selected: true }
        ];

        toggleSelectAll(createAdapter(items), { allowDeselect: true });

        // every selectable item was already selected -> deselect them
        expect(items[1].selected).toBe(false);
    });

    it('should be a no-op and return an empty array when there are no selectable items', () => {
        const items: TestItem[] = [
            { disabled: true, selected: false },
            { disabled: true, selected: false }
        ];

        const changed = toggleSelectAll(createAdapter(items));

        expect(changed).toEqual([]);
        expect(items.every((item) => !item.selected)).toBe(true);
    });

    it('should return an empty array when items is empty', () => {
        expect(toggleSelectAll(createAdapter([]))).toEqual([]);
    });
});

describe('shouldSelectSearchText', () => {
    const createInput = (value: string, selectionStart: number | null, selectionEnd: number | null) =>
        ({ value, selectionStart, selectionEnd }) as HTMLInputElement;

    it('should return false when there is no input', () => {
        expect(shouldSelectSearchText(null)).toBe(false);
        expect(shouldSelectSearchText(undefined)).toBe(false);
    });

    it('should return false when the input is empty', () => {
        expect(shouldSelectSearchText(createInput('', 0, 0))).toBe(false);
    });

    it('should return true when nothing is selected (caret only)', () => {
        expect(shouldSelectSearchText(createInput('text', 4, 4))).toBe(true);
    });

    it('should return true when the text is only partially selected', () => {
        expect(shouldSelectSearchText(createInput('text', 0, 2))).toBe(true);
    });

    it('should return false when the whole value is already selected', () => {
        expect(shouldSelectSearchText(createInput('text', 0, 4))).toBe(false);
    });
});
