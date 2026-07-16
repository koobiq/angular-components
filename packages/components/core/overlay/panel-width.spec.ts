import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { kbqGetPanelWidthOrigin, kbqResolvePanelWidth } from './panel-width';

/** Creates an element whose measured width is fixed at the given value. */
const elementOfWidth = (width: number): HTMLElement => {
    const element = document.createElement('div');

    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({ width } as DOMRect);

    return element;
};

describe('kbqResolvePanelWidth', () => {
    describe('content-sized panel', () => {
        it.each([
            ['null', null],
            ['undefined', undefined],
            ['an empty string', '']
        ])('should leave the width unset and floor the minimum when panelWidth is %s', (_, panelWidth) => {
            expect(kbqResolvePanelWidth(panelWidth, 200, 300)).toEqual({ width: '', minWidth: 300 });
        });

        it('should floor the minimum at panelMinWidth when the trigger is narrower', () => {
            expect(kbqResolvePanelWidth(null, 200, 150)).toEqual({ width: '', minWidth: 200 });
        });
    });

    describe('trigger-sized panel', () => {
        it('should match the trigger when it is wider than panelMinWidth', () => {
            expect(kbqResolvePanelWidth('auto', 200, 300)).toEqual({ width: 300, minWidth: '' });
        });

        it('should floor at panelMinWidth when the trigger is narrower', () => {
            expect(kbqResolvePanelWidth('auto', 640, 300)).toEqual({ width: 640, minWidth: '' });
        });

        it('should resolve the floor into width rather than emitting minWidth', () => {
            // `setOverlayPosition()` clears `minWidth` on viewport overflow after deriving the panel
            // offset from the measured width, so the floor has to survive in `width`.
            expect(kbqResolvePanelWidth('auto', 640, 300).minWidth).toBe('');
        });
    });

    describe('explicit width', () => {
        it('should use the given width and ignore panelMinWidth', () => {
            expect(kbqResolvePanelWidth(250, 200, 100)).toEqual({ width: 250, minWidth: '' });
        });

        it('should not floor an explicit width at panelMinWidth', () => {
            expect(kbqResolvePanelWidth(150, 200, 100)).toEqual({ width: 150, minWidth: '' });
        });

        it.each(['fit-content', '50%', '20rem'])('should pass the CSS value %s through untouched', (panelWidth) => {
            expect(kbqResolvePanelWidth(panelWidth, 200, 300)).toEqual({ width: panelWidth, minWidth: '' });
        });

        it('should treat zero as an explicit width rather than as unset', () => {
            expect(kbqResolvePanelWidth(0, 200, 300)).toEqual({ width: 0, minWidth: '' });
        });

        it('should treat a non-finite panelWidth as unset rather than passing NaN through', () => {
            expect(kbqResolvePanelWidth(NaN, 200, 300)).toEqual({ width: '', minWidth: 300 });
        });
    });

    describe('panelMinWidth coercion', () => {
        it.each([
            ['null', null],
            ['undefined', undefined],
            // `numberAttribute` yields NaN — not null — for an invalid binding such as [panelMinWidth]="null".
            ['NaN', NaN]
        ])('should fall back to the trigger width when panelMinWidth is %s', (_, panelMinWidth) => {
            expect(kbqResolvePanelWidth(null, panelMinWidth, 300)).toEqual({ width: '', minWidth: 300 });
        });

        it('should never produce NaN', () => {
            expect(kbqResolvePanelWidth(null, NaN, 300).minWidth).not.toBeNaN();
            expect(kbqResolvePanelWidth('auto', NaN, 300).width).not.toBeNaN();
        });

        it('should keep the trigger floor when panelMinWidth is zero', () => {
            expect(kbqResolvePanelWidth(null, 0, 300)).toEqual({ width: '', minWidth: 300 });
        });

        it('should clamp a negative panelMinWidth to zero', () => {
            expect(kbqResolvePanelWidth('auto', -100, 300)).toEqual({ width: 300, minWidth: '' });
        });
    });

    describe('trigger width coercion', () => {
        it('should fall back to panelMinWidth when the trigger has not been measured', () => {
            expect(kbqResolvePanelWidth('auto', 200, NaN)).toEqual({ width: 200, minWidth: '' });
        });

        it('should handle a zero-width trigger', () => {
            expect(kbqResolvePanelWidth(null, 200, 0)).toEqual({ width: '', minWidth: 200 });
        });
    });
});

describe('kbqGetPanelWidthOrigin', () => {
    it('should measure a native element', () => {
        expect(kbqGetPanelWidthOrigin(elementOfWidth(300))).toBe(300);
    });

    it('should measure an ElementRef', () => {
        expect(kbqGetPanelWidthOrigin(new ElementRef(elementOfWidth(300)))).toBe(300);
    });

    it('should measure a CdkOverlayOrigin', () => {
        // `CdkOverlayOrigin` injects its own `ElementRef`, so it can only be built in an injection context.
        TestBed.configureTestingModule({
            providers: [{ provide: ElementRef, useValue: new ElementRef(elementOfWidth(300)) }]
        });

        const origin = TestBed.runInInjectionContext(() => new CdkOverlayOrigin());

        expect(kbqGetPanelWidthOrigin(origin)).toBe(300);
    });
});
