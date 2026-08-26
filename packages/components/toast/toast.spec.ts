import { AnimationEvent } from '@angular/animations';
import { FocusMonitor } from '@angular/cdk/a11y';
import { ESCAPE } from '@angular/cdk/keycodes';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { CdkScrollable, Overlay, OverlayContainer, OverlayRef, ScrollDispatcher } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
    ApplicationRef,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    NgZone,
    TemplateRef,
    ValueProvider,
    inject,
    viewChild
} from '@angular/core';
import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchKeyboardEvent, dispatchMouseEvent, kbqShadowDomOverlayProvider } from '@koobiq/components/core';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { axe } from 'jest-axe';
import { Subject, Subscription } from 'rxjs';
import { KbqToastContainerComponent } from './toast-container.component';
import { KbqToastComponent } from './toast.component';
import { KbqToastModule } from './toast.module';
import { KBQ_TOAST_FACTORY, KbqToastService } from './toast.service';
import {
    KbqToastConfig,
    KbqToastData,
    KbqToastPosition,
    KbqToastStyle,
    defaultToastConfig,
    kbqToastConfigurationProvider
} from './toast.type';

/** Mirrors `CHECK_INTERVAL` in the service: the countdown is driven by a heartbeat of that period. */
const CHECK_INTERVAL = 500;

/** Mirrors `EXIT_ANIMATION_FALLBACK`: how long the overlay waits for the last exit animation. */
const EXIT_ANIMATION_FALLBACK = 500;

/** A fresh object per call — the service and the component must never write into the caller's data. */
const createToastData = (overrides: KbqToastData = {}): KbqToastData => ({
    style: KbqToastStyle.Warning,
    title: 'Warning',
    content: 'Message Content',
    closeButton: true,
    ...overrides
});

/** The overlay waits for the exit of the toast that emptied the stack, so the element has to be that toast's. */
const exitAnimationEvent = (element: HTMLElement): AnimationEvent => ({
    fromState: 'visible',
    toState: 'void',
    totalTime: 0,
    phaseName: 'done',
    element,
    triggerName: 'state',
    disabled: false
});

@Component({
    selector: 'toast-test-button',
    imports: [KbqToastModule],
    template: `
        <button (click)="show()">Show</button>
    `
})
class ToastButtonWrapper {
    readonly toastService = inject(KbqToastService);

    show(): void {
        this.toastService.show(createToastData(), 0);
    }
}

@Component({
    selector: 'toast-template-wrapper',
    imports: [KbqToastModule],
    template: `
        <ng-template #tpl><div>tpl</div></ng-template>
    `
})
class ToastTemplateWrapper {
    readonly template = viewChild.required<TemplateRef<unknown>>('tpl');
}

/** Substituted through `KBQ_TOAST_FACTORY`: the service must create this instead of `KbqToastComponent`. */
@Component({
    selector: 'custom-toast',
    template: 'custom',
    changeDetection: ChangeDetectionStrategy.OnPush
})
class CustomToast extends KbqToastComponent {}

/** Not a `KbqToastComponent`, so it carries no numeric `id` for the service to key its stack by. */
@Component({
    selector: 'idless-toast',
    template: 'idless',
    changeDetection: ChangeDetectionStrategy.OnPush
})
class IdlessToast {}

const DETACH_PROBE_TAG = 'toast-detach-probe';

let detachProbeCount = 0;

/** Counts detaches of the subtree it is planted in — jsdom runs the reaction synchronously. */
class DetachProbe extends HTMLElement {
    disconnectedCallback(): void {
        detachProbeCount++;
    }
}

customElements.define(DETACH_PROBE_TAG, DetachProbe);

