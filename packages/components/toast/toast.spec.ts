import { AnimationEvent } from '@angular/animations';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import {
    CdkScrollable,
    Overlay,
    OverlayContainer,
    OverlayRef,
    ScrollDispatcher,
    ScrollStrategy
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ApplicationRef, Component, ElementRef, NgZone, TemplateRef, ViewChild, viewChild } from '@angular/core';
import { TestBed, discardPeriodicTasks, fakeAsync, flush, inject, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchMouseEvent } from '@koobiq/cdk/testing';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { NEVER, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KbqToastContainerComponent } from './toast-container.component';
import { KbqToastModule } from './toast.module';
import { KbqToastService } from './toast.service';
import { KbqToastData } from './toast.type';

const MOCK_TOAST_DATA: KbqToastData = {
    style: 'warning',
    title: 'Warning',
    content: 'Message Content',
    closeButton: true
};

describe('ToastService', () => {
    let toastService: KbqToastService;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let fixture;
    let testComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqToastModule,
                NoopAnimationsModule,
                KbqToastButtonWrapperComponent
            ]
        }).compileComponents();
    });

    beforeEach(inject([KbqToastService, OverlayContainer], (ts: KbqToastService, oc: OverlayContainer) => {
        toastService = ts;
        overlayContainer = oc;
        overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('should bring no break change', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(KbqToastButtonWrapperComponent);
            testComponent = fixture.componentInstance;
        });

        afterEach(fakeAsync(() => {
            // wait all openModals to be closed to clean up the ModalManager as it is globally static
            overlayContainer.ngOnDestroy();
            fixture.detectChanges();
            tick(1000);
        }));

        it('should create one sticky toast', () => {
            toastService.show({ style: 'success', title: 'Success', content: 'Message Content' }, 0);
            expect(toastService.toasts.length).toBe(1);
        });

        it('should create one sticky warning toast', () => {
            toastService.show(MOCK_TOAST_DATA, 0);
            expect(toastService.toasts[0].instance.data.style).toBe('warning');
        });

        it('should create one sticky warning toast with default icon', () => {
            const toast = toastService.show({ style: 'warning', title: 'Warning', icon: true }, 0);

            fixture.detectChanges();

            const toastIcon: HTMLElement = toast.ref.location.nativeElement.querySelector('.kbq-toast__icon');

            expect(toastIcon.classList).toContain('kbq-triangle-exclamation_16');
        });

        it('should create one sticky warning toast with custom icon', () => {
            const toast = toastService.show({ style: 'error', title: 'Error', icon: true, iconClass: 'kbq-custom' }, 0);

            fixture.detectChanges();

            const toastIcon: HTMLElement = toast.ref.location.nativeElement.querySelector('.kbq-toast__icon');

            expect(toastIcon.classList).toContain('kbq-custom');
        });

        it('should container only title', () => {
            toastService.show({ style: 'success', title: 'Success' }, 0);
            expect(toastService.toasts[0].instance.data.title).toBe('Success');
            expect(toastService.toasts[0].instance.data.content).toBe(undefined);
        });

        it('should delete toast', () => {
            toastService.show(MOCK_TOAST_DATA, 0);
            const openToast = toastService.toasts[0].instance;

            expect(toastService.toasts.length).toBe(1);
            fixture.detectChanges();

            toastService.hide(openToast.id);
            fixture.detectChanges();
            expect(toastService.toasts.length).toBe(0);
        });

        it('should delete one toast by click', fakeAsync(() => {
            const hideSpyFn = jest.spyOn(toastService, 'hide');
            const toast = toastService.show(MOCK_TOAST_DATA, 0);

            fixture.detectChanges();
            tick(600);
            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(1);

            const button = toast.ref.location.nativeElement.querySelector(
                '[kbq-toast-close-button]'
            ) as HTMLButtonElement;

            button.click();

            fixture.detectChanges();
            tick(600);

            expect(hideSpyFn).toHaveBeenCalledTimes(1);
            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(0);
        }));

        it('should create one toast directly through service', fakeAsync(() => {
            const showSpyFn = jest.spyOn(toastService, 'show');

            toastService.show(MOCK_TOAST_DATA, 600);

            fixture.detectChanges();
            tick(600);
            fixture.detectChanges();

            expect(showSpyFn).toHaveBeenCalledTimes(1);
            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(1);
        }));

        it('should create one toast by click', fakeAsync(() => {
            const showSpyFn = jest.spyOn(testComponent, 'show');
            const btn = fixture.nativeElement.querySelector('button');

            fixture.detectChanges();
            expect(showSpyFn).not.toHaveBeenCalled();

            btn.click();
            fixture.detectChanges();

            expect(showSpyFn).toHaveBeenCalledTimes(1);
            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(1);
        }));
    });
});

