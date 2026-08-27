import { KbqMultipleInput, MultipleMode, resolveMultipleMode } from './constants';

describe('resolveMultipleMode', () => {
    let warn: jest.SpyInstance;

    beforeEach(() => {
        warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => warn.mockRestore());

    it.each<[KbqMultipleInput, MultipleMode | null]>([
        ['', MultipleMode.CHECKBOX],
        ['true', MultipleMode.CHECKBOX],
        [true, MultipleMode.CHECKBOX],
        ['checkbox', MultipleMode.CHECKBOX],
        [MultipleMode.CHECKBOX, MultipleMode.CHECKBOX],
        ['keyboard', MultipleMode.KEYBOARD],
        [MultipleMode.KEYBOARD, MultipleMode.KEYBOARD],
        ['false', null],
        [false, null],
        [null, null],
        [undefined, null]
    ])('should resolve %p to %p', (value, expected) => {
        expect(resolveMultipleMode(value)).toBe(expected);
        expect(warn).not.toHaveBeenCalled();
    });

    // Derived from the enum rather than listed, so a mode added later is covered without touching this file.
    it.each(Object.values(MultipleMode))('should resolve the %s mode to itself', (mode) => {
        expect(resolveMultipleMode(mode)).toBe(mode);
        expect(warn).not.toHaveBeenCalled();
    });

    // `single` is not a spelling of its own: single selection is what an absent attribute already means.
    it.each(['multiple', 'single'])('should fall back to single selection and report %p', (value) => {
        expect(resolveMultipleMode(value as KbqMultipleInput)).toBeNull();

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain(JSON.stringify(value));
    });

    it('should point at omitting the attribute in the unsupported-value warning', () => {
        resolveMultipleMode('single' as KbqMultipleInput);

        expect(warn.mock.calls[0][0]).toContain('Omit the attribute for single selection.');
    });

    it('should list every mode the enum declares in the unsupported-value warning', () => {
        resolveMultipleMode('multiple' as KbqMultipleInput);

        for (const mode of Object.values(MultipleMode)) {
            expect(warn.mock.calls[0][0]).toContain(`"${mode}"`);
        }
    });
});