describe('KbqToastService', () => {
    let service: KbqToastService;
    let appRef: ApplicationRef;
    let focusMonitor: FocusMonitor;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    /** Renders everything the service has created — the container lives in an overlay, not in a fixture. */
    const render = () => appRef.tick();

    const showRendered = (data: KbqToastData = createToastData(), duration = 0) => {
        const toast = service.show(data, duration);

        render();

        return toast;
    };

    const hostOf = (toast: { ref: { location: ElementRef } }): HTMLElement => toast.ref.location.nativeElement;

    const closeButtonOf = (toast: { ref: { location: ElementRef } }): HTMLButtonElement =>
        hostOf(toast).querySelector<HTMLButtonElement>('[kbq-toast-close-button]')!;

    const containers = () => overlayContainerElement.querySelectorAll('kbq-toast-container');

    /** Releases everything the service scheduled, so that no fake timer survives the spec. */
    const settle = () => {
        service.ngOnDestroy();
        flush();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqToastModule, NoopAnimationsModule, ToastButtonWrapper, ToastTemplateWrapper]
        });

        service = TestBed.inject(KbqToastService);
        appRef = TestBed.inject(ApplicationRef);
        focusMonitor = TestBed.inject(FocusMonitor);
        overlayContainer = TestBed.inject(OverlayContainer);
        overlayContainerElement = overlayContainer.getContainerElement();
    });

    afterEach(() => {
        service.ngOnDestroy();
        overlayContainer.ngOnDestroy();
    });

    describe('rendering', () => {
        it('renders a toast inside the overlay', () => {
            showRendered();

            expect(service.toasts.length).toBe(1);
            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(1);
            expect(overlayContainerElement.querySelectorAll('.kbq-toast-overlay').length).toBe(1);
        });

        it('carries the style as a host class', () => {
            const toast = showRendered(createToastData({ style: KbqToastStyle.Warning }));

            expect(hostOf(toast).classList).toContain('kbq-toast_warning');
        });

        it('falls back to the contrast style when none is given', () => {
            const toast = showRendered(createToastData({ style: undefined }));

            expect(hostOf(toast).classList).toContain('kbq-toast_contrast');
        });

        it('renders the default icon of the style', () => {
            const toast = showRendered(createToastData({ style: KbqToastStyle.Warning, icon: true }));

            expect(hostOf(toast).querySelector('.kbq-toast__icon')!.classList).toContain('kbq-triangle-exclamation_16');
        });

        it('renders a custom icon class next to the default glyph', () => {
            const toast = showRendered(
                createToastData({ style: KbqToastStyle.Error, icon: true, iconClass: 'kbq-custom' })
            );

            expect(hostOf(toast).querySelector('.kbq-toast__icon')!.classList).toContain('kbq-custom');
        });

        it('renders only the title when nothing else is given', () => {
            const toast = showRendered(createToastData({ content: undefined, caption: undefined, title: 'Success' }));

            expect(hostOf(toast).querySelector('.kbq-toast__title')!.textContent).toContain('Success');
            expect(hostOf(toast).querySelector('.kbq-toast__content')).toBeNull();
        });

        it('leaves the caller-owned data untouched', () => {
            const data = Object.freeze(createToastData({ style: undefined, icon: undefined, closeButton: undefined }));

            expect(() => showRendered(data)).not.toThrow();
            expect(data.style).toBeUndefined();
            expect(Object.prototype.hasOwnProperty.call(data, 'iconClass')).toBe(false);
        });

        it('shows a toast from a click', () => {
            const fixture = TestBed.createComponent(ToastButtonWrapper);

            fixture.detectChanges();
            fixture.nativeElement.querySelector('button').click();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(1);
        });
    });

    describe('stack order', () => {
        const hosts = () => Array.from(overlayContainerElement.querySelectorAll('kbq-toast'));

        it('appends a new toast below the ones already on screen', () => {
            const first = showRendered();
            const second = showRendered();

            expect(hosts()[0]).toBe(hostOf(first));
            expect(hosts()[1]).toBe(hostOf(second));
        });

        it('puts a new toast above the ones already on screen when `onTop` is set', () => {
            const first = showRendered();
            const second = service.show(createToastData(), 0, true);

            render();

            expect(hosts()[0]).toBe(hostOf(second));
            expect(hosts()[1]).toBe(hostOf(first));
        });
    });

    describe('dismissal', () => {
        it('removes a toast by id', () => {
            const toast = showRendered();

            service.hide(toast.id);

            expect(service.toasts.length).toBe(0);
        });

        it('removes a toast through the close button', fakeAsync(() => {
            const toast = showRendered();

            closeButtonOf(toast).click();
            // The toast leaves the service synchronously; taking its element out of the DOM is the
            // animation engine's job and lands on the next flush.
            flush();
            render();

            expect(overlayContainerElement.querySelectorAll('kbq-toast').length).toBe(0);

            settle();
        }));

        it('removes a toast on Escape', () => {
            const toast = showRendered();

            dispatchKeyboardEvent(hostOf(toast), 'keydown', ESCAPE, undefined, 'Escape');

            expect(service.toasts.length).toBe(0);
        });

        it('keeps a sticky toast well past the default duration', fakeAsync(() => {
            showRendered(createToastData(), 0);

            tick(10000);

            expect(service.toasts.length).toBe(1);
            settle();
        }));

        it('removes a toast once its duration has run out', fakeAsync(() => {
            showRendered(createToastData(), 3000);

            tick(3000 + CHECK_INTERVAL);

            expect(service.toasts.length).toBe(0);
            settle();
        }));

        it('keeps a long-lived survivor for its own duration after a short toast expires', fakeAsync(() => {
            showRendered(createToastData(), 1000);
            showRendered(createToastData(), 30000);

            tick(1000 + CHECK_INTERVAL);
            expect(service.toasts.length).toBe(1);

            // Far past the 2000 ms delay the survivor used to be pinned to.
            tick(5000);
            expect(service.toasts.length).toBe(1);

            settle();
        }));

        it('gives a survivor of a manual close at least the configured delay', fakeAsync(() => {
            const first = showRendered(createToastData(), 5000);

            showRendered(createToastData(), 500);

            service.hide(first.id);

            tick(500 + CHECK_INTERVAL);
            expect(service.toasts.length).toBe(1);

            tick(defaultToastConfig.delay);
            expect(service.toasts.length).toBe(0);

            settle();
        }));
    });

    describe('pause', () => {
        it('pauses the whole stack while one toast is hovered', fakeAsync(() => {
            const hovered = showRendered(createToastData(), 3000);

            showRendered(createToastData(), 3000);

            dispatchMouseEvent(hostOf(hovered), 'mouseenter');
            tick(10000);

            expect(service.toasts.length).toBe(2);
            settle();
        }));

        it('resumes the countdown once the pointer leaves', fakeAsync(() => {
            const toast = showRendered(createToastData(), 3000);

            dispatchMouseEvent(hostOf(toast), 'mouseenter');
            tick(5000);
            dispatchMouseEvent(hostOf(toast), 'mouseleave');
            tick(3000 + CHECK_INTERVAL);

            expect(service.toasts.length).toBe(0);
            settle();
        }));

        it('keeps the pause when a sibling is dismissed', fakeAsync(() => {
            const hovered = showRendered(createToastData(), 3000);
            const sibling = showRendered(createToastData(), 3000);

            dispatchMouseEvent(hostOf(hovered), 'mouseenter');
            service.hide(sibling.id);
            tick(10000);

            expect(service.toasts.length).toBe(1);
            settle();
        }));

        it('pauses the stack while a toast holds the focus', fakeAsync(() => {
            const toast = showRendered(createToastData(), 3000);

            focusMonitor.focusVia(closeButtonOf(toast), 'keyboard');
            tick(10000);

            expect(service.toasts.length).toBe(1);
            settle();
        }));
    });

    describe('read state', () => {
        let read: KbqToastData[];
        let subscription: Subscription;

        beforeEach(() => {
            read = [];
            subscription = service.read.subscribe((data) => {
                if (data) {
                    read.push(data);
                }
            });
        });

        afterEach(() => subscription.unsubscribe());

        it('reports a toast as read when it is closed', () => {
            const data = createToastData();
            const toast = showRendered(data);

            closeButtonOf(toast).click();

            expect(read).toEqual([data]);
        });

        it('reports a toast as read exactly once across repeated hover cycles and a close', fakeAsync(() => {
            const toast = showRendered();
            const host = hostOf(toast);

            for (let cycle = 0; cycle < 3; cycle++) {
                dispatchMouseEvent(host, 'mouseenter');
                tick(600);
                dispatchMouseEvent(host, 'mouseleave');
            }

            closeButtonOf(toast).click();

            expect(read.length).toBe(1);
            settle();
        }));
    });

    describe('focus', () => {
        it('hands the focus to a surviving toast instead of dropping it on the body', fakeAsync(() => {
            const survivor = showRendered();
            const closing = showRendered();

            focusMonitor.focusVia(closeButtonOf(closing), 'keyboard');
            tick();

            service.hide(closing.id);
            tick();

            expect(hostOf(survivor).contains(document.activeElement)).toBe(true);
            settle();
        }));

        it('hands the focus back to the trigger when the last toast closes', fakeAsync(() => {
            const trigger = document.createElement('button');

            document.body.appendChild(trigger);
            trigger.focus();

            const toast = showRendered();

            focusMonitor.focusVia(closeButtonOf(toast), 'keyboard');
            tick();

            service.hide(toast.id);
            tick();

            expect(document.activeElement).toBe(trigger);

            trigger.remove();
            settle();
        }));

        it('leaves the focus where the browser put it when a toast is dismissed with the mouse', fakeAsync(() => {
            const survivor = showRendered(createToastData(), 3000);
            const closing = showRendered(createToastData(), 3000);

            // Pressing a button with the mouse focuses it, so a plain click reports a focused toast.
            focusMonitor.focusVia(closeButtonOf(closing), 'mouse');
            tick();

            service.hide(closing.id);
            tick();

            expect(hostOf(survivor).contains(document.activeElement)).toBe(false);

            // Handing the focus to the survivor would report it as focused and pause the stack for good.
            tick(3000 + CHECK_INTERVAL);
            expect(service.toasts.length).toBe(0);

            settle();
        }));
    });

    describe('templates', () => {
        let template: TemplateRef<unknown>;

        beforeEach(() => {
            const fixture = TestBed.createComponent(ToastTemplateWrapper);

            fixture.detectChanges();
            template = fixture.componentInstance.template();
        });

        it('passes the toast data as the template context', () => {
            const data = createToastData();
            const { ref } = service.showTemplate(data, template, 0);

            expect(ref.context.$implicit).toBe(data);
        });

        it('removes a template by the returned id', () => {
            const { id } = service.showTemplate(createToastData(), template, 0);

            expect(service.templates.length).toBe(1);

            service.hideTemplate(id);

            expect(service.templates.length).toBe(0);
        });

        it('keeps a template with a zero duration on screen', fakeAsync(() => {
            service.showTemplate(createToastData(), template, 0);

            tick(10000);

            expect(service.templates.length).toBe(1);
            settle();
        }));

        it('removes a template once its duration has run out', fakeAsync(() => {
            service.showTemplate(createToastData(), template, 1000);

            tick(1000 + CHECK_INTERVAL);

            expect(service.templates.length).toBe(0);
            settle();
        }));

        it('omits destroyed views from `templates`', () => {
            const { ref } = service.showTemplate(createToastData(), template, 0);

            ref.destroy();

            expect(service.templates.length).toBe(0);
        });

        it('stops the heartbeat and releases the overlay when a view is destroyed from outside', fakeAsync(() => {
            let ticks = 0;
            const subscription = service.timer.subscribe(() => ticks++);
            const { ref } = service.showTemplate(createToastData(), template, 0);

            // A sticky record is never touched by the countdown, so only a purge can drop it.
            ref.destroy();
            tick(CHECK_INTERVAL);

            const afterPurge = ticks;

            tick(EXIT_ANIMATION_FALLBACK + CHECK_INTERVAL * 4);

            expect(ticks).toBe(afterPurge);
            expect(containers().length).toBe(0);

            subscription.unsubscribe();
            settle();
        }));

        it('keeps the container alive while templates are visible', () => {
            const toast = showRendered();

            service.showTemplate(createToastData(), template, 0);
            service.hide(toast.id);

            expect(containers().length).toBe(1);
        });
    });

    describe('overlay lifecycle', () => {
        it('does not take the overlay out of the DOM to put it back on top of itself', fakeAsync(() => {
            // A foreign overlay, so that the stacking step engages at all: with the toast overlay alone in
            // the container there is nothing for it to be moved past.
            const foreign = document.createElement('div');

            overlayContainerElement.appendChild(foreign);
            showRendered();

            // Planted inside the overlay because a custom element reports its own detach synchronously,
            // which is exactly what re-inserting the wrapper above it does to every live toast: the live
            // region is announced again and the entrance animations restart.
            detachProbeCount = 0;
            overlayContainerElement
                .querySelector('.kbq-toast-overlay')!
                .appendChild(document.createElement(DETACH_PROBE_TAG));

            showRendered();

            expect(detachProbeCount).toBe(0);

            foreign.remove();
            settle();
        }));

        it('keeps the overlay attached until the exit animation reports done', fakeAsync(() => {
            const toast = showRendered();

            service.hide(toast.id);
            expect(containers().length).toBe(1);

            service.animation.next(exitAnimationEvent(hostOf(toast)));
            // The overlay is detached synchronously; removing the host element is the animation engine's
            // job and lands on the next flush.
            flush();
            render();

            expect(containers().length).toBe(0);

            flush();
        }));

        it('waits for the exit of the toast that emptied the stack, not for one dismissed earlier', fakeAsync(() => {
            const first = showRendered();
            const second = showRendered();
            const detach = jest.spyOn(OverlayRef.prototype, 'detach');

            // `first` starts leaving while `second` is still on screen, so its `done` lands after the
            // stack is already empty — and `second` is only halfway through its own slide-out.
            service.hide(first.id);
            service.hide(second.id);

            service.animation.next(exitAnimationEvent(hostOf(first)));
            expect(detach).not.toHaveBeenCalled();

            service.animation.next(exitAnimationEvent(hostOf(second)));
            expect(detach).toHaveBeenCalled();

            detach.mockRestore();
            settle();
        }));

        it('detaches the overlay through the fallback when nothing animates', fakeAsync(() => {
            const fixture = TestBed.createComponent(ToastTemplateWrapper);

            fixture.detectChanges();

            const { id } = service.showTemplate(createToastData(), fixture.componentInstance.template(), 0);

            service.hideTemplate(id);
            expect(containers().length).toBe(1);

            tick(EXIT_ANIMATION_FALLBACK);
            expect(containers().length).toBe(0);
        }));

        it('does not accumulate containers across show and hide cycles', fakeAsync(() => {
            for (let cycle = 0; cycle < 3; cycle++) {
                const toast = showRendered();

                service.hide(toast.id);
                tick(EXIT_ANIMATION_FALLBACK);
            }

            showRendered();

            expect(containers().length).toBe(1);
            settle();
        }));

        it('disposes the overlay on destroy, so a re-bootstrap does not leak a second container', () => {
            showRendered();
            expect(overlayContainerElement.querySelectorAll('.kbq-toast-overlay').length).toBe(1);

            service.ngOnDestroy();

            expect(overlayContainerElement.querySelectorAll('.kbq-toast-overlay').length).toBe(0);
        });
    });

    describe('heartbeat', () => {
        it('ticks outside the Angular zone', fakeAsync(() => {
            let ticks = 0;
            let ticksInsideAngular = 0;
            const subscription = service.timer.subscribe(() => {
                ticks++;

                if (NgZone.isInAngularZone()) {
                    ticksInsideAngular++;
                }
            });

            showRendered();
            tick(CHECK_INTERVAL * 3);

            expect(ticks).toBeGreaterThan(0);
            expect(ticksInsideAngular).toBe(0);

            subscription.unsubscribe();
            settle();
        }));

        it('does not tick while the stack is empty', fakeAsync(() => {
            let ticks = 0;
            const subscription = service.timer.subscribe(() => ticks++);

            tick(CHECK_INTERVAL * 4);
            expect(ticks).toBe(0);

            showRendered();
            tick(CHECK_INTERVAL);
            expect(ticks).toBe(1);

            subscription.unsubscribe();
            settle();
        }));

        it('leaves no periodic task behind after destroy', fakeAsync(() => {
            let ticks = 0;
            const subscription = service.timer.subscribe(() => ticks++);

            showRendered();
            tick(CHECK_INTERVAL);

            const before = ticks;

            service.ngOnDestroy();
            tick(CHECK_INTERVAL * 4);

            expect(ticks).toBe(before);
            subscription.unsubscribe();
        }));
    });

    describe('accessibility', () => {
        it('announces an error as an alert', () => {
            const toast = showRendered(createToastData({ style: KbqToastStyle.Error }));

            expect(hostOf(toast).getAttribute('role')).toBe('alert');
            expect(hostOf(toast).getAttribute('aria-atomic')).toBe('true');
        });

        it('announces a warning as an alert', () => {
            const toast = showRendered(createToastData({ style: KbqToastStyle.Warning }));

            expect(hostOf(toast).getAttribute('role')).toBe('alert');
        });

        it('announces a neutral message as a status', () => {
            const toast = showRendered(createToastData({ style: KbqToastStyle.Contrast }));

            expect(hostOf(toast).getAttribute('role')).toBe('status');
        });

        it('marks a template toast as a status', () => {
            const fixture = TestBed.createComponent(ToastTemplateWrapper);

            fixture.detectChanges();
            service.showTemplate(createToastData(), fixture.componentInstance.template(), 0);
            render();

            expect(overlayContainerElement.querySelector('[role="status"]')).toBeTruthy();
        });

        it('renders the close button as a named native button', () => {
            const toast = showRendered();
            const closeButton = closeButtonOf(toast);

            expect(closeButton.tagName).toBe('BUTTON');
            expect(closeButton.getAttribute('type')).toBe('button');
            expect(closeButton.getAttribute('aria-label')).toBeTruthy();
        });

        it('hides the decorative status icon from assistive tech', () => {
            const toast = showRendered(createToastData({ icon: true }));

            expect(hostOf(toast).querySelector('.kbq-toast__icon')!.getAttribute('aria-hidden')).toBe('true');
        });

        it('exposes the stack as a labelled region', () => {
            showRendered();

            const container = containers()[0];

            expect(container.getAttribute('role')).toBe('region');
            expect(container.getAttribute('aria-label')).toBeTruthy();
        });

        it('has no axe violations', async () => {
            showRendered(createToastData({ caption: 'Caption' }));

            expect(await axe(overlayContainerElement)).toHaveNoViolations();
        });
    });
});

