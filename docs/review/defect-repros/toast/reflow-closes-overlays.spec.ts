import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ApplicationRef, Component, ElementRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchMouseEvent } from '@koobiq/components/core';
import { KbqToastModule, KbqToastService } from '@koobiq/components/toast';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { NEVER, Subject } from 'rxjs';

@Component({
    selector: 'tooltip-host',
    imports: [KbqToolTipModule],
    template: `
        <button [kbqTooltip]="'TOOLTIP_CONTENT'">Trigger</button>
    `
})
class TooltipHost {
    readonly trigger = viewChild.required(KbqTooltipTrigger, { read: ElementRef });
}

@Component({
    selector: 'foreign-overlay-content',
    template: 'FOREIGN_OVERLAY'
})
class ForeignOverlayContent {}

// DS-5407 again: the toast container merges its own resize notifications into `elementScrolled()`, and the
// ScrollDispatcher re-broadcasts them to every overlay of the application. jsdom performs no layout, so the
// real ResizeObserver never fires there; the stub stands for what a browser reports whenever the container's
// box changes — a toast added, or a leaving toast collapsing its height.
describe('triage: toast stack reflow closes overlays that do not contain it', () => {
    let resized: Subject<ResizeObserverEntry[]>;
    let service: KbqToastService;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
        resized = new Subject<ResizeObserverEntry[]>();

        TestBed.configureTestingModule({
            imports: [KbqToastModule, TooltipHost],
            providers: [
                {
                    provide: SharedResizeObserver,
                    useValue: {
                        observe: (element: Element) => (element.localName === 'kbq-toast-container' ? resized : NEVER)
                    }
                }
            ]
        });

        service = TestBed.inject(KbqToastService);
        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(() => {
        service.ngOnDestroy();
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: a reflow of the toast stack detaches an unrelated overlay with the close scroll strategy', () => {
        const overlay = TestBed.inject(Overlay);
        const overlayRef = overlay.create({ scrollStrategy: overlay.scrollStrategies.close() });

        overlayRef.attach(new ComponentPortal(ForeignOverlayContent));

        service.show({ title: 'Saved' }, 0);
        TestBed.inject(ApplicationRef).tick();

        expect(overlayRef.hasAttached()).toBe(true);

        resized.next([]);

        expect(overlayRef.hasAttached()).toBe(false);

        overlayRef.dispose();
    });

    it('DEFECT: an open kbq tooltip closes when the toast stack reflows', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(TooltipHost);

        fixture.detectChanges();

        dispatchMouseEvent(fixture.componentInstance.trigger().nativeElement, 'mouseenter');
        fixture.detectChanges();
        // `KbqPopUpTrigger` default enter delay (400 ms) plus a buffer.
        await vi.advanceTimersByTimeAsync(410);
        fixture.detectChanges();

        const containerElement = overlayContainer.getContainerElement();

        expect(containerElement.querySelector('.kbq-tooltip')).toBeTruthy();

        service.show({ title: 'Saved' }, 0);
        TestBed.inject(ApplicationRef).tick();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        // Without a reflow notification (the jsdom default) the tooltip survives.
        expect(containerElement.querySelector('.kbq-tooltip')).toBeTruthy();

        resized.next([]);
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(containerElement.querySelector('.kbq-tooltip')).toBeNull();

        service.ngOnDestroy();
        await vi.runOnlyPendingTimersAsync();
    });
});