describe('Standalone ToastService', () => {
    let service: KbqToastService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqToastModule, NoopAnimationsModule, KbqToastButtonWrapperComponent]
        }).compileComponents();
    });

    it('should disappear after 3 seconds', fakeAsync(() => {
        const destroy$ = new Subject<void>();

        service = TestBed.inject(KbqToastService);
        service.timer = service.timer.pipe(takeUntil(destroy$));

        service.show(MOCK_TOAST_DATA, 3000);
        expect(service.toasts.length).toEqual(1);
        tick(3100);
        destroy$.next();
        tick();

        expect(service.toasts.length).toEqual(0);
        flush();
        discardPeriodicTasks();
    }));

    it('should call timer outsideAngular', fakeAsync(() => {
        const destroy$ = new Subject<void>();

        service = TestBed.inject(KbqToastService);
        service.timer.subscribe(() => expect(NgZone.isInAngularZone()).toBeFalsy());
        service.timer = service.timer.pipe(takeUntil(destroy$));

        service.show(MOCK_TOAST_DATA, 3000);
        tick(3100);
        destroy$.next();

        flush();
        discardPeriodicTasks();
    }));
});

@Component({
    selector: 'kbq-toast-test-button',
    imports: [KbqToastModule],
    template: `
        <button (click)="show()">Show</button>
    `
})
class KbqToastButtonWrapperComponent {
    constructor(public toastService: KbqToastService) {}
    show(): void {
        this.toastService.show({ style: 'warning', title: 'Warning', content: 'Message Content' }, 0);
    }
}

@Component({
    selector: 'kbq-toast-template-wrapper',
    imports: [KbqToastModule],
    template: `
        <ng-template #tpl>tpl</ng-template>
    `
})
class KbqToastTemplateWrapperComponent {
    @ViewChild('tpl', { static: true }) template!: TemplateRef<unknown>;
}

describe('ToastService regression: multiple containers / cleanup', () => {
    let service: KbqToastService;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqToastModule, NoopAnimationsModule, KbqToastTemplateWrapperComponent]
        }).compileComponents();

        service = TestBed.inject(KbqToastService);
        overlayContainer = TestBed.inject(OverlayContainer);
        overlayContainerElement = overlayContainer.getContainerElement();
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    it('disposes overlay on service destroy so re-bootstrap does not leak a second container', () => {
        service.show(MOCK_TOAST_DATA, 0);
        expect(overlayContainerElement.querySelectorAll('.kbq-toast-overlay').length).toBe(1);

        service.ngOnDestroy();
        expect(overlayContainerElement.querySelectorAll('.kbq-toast-overlay').length).toBe(0);
    });

    it('hideTemplate removes by returned id (regression: off-by-one)', () => {
        const fixture = TestBed.createComponent(KbqToastTemplateWrapperComponent);

        fixture.detectChanges();

        const { id } = service.showTemplate(MOCK_TOAST_DATA, fixture.componentInstance.template, 0);

        expect(service.templates.length).toBe(1);

        service.hideTemplate(id);
        expect(service.templates.length).toBe(0);
    });

    it('keeps container alive while templates are visible after the last toast is hidden', () => {
        const fixture = TestBed.createComponent(KbqToastTemplateWrapperComponent);

        fixture.detectChanges();

        const toast = service.show(MOCK_TOAST_DATA, 0);

        service.showTemplate(MOCK_TOAST_DATA, fixture.componentInstance.template, 0);

        service.hide(toast.id);

        expect(service.templates.length).toBe(1);
        expect(overlayContainerElement.querySelectorAll('kbq-toast-container').length).toBe(1);
    });
});