describe('KbqToastService configuration', () => {
    const configure = (config: Partial<KbqToastConfig> = {}): KbqToastService => {
        TestBed.configureTestingModule({
            imports: [KbqToastModule, NoopAnimationsModule],
            providers: [kbqToastConfigurationProvider(config)]
        });

        return TestBed.inject(KbqToastService);
    };

    const containers = () =>
        TestBed.inject(OverlayContainer).getContainerElement().querySelectorAll('kbq-toast-container');

    afterEach(() => TestBed.inject(OverlayContainer).ngOnDestroy());

    Object.values(KbqToastPosition).forEach((position) => {
        it(`anchors the stack at ${position}`, () => {
            const service = configure({ position });

            service.show(createToastData(), 0);

            expect(containers()[0].classList).toContain(`kbq-toast-container-${position}`);
            service.ngOnDestroy();
        });
    });

    it('drains the stack instead of stranding it when the position moves underneath', () => {
        const provider = kbqToastConfigurationProvider({ position: KbqToastPosition.TOP_RIGHT }) as ValueProvider;

        TestBed.configureTestingModule({
            imports: [KbqToastModule, NoopAnimationsModule],
            providers: [provider]
        });

        const service = TestBed.inject(KbqToastService);
        const stale = service.show(createToastData(), 0);
        const hide = jest.spyOn(service, 'hide');

        // A provided configuration is a plain object, so a consumer can move the stack while it is live.
        (provider.useValue as KbqToastConfig).position = KbqToastPosition.BOTTOM_LEFT;

        service.show(createToastData(), 0);

        // Disposing the overlay destroys the stale view either way; only the drain reports it as hidden,
        // which is what releases its focus and pause state along with it.
        expect(hide).toHaveBeenCalledWith(stale.id);
        expect(stale.ref.hostView.destroyed).toBe(true);
        expect(service.toasts.length).toBe(1);
        expect(containers().length).toBe(1);
        expect(containers()[0].classList).toContain('kbq-toast-container-bottom-left');

        service.ngOnDestroy();
    });

    it('freezes the shared default configuration', () => {
        expect(Object.isFrozen(defaultToastConfig)).toBe(true);
        expect(Object.isFrozen(defaultToastConfig.indent)).toBe(true);
    });

    it('gives every provider its own indent object', () => {
        const first = kbqToastConfigurationProvider({}) as ValueProvider;
        const second = kbqToastConfigurationProvider({}) as ValueProvider;

        expect(first.useValue.indent).not.toBe(second.useValue.indent);
        expect(first.useValue.indent).not.toBe(defaultToastConfig.indent);
        expect(first.useValue.indent).toEqual(defaultToastConfig.indent);
    });
});

