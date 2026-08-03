import { kbqResolvePanelMaxHeightToken } from './panel-height';

describe('kbqResolvePanelMaxHeightToken', () => {
    it('should render a height as a CSS length', () => {
        expect(kbqResolvePanelMaxHeightToken(300)).toBe('300px');
    });

    it('should treat zero as an explicit height rather than as unset', () => {
        expect(kbqResolvePanelMaxHeightToken(0)).toBe('0px');
    });

    it('should clamp a negative height to zero', () => {
        // A negative `max-height` is invalid at computed-value time, so the declaration would be dropped
        // and the list would end up unbounded instead of falling back to the token default.
        expect(kbqResolvePanelMaxHeightToken(-10)).toBe('0px');
    });

    it.each([
        ['null', null],
        ['undefined', undefined],
        // `numberAttribute` yields NaN — not null — for an invalid binding such as [panelMaxHeight]="null".
        ['NaN', NaN]
    ])('should leave the token unset when the height is %s', (_, panelMaxHeight) => {
        expect(kbqResolvePanelMaxHeightToken(panelMaxHeight)).toBeNull();
    });
});