@Component({
    selector: 'toast-tooltip-wrapper',
    imports: [KbqToolTipModule],
    template: `
        <button [kbqTooltip]="'TOOLTIP_CONTENT'">Trigger</button>
    `
})
class ToastTooltipWrapper {
    readonly triggerElementRef = viewChild.required(KbqTooltipTrigger, { read: ElementRef });
}

@Component({
    selector: 'toast-overlay-content',
    template: 'OVERLAY_CONTENT'
})
class ToastOverlayContent {}

describe('ToastService: stack reflow', () => {
    // `KbqTooltipTrigger` default enter delay (400ms) plus a buffer for the deferred show.
    const tooltipEnterDelay = 410;

    let resized: Subject<void>;
    let service: KbqToastService;
    let overlay: Overlay;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let scrolled: jest.Mock;
    let scrollSubscription: Subscription;

    /** Emulates what the animation callbacks of every toast push into `KbqToastService.animation`. */
    const emitToastAnimationEvent = () =>
        service.animation.next({
            fromState: 'void',
            toState: 'visible',
            totalTime: 0,
            phaseName: 'done',
            element: document.createElement('div'),
            triggerName: 'state',
            disabled: false
        } satisfies AnimationEvent);

    beforeEach(() => {
        resized = new Subject<void>();

        TestBed.configureTestingModule({
            imports: [KbqToastModule, NoopAnimationsModule, ToastTooltipWrapper, KbqToastTemplateWrapperComponent],
            // jsdom performs no layout, so the real observer would never fire, and a check that nothing reaches
            // the scroll dispatcher would pass without a reflow ever happening. Keyed on the container, so that
            // the `kbq-title` directives inside a toast neither share the subject nor count as its observers.
            providers: [
                {
                    provide: SharedResizeObserver,
                    useValue: {
                        observe: (target: Element) =>
                            target.classList.contains('kbq-toast-container') ? resized : NEVER
                    }
                }
            ]
        }).compileComponents();

        service = TestBed.inject(KbqToastService);
        overlay = TestBed.inject(Overlay);
        overlayContainer = TestBed.inject(OverlayContainer);
        overlayContainerElement = overlayContainer.getContainerElement();
        // `scrolled(0)` and `CloseScrollStrategy` deliver synchronously, so no flushing is needed.
        scrolled = jest.fn();
        scrollSubscription = TestBed.inject(ScrollDispatcher).scrolled(0).subscribe(scrolled);
    });

    afterEach(() => {
        scrollSubscription.unsubscribe();
        service.ngOnDestroy();
        overlayContainer.ngOnDestroy();
    });

    /** The container registers itself as a scrollable in `ngOnInit`, which needs a change-detection pass to run. */
    const showToast = () => {
        const { id } = service.show(MOCK_TOAST_DATA, 0);

        TestBed.inject(ApplicationRef).tick();

        return id;
    };

    /** Shows a toast the way a browser reports it: the stack's box changes size. */
    const showToastAndReflow = () => {
        const id = showToast();

        resized.next();

        return id;
    };

    /** The strategies only subscribe once the overlay is actually attached. */
    const attachConnectedOverlay = (scrollStrategy: ScrollStrategy): OverlayRef => {
        const overlayRef = overlay.create({
            positionStrategy: overlay
                .position()
                .flexibleConnectedTo(document.body)
                .withPositions([{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }]),
            scrollStrategy
        });

        overlayRef.attach(new ComponentPortal(ToastOverlayContent));

        return overlayRef;
    };

    it('does not notify the global ScrollDispatcher when the stack reflows', () => {
        const id = showToastAndReflow();

        // A second toast keeps the stack alive across the removal, so the reflow it causes reaches a container.
        showToastAndReflow();
        emitToastAnimationEvent();
        service.hide(id);
        TestBed.inject(ApplicationRef).tick();
        resized.next();

        expect(resized.observed).toBe(true);
        expect(scrolled).not.toHaveBeenCalled();
    });

    it('keeps an overlay with the close-on-scroll strategy attached when a toast appears', () => {
        // Models a third-party overlay (the reported case is a Mosaic popover in a micro-frontend):
        // `CloseScrollStrategy` detaches on any emission that did not originate inside its own overlay.
        const overlayRef = overlay.create({ scrollStrategy: overlay.scrollStrategies.close() });

        overlayRef.attach(new ComponentPortal(ToastOverlayContent));

        showToastAndReflow();

        expect(overlayRef.hasAttached()).toBe(true);

        overlayRef.dispose();
    });

    it('keeps an open tooltip open when a toast appears', fakeAsync(() => {
        const fixture = TestBed.createComponent(ToastTooltipWrapper);

        fixture.detectChanges();

        dispatchMouseEvent(fixture.componentInstance.triggerElementRef().nativeElement, 'mouseenter');
        fixture.detectChanges();
        tick(tooltipEnterDelay);
        fixture.detectChanges();
        expect(overlayContainerElement.querySelector('.kbq-tooltip')).toBeTruthy();

        showToastAndReflow();
        tick();
        fixture.detectChanges();

        expect(overlayContainerElement.querySelector('.kbq-tooltip')).toBeTruthy();

        flush();
        discardPeriodicTasks();
    }));

    it('repositions an overlay anchored to an element when the stack reflows', () => {
        showToast();

        const overlayRef = attachConnectedOverlay(overlay.scrollStrategies.reposition());
        const updatePosition = jest.spyOn(overlayRef, 'updatePosition');

        resized.next();

        expect(updatePosition).toHaveBeenCalled();

        overlayRef.dispose();
    });

    it('repositions an anchored overlay that closes on scroll without closing it', () => {
        showToast();

        const overlayRef = attachConnectedOverlay(overlay.scrollStrategies.close());
        const updatePosition = jest.spyOn(overlayRef, 'updatePosition');

        resized.next();

        expect(updatePosition).toHaveBeenCalled();
        expect(overlayRef.hasAttached()).toBe(true);

        overlayRef.dispose();
    });

    it('repositions on a reflow caused by a template toast, which is removed without an animation', () => {
        const fixture = TestBed.createComponent(KbqToastTemplateWrapperComponent);

        fixture.detectChanges();

        // A second toast has to outlive the removal, otherwise the whole overlay — container included —
        // is torn down and there is nothing left to watch the stack.
        showToast();

        const { id } = service.showTemplate({}, fixture.componentInstance.template, 0);

        TestBed.inject(ApplicationRef).tick();

        const overlayRef = attachConnectedOverlay(overlay.scrollStrategies.reposition());
        const updatePosition = jest.spyOn(overlayRef, 'updatePosition');

        // A template toast carries no `@state` binding, so its removal fires no animation event —
        // watching the container's box is what makes this case reposition at all.
        service.hideTemplate(id);
        resized.next();

        expect(updatePosition).toHaveBeenCalled();

        overlayRef.dispose();
    });

    it('stops watching the stack once the container is destroyed', () => {
        showToast();

        expect(resized.observed).toBe(true);

        service.ngOnDestroy();

        expect(resized.observed).toBe(false);
    });

    it('keeps the container registered as a scrollable, so a real scroll still reaches the dispatcher', () => {
        showToast();

        const container = overlayContainerElement.querySelector('kbq-toast-container')!;

        container.dispatchEvent(new Event('scroll'));

        expect(scrolled).toHaveBeenCalledTimes(1);
        expect((scrolled.mock.calls[0][0] as CdkScrollable).getElementRef().nativeElement).toBe(container);
    });

    it('dispatches a scroll event on the container element when `dispatchScrollEvent` is called explicitly', () => {
        const fixture = TestBed.createComponent(KbqToastContainerComponent);
        const onScroll = jest.fn();

        fixture.detectChanges();
        fixture.nativeElement.addEventListener('scroll', onScroll);

        // Called detached, because the deprecated API is documented as a callback and must stay bound.
        const { dispatchScrollEvent } = fixture.componentInstance;

        dispatchScrollEvent();

        expect(onScroll).toHaveBeenCalled();
    });
});