describe('KbqToastService factory', () => {
    const configureWithFactory = (componentType: unknown): KbqToastService => {
        TestBed.configureTestingModule({
            imports: [KbqToastModule, NoopAnimationsModule],
            providers: [{ provide: KBQ_TOAST_FACTORY, useValue: componentType }]
        });

        return TestBed.inject(KbqToastService);
    };

    afterEach(() => TestBed.inject(OverlayContainer).ngOnDestroy());

    it('creates the component provided through KBQ_TOAST_FACTORY', () => {
        const service = configureWithFactory(CustomToast);

        service.show(createToastData(), 0);

        expect(service.toasts[0].instance).toBeInstanceOf(CustomToast);
        service.ngOnDestroy();
    });

    it('rejects a factory component that carries no numeric id', () => {
        const service = configureWithFactory(IdlessToast);

        expect(() => service.show(createToastData(), 0)).toThrow(/KBQ_TOAST_FACTORY/);
        service.ngOnDestroy();
    });

    it('leaves nothing rendered behind a rejected factory component', () => {
        const service = configureWithFactory(IdlessToast);
        const overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();

        // The component is created before the guard can read its id, so a retry must not stack another one.
        expect(() => service.show(createToastData(), 0)).toThrow();
        expect(() => service.show(createToastData(), 0)).toThrow();

        expect(overlayContainerElement.querySelectorAll('idless-toast').length).toBe(0);
        service.ngOnDestroy();
    });
});

