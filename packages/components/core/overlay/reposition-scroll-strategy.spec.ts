import { CdkScrollable, Overlay, OverlayModule, OverlayRef, ScrollDispatcher } from '@angular/cdk/overlay';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { Component, ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqRepositionScrollStrategy, KbqRepositionScrollStrategyConfig } from '@koobiq/components/core';
import { Subject } from 'rxjs';

@Component({
    template: '<p>Reposition</p>'
})
class Test {}

function makeScrollable(element: HTMLElement): CdkScrollable {
    return { getElementRef: () => new ElementRef(element) } as CdkScrollable;
}

describe('KbqRepositionScrollStrategy', () => {
    let overlay: Overlay;
    let overlayRef: OverlayRef;
    let componentPortal: ComponentPortal<Test>;
    let scrolled: Subject<CdkScrollable | void>;

    beforeEach(() => {
        scrolled = new Subject<CdkScrollable | void>();

        TestBed.configureTestingModule({
            imports: [OverlayModule, PortalModule, Test],
            providers: [{ provide: ScrollDispatcher, useFactory: () => ({ scrolled: () => scrolled }) }]
        });

        overlay = TestBed.inject(Overlay);
        componentPortal = new ComponentPortal(Test);
    });

    afterEach(() => {
        overlayRef?.dispose();
    });

    function createOverlay(config?: KbqRepositionScrollStrategyConfig): void {
        const scrollDispatcher = TestBed.inject(ScrollDispatcher);

        overlayRef = overlay.create({ scrollStrategy: new KbqRepositionScrollStrategy(scrollDispatcher, config) });
    }

    it('should update the overlay position when the page is scrolled', () => {
        createOverlay();
        overlayRef.attach(componentPortal);
        const spy = jest.spyOn(overlayRef, 'updatePosition');

        scrolled.next();
        expect(spy).toHaveBeenCalledTimes(1);

        scrolled.next();
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should not be updating the position after the overlay is detached', () => {
        createOverlay();
        overlayRef.attach(componentPortal);
        const spy = jest.spyOn(overlayRef, 'updatePosition');

        overlayRef.detach();
        scrolled.next();

        expect(spy).not.toHaveBeenCalled();
    });

    it('should not be updating the position after the overlay is destroyed', () => {
        createOverlay();
        overlayRef.attach(componentPortal);
        const spy = jest.spyOn(overlayRef, 'updatePosition');

        overlayRef.dispose();
        scrolled.next();

        expect(spy).not.toHaveBeenCalled();
    });

    it('should ignore scrolls originating inside the overlay by default', () => {
        createOverlay();
        overlayRef.attach(componentPortal);
        const spy = jest.spyOn(overlayRef, 'updatePosition');

        scrolled.next(makeScrollable(overlayRef.overlayElement));

        expect(spy).not.toHaveBeenCalled();
    });

    it('should reposition on inner scrolls when ignoreInnerScroll is false (CDK default behavior)', () => {
        createOverlay({ ignoreInnerScroll: false });
        overlayRef.attach(componentPortal);
        const spy = jest.spyOn(overlayRef, 'updatePosition');

        scrolled.next(makeScrollable(overlayRef.overlayElement));

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should reposition on scrolls from outside the overlay', () => {
        createOverlay();
        overlayRef.attach(componentPortal);
        const spy = jest.spyOn(overlayRef, 'updatePosition');

        scrolled.next(makeScrollable(document.createElement('div')));

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
