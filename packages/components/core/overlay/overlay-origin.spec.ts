import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqCaretRect } from '../form-field/caret-rect';
import { kbqGetOverlayOriginSize, kbqIsElementOrigin, kbqResolveOverlayOrigin } from './overlay-origin';

/** `CdkOverlayOrigin` injects its own `ElementRef`, so it can only be built in an injection context. */
const cdkOriginOf = (elementRef: ElementRef<HTMLElement>): CdkOverlayOrigin => {
    TestBed.configureTestingModule({ providers: [{ provide: ElementRef, useValue: elementRef }] });

    return TestBed.runInInjectionContext(() => new CdkOverlayOrigin());
};

describe('overlay origin', () => {
    let element: HTMLElement;
    let caret: KbqCaretRect;

    beforeEach(() => {
        element = document.createElement('div');
        document.body.appendChild(element);

        // JSDOM does not lay out, so the element's box has to be supplied.
        jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({ width: 200, height: 24 } as DOMRect);

        caret = { x: 10, y: 20, width: 0, height: 16 };
    });

    afterEach(() => element.remove());

    describe('kbqIsElementOrigin', () => {
        it('should recognize origins that have a box of their own', () => {
            expect(kbqIsElementOrigin(element)).toBe(true);
            expect(kbqIsElementOrigin(new ElementRef(element))).toBe(true);
            expect(kbqIsElementOrigin(cdkOriginOf(new ElementRef(element)))).toBe(true);
        });

        it('should reject a rectangle in viewport coordinates', () => {
            expect(kbqIsElementOrigin(caret)).toBe(false);
        });
    });

    describe('kbqResolveOverlayOrigin', () => {
        it('should pass an element through untouched', () => {
            expect(kbqResolveOverlayOrigin(element)).toBe(element);
        });

        it('should pass an element reference through untouched', () => {
            const elementRef = new ElementRef(element);

            expect(kbqResolveOverlayOrigin(elementRef)).toBe(elementRef);
        });

        it('should unwrap a CDK overlay origin', () => {
            const elementRef = new ElementRef(element);

            expect(kbqResolveOverlayOrigin(cdkOriginOf(elementRef))).toBe(elementRef);
        });

        it('should pass a rectangle through untouched, getters and all', () => {
            expect(kbqResolveOverlayOrigin(caret)).toBe(caret);
        });
    });

    describe('kbqGetOverlayOriginSize', () => {
        it('should measure an element', () => {
            expect(kbqGetOverlayOriginSize(element)).toMatchObject({ width: 200, height: 24 });
        });

        it('should measure an element reference', () => {
            expect(kbqGetOverlayOriginSize(new ElementRef(element))).toMatchObject({ width: 200, height: 24 });
        });

        it('should measure a CDK overlay origin', () => {
            const origin = cdkOriginOf(new ElementRef(element));

            expect(kbqGetOverlayOriginSize(origin)).toMatchObject({ width: 200, height: 24 });
        });

        it('should read the size off a rectangle', () => {
            expect(kbqGetOverlayOriginSize(caret)).toEqual({ width: 0, height: 16 });
        });

        it('should read a rectangle that measures itself on every access', () => {
            let height = 16;
            const live: KbqCaretRect = {
                x: 10,
                y: 20,
                width: 0,
                get height() {
                    return height;
                }
            };

            expect(kbqGetOverlayOriginSize(live).height).toBe(16);

            height = 32;

            expect(kbqGetOverlayOriginSize(live).height).toBe(32);
        });
    });
});