@Component({
    selector: 'toast-container-host',
    imports: [KbqToastModule],
    template: `
        <kbq-toast-container />
    `
})
class ToastContainerHost {
    readonly container = viewChild.required(KbqToastContainerComponent);
}

describe('KbqToastContainerComponent hosted by a consumer', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqToastModule, NoopAnimationsModule, ToastContainerHost]
        });
    });

    it('creates a toast without a stack wired up by hand', () => {
        const fixture = TestBed.createComponent(ToastContainerHost);

        fixture.detectChanges();

        expect(() =>
            fixture.componentInstance.container().createToast(createToastData(), KbqToastComponent, false)
        ).not.toThrow();

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('kbq-toast').length).toBe(1);
    });
});

describe('KbqToastService in a Shadow DOM overlay container', () => {
    // Integration smoke test: drives the real `KbqShadowDomOverlayContainer` via `kbqShadowDomOverlayProvider`
    // against a host that owns an open shadow root (emulating a Module Federation micro-frontend). The container's
    // own resolution branches are covered in core/overlay/shadow-dom-overlay-container.spec.ts.
    let service: KbqToastService;
    let overlayContainer: OverlayContainer;
    let shadowHost: HTMLElement;
    let shadowRoot: ShadowRoot;

    beforeEach(() => {
        shadowHost = document.createElement('div');
        document.body.appendChild(shadowHost);
        shadowRoot = shadowHost.attachShadow({ mode: 'open' });

        TestBed.configureTestingModule({
            imports: [KbqToastModule, NoopAnimationsModule],
            providers: kbqShadowDomOverlayProvider(shadowHost)
        });

        service = TestBed.inject(KbqToastService);
        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(() => {
        service.ngOnDestroy();
        overlayContainer.ngOnDestroy();
        shadowHost.remove();
    });

    it('renders the toast inside the shadow root, not in the light DOM', () => {
        service.show(createToastData(), 0);

        // The overlay container itself now lives in the shadow tree...
        expect(overlayContainer.getContainerElement().getRootNode()).toBe(shadowRoot);
        // ...and so does the toast (querying the shadow root finds it, the light-DOM body does not).
        expect(shadowRoot.querySelectorAll('kbq-toast').length).toBe(1);
        expect(document.body.querySelectorAll('kbq-toast').length).toBe(0);
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

describe('KbqToastService: global scroll notifications', () => {
    // `KbqPopUpTrigger` default enter delay (400ms) plus a buffer for the deferred show.
    const tooltipEnterDelay = 410;

    let service: KbqToastService;
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

    /** Renders the toast container and the toast itself — the container registers as a scrollable in `ngOnInit`. */
    const renderToast = () => {
        const { id } = service.show(createToastData(), 0);

        TestBed.inject(ApplicationRef).tick();

        return id;
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqToastModule, NoopAnimationsModule, ToastTooltipWrapper]
        });

        service = TestBed.inject(KbqToastService);
        overlayContainer = TestBed.inject(OverlayContainer);
        overlayContainerElement = overlayContainer.getContainerElement();
        scrolled = jest.fn();
        scrollSubscription = TestBed.inject(ScrollDispatcher).scrolled(0).subscribe(scrolled);
    });

    afterEach(() => {
        scrollSubscription.unsubscribe();
        service.ngOnDestroy();
        overlayContainer.ngOnDestroy();
    });

    it('does not notify the global ScrollDispatcher when a toast is shown, animated and hidden', () => {
        const id = renderToast();

        emitToastAnimationEvent();
        service.hide(id);

        expect(scrolled).not.toHaveBeenCalled();
    });

    it('keeps an overlay with the close-on-scroll strategy attached when a toast appears', () => {
        // Models a third-party overlay (the reported case is a Mosaic popover in a micro-frontend):
        // `CloseScrollStrategy` detaches on any emission that did not originate inside its own overlay.
        const overlay = TestBed.inject(Overlay);
        const overlayRef: OverlayRef = overlay.create({ scrollStrategy: overlay.scrollStrategies.close() });

        overlayRef.attach(new ComponentPortal(ToastOverlayContent));
        expect(overlayRef.hasAttached()).toBe(true);

        renderToast();
        emitToastAnimationEvent();

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

        renderToast();
        emitToastAnimationEvent();
        tick();
        fixture.detectChanges();

        expect(overlayContainerElement.querySelector('.kbq-tooltip')).toBeTruthy();

        service.ngOnDestroy();
        flush();
    }));

    it('keeps the container registered as a scrollable, so a real scroll still reaches the dispatcher', () => {
        renderToast();

        overlayContainerElement.querySelector('kbq-toast-container')!.dispatchEvent(new Event('scroll'));

        expect(scrolled).toHaveBeenCalled();
    });

    it('still dispatches on the container when the deprecated `dispatchScrollEvent` is called explicitly', () => {
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

describe('KbqToastService: stack reflow', () => {
    let resized: Subject<ResizeObserverEntry[]>;
    let service: KbqToastService;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
        resized = new Subject<ResizeObserverEntry[]>();

        TestBed.configureTestingModule({
            imports: [KbqToastModule, NoopAnimationsModule, ToastTemplateWrapper],
            // jsdom performs no layout, so the real observer would never fire.
            providers: [{ provide: SharedResizeObserver, useValue: { observe: () => resized } }]
        });

        service = TestBed.inject(KbqToastService);
        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(() => {
        service.ngOnDestroy();
        overlayContainer.ngOnDestroy();
    });

    /** The container registers itself in `ngOnInit`, which needs a change-detection pass to run. */
    const showToast = () => {
        service.show(createToastData(), 0);
        TestBed.inject(ApplicationRef).tick();
    };

    /** `reposition()` and `scrolled(0)` both deliver synchronously, so no flushing is needed. */
    const collectScrolls = () => {
        const sources: (CdkScrollable | void)[] = [];

        TestBed.inject(ScrollDispatcher)
            .scrolled(0)
            .subscribe((source) => sources.push(source));

        return sources;
    };

    it('reports a reflow of the stack through the scroll dispatcher', () => {
        showToast();

        const sources = collectScrolls();

        resized.next([]);

        expect(sources.length).toBe(1);
        expect((sources[0] as CdkScrollable).getElementRef().nativeElement.classList).toContain('kbq-toast-container');
    });

    it('repositions an overlay anchored inside a toast', () => {
        showToast();

        const overlay = TestBed.inject(Overlay);
        const overlayRef = overlay.create({
            positionStrategy: overlay
                .position()
                .flexibleConnectedTo(document.body)
                .withPositions([{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }]),
            scrollStrategy: overlay.scrollStrategies.reposition()
        });

        // The strategy only subscribes once the overlay is actually attached.
        overlayRef.attach(new ComponentPortal(ToastOverlayContent));

        const updatePosition = jest.spyOn(overlayRef, 'updatePosition');

        resized.next([]);

        expect(updatePosition).toHaveBeenCalled();

        overlayRef.dispose();
    });

    it('reports a reflow caused by a template toast, which is removed without an animation', () => {
        const fixture = TestBed.createComponent(ToastTemplateWrapper);

        fixture.detectChanges();

        // A second toast has to outlive the removal, otherwise the whole overlay — container included —
        // is torn down and there is nothing left to report the reflow.
        showToast();

        const { id } = service.showTemplate({}, fixture.componentInstance.template(), 0);

        TestBed.inject(ApplicationRef).tick();

        const sources = collectScrolls();

        // A template toast carries no `@state` binding, so its removal fires no animation event —
        // watching the container's box is what makes this case report at all.
        service.hideTemplate(id);
        resized.next([]);

        expect(sources.length).toBe(1);
    });

    it('still reports real scroll events on the container', () => {
        showToast();

        const container = overlayContainer.getContainerElement().querySelector('kbq-toast-container')!;
        const sources = collectScrolls();

        container.dispatchEvent(new Event('scroll'));

        expect(sources.length).toBe(1);
    });
});
