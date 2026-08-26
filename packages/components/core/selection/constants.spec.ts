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
        ['single', null],
        ['false', null],
        [false, null],
        [null, null],
        [undefined, null]
    ])('should resolve %p to %p', (value, expected) => {
        expect(resolveMultipleMode(value)).toBe(expected);
        expect(warn).not.toHaveBeenCalled();
    });

    it('should fall back to single selection and report an unsupported value', () => {
        expect(resolveMultipleMode('multiple' as KbqMultipleInput)).toBeNull();

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain('"multiple"');
    });
});
