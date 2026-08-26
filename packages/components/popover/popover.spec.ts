import { coerceElement } from '@angular/cdk/coercion';
import {
    ConnectedOverlayPositionChange,
    FlexibleConnectedPositionStrategy,
    OverlayContainer
} from '@angular/cdk/overlay';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { Component, DebugElement, ElementRef, Provider, TemplateRef, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT,
    ENTER,
    ESCAPE,
    KBQ_LOCALE_SERVICE,
    KbqLocaleService,
    KbqPopUpPlacementValues,
    KbqStickToWindowPlacementValues,
    POSITION_MAP,
    POSITION_TO_CSS_MAP,
    SPACE,
    createKeyboardEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    enUSLocaleData,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { axe } from 'jest-axe';
import { Subject, filter } from 'rxjs';
import { AsyncScheduler } from 'rxjs/internal/scheduler/AsyncScheduler';
import { TestScheduler } from 'rxjs/testing';
import { KBQ_POPOVER_CONFIRM_BUTTON_TEXT, KBQ_POPOVER_CONFIRM_TEXT } from './popover-confirm.component';
import { KbqPopoverComponent, KbqPopoverTrigger, defaultHoverLeaveDelay } from './popover.component';
import { KbqPopoverModule } from './popover.module';

/** `KbqTooltipTrigger` default enter delay (400 ms) plus a buffer for the deferred show. */
const tooltipEnterDelay = 410;

/** An axe audit walks the whole overlay and needs more than the repo-wide 2s default. */
const axeTimeout = 15000;

function openAndAssertPopover<T>(componentFixture: ComponentFixture<T>, triggerElement: ElementRef) {
    dispatchMouseEvent(coerceElement(triggerElement), 'click');
    tick();
    componentFixture.detectChanges();

    const popover = componentFixture.debugElement.query(By.css('.kbq-popover'));

    expect(popover).toBeTruthy();

    return popover;
}

describe('KbqPopover', () => {
    let fixture: ComponentFixture<PopoverTestComponent>;
    let componentInstance: PopoverTestComponent;
    let debugElement: DebugElement;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
        TestBed.configureTestingModule({
            imports: [component, NoopAnimationsModule],
            providers: [
                // The shared pop-up base still polls with `interval(leaveDelay, scheduler)` while a
                // hover-triggered pop-up is open, which spins the CPU when `leaveDelay` is 0. Substituting a
                // scheduler that never runs keeps the suite off that path; the polling itself is replaced by
                // an event-driven timer on the branch that owns `core/pop-up`, and this provider goes with it.
                {
                    provide: AsyncScheduler,
                    useValue: new TestScheduler((actual, expected) => expect(expected).toEqual(actual))
                },
                ...providers
            ]
        });
        const fixture = TestBed.createComponent<T>(component);

        fixture.autoDetectChanges();

        return fixture;
    };

    const readOverlayContainer = () => {
        overlayContainer = TestBed.inject(OverlayContainer);
        overlayContainerElement = overlayContainer.getContainerElement();
    };

    /** Settles the whole closing pipeline: the delayed closing action, the hide timeout and the detach. */
    const settleClose = <T>(componentFixture: ComponentFixture<T>) => {
        tick();
        componentFixture.detectChanges();
        tick();
        componentFixture.detectChanges();
    };

    describe('Check test cases', () => {
        beforeEach(() => {
            fixture = createComponent(PopoverTestComponent);
            componentInstance = fixture.componentInstance;
            debugElement = fixture.debugElement;

            readOverlayContainer();
        });

        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('kbqTrigger = hover', fakeAsync(() => {
            const expectedValue = '_TEST1';
            const triggerElement = componentInstance.test1().nativeElement;

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toEqual(expectedValue);

            // The hover state is tracked by host listeners on the panel component itself, and the synthetic
            // events do not bubble — dispatching on the overlay container would never reach them.
            const panel = overlayContainerElement.querySelector('kbq-popover-component')!;

            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            dispatchMouseEvent(panel, 'mouseenter');
            fixture.detectChanges();

            // Past both the pending hide and a full watchdog period: the pointer is on the panel, so neither
            // may close it.
            tick(defaultHoverLeaveDelay * 2);
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(expectedValue);

            // Back onto the trigger and away again: the trigger's own `mouseleave` is what schedules the
            // hide. Leaving straight from the panel is handled by the pop-up base's hover watchdog, which
            // is polling-based here and stubbed out by the scheduler above — it becomes event-driven on the
            // branch that owns `core/pop-up`, and this leg can move back to the panel then.
            dispatchMouseEvent(panel, 'mouseleave');
            fixture.detectChanges();
            dispatchMouseEvent(triggerElement, 'mouseenter');
            fixture.detectChanges();
            dispatchMouseEvent(triggerElement, 'mouseleave');
            tick(defaultHoverLeaveDelay);
            fixture.detectChanges();
            tick(defaultHoverLeaveDelay);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);
            expect(triggerElement.classList).not.toContain('kbq-active');
        }));

        it('kbqTrigger = manual', fakeAsync(() => {
            const expectedValue = '_TEST2';
            const triggerElement = componentInstance.test2().nativeElement;

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);

            componentInstance.popoverVisibility = true;
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toEqual(expectedValue);

            componentInstance.popoverVisibility = false;
            fixture.detectChanges();
            settleClose(fixture);

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);
            // A manual trigger is not a dialog opener, so it must not advertise one.
            expect(triggerElement.getAttribute('aria-haspopup')).toBeNull();
            expect(triggerElement.getAttribute('aria-expanded')).toBeNull();
        }));

        it('kbqTrigger = focus', fakeAsync(() => {
            const featureKey = '_TEST3';
            const triggerElement = componentInstance.test3().nativeElement;

            dispatchFakeEvent(triggerElement, 'focus');
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);

            dispatchFakeEvent(triggerElement, 'blur');
            settleClose(fixture);

            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            expect(triggerElement.classList).not.toContain('kbq-active');
        }));

        it('Can set kbqPopoverHeader', fakeAsync(() => {
            const expectedValue = '_TEST4';
            const triggerElement = componentInstance.test4().nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            fixture.detectChanges();

            const header = debugElement.query(By.css('.kbq-popover__header'));

            expect(header.nativeElement.textContent).toEqual(expectedValue);

            // A hover popover keeps a watchdog interval running for as long as it is open.
            fixture.destroy();
        }));

        it('Can set kbqPopoverContent', fakeAsync(() => {
            const expectedValue = '_TEST5';
            const triggerElement = componentInstance.test5().nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            fixture.detectChanges();

            const content = debugElement.query(By.css('.kbq-popover__content'));

            expect(content.nativeElement.textContent).toEqual(expectedValue);

            fixture.destroy();
        }));

        it('renders the custom scrollbar on the content', fakeAsync(() => {
            const triggerElement = componentInstance.test5().nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            fixture.detectChanges();

            const content = debugElement.query(By.css('.kbq-popover__content'));

            expect(content.nativeElement.classList).toContain('kbq-scrollbar-viewport');
            expect(content.nativeElement.classList).toContain('kbq-scrollbar-viewport_native-scrollbar-hidden');
        }));

        it('Can set kbqPopoverFooter', fakeAsync(() => {
            const expectedValue = '_TEST6';
            const triggerElement = componentInstance.test6().nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            fixture.detectChanges();

            const footer = debugElement.query(By.css('.kbq-popover__footer'));

            expect(footer.nativeElement.textContent).toEqual(expectedValue);

            fixture.destroy();
        }));

        it('Can set kbqPopoverClass', fakeAsync(() => {
            const expectedValue = '_TEST7';
            const triggerElement = componentInstance.test7().nativeElement;

            dispatchMouseEvent(triggerElement, 'click');
            tick();
            fixture.detectChanges();

            const popover = debugElement.query(By.css('.kbq-popover'));

            expect(popover.nativeElement.classList.contains(expectedValue)).toBeTruthy();
            expect(triggerElement.classList).toContain('kbq-active');
        }));

        it('should open popover with keyboard when kbqTrigger = default', fakeAsync(() => {
            const triggerElement = componentInstance.test7().nativeElement;

            [ENTER, SPACE].forEach((keyCode) => {
                dispatchKeyboardEvent(triggerElement, 'keydown', keyCode);
                tick();
                fixture.detectChanges();

                let popover = debugElement.query(By.css('.kbq-popover'));

                expect(popover).toBeTruthy();
                expect(triggerElement.classList).toContain('kbq-active');

                dispatchKeyboardEvent(triggerElement, 'keydown', ESCAPE);
                tick();
                fixture.detectChanges();
                popover = debugElement.query(By.css('.kbq-popover'));
                expect(popover).not.toBeTruthy();
                expect(triggerElement.classList).not.toContain('kbq-active');
            });
        }));

        it('should open popover with keyboard when kbqTrigger = default for elements other than button', fakeAsync(() => {
            const triggerElement = componentInstance.test8().nativeElement;

            expect(triggerElement.tagName).not.toEqual('BUTTON');

            [ENTER, SPACE].forEach((keyCode) => {
                dispatchKeyboardEvent(triggerElement, 'keydown', keyCode);
                tick();
                fixture.detectChanges();

                let popover = debugElement.query(By.css('.kbq-popover'));

                expect(popover).toBeTruthy();
                expect(triggerElement.classList).toContain('kbq-active');

                dispatchKeyboardEvent(triggerElement, 'keydown', ESCAPE);
                tick();
                fixture.detectChanges();
                popover = debugElement.query(By.css('.kbq-popover'));
                expect(popover).not.toBeTruthy();
                expect(triggerElement.classList).not.toContain('kbq-active');
            });
        }));
    });

    describe('closeOnScroll', () => {
        let scrolled$: Subject<CdkScrollable | void>;
        let closeOnScrollFixture: ComponentFixture<PopoverCloseOnScroll>;
        let trigger: KbqPopoverTrigger;

        const makeScrollable = (element: Element): CdkScrollable =>
            ({ getElementRef: () => new ElementRef(element) }) as CdkScrollable;

        beforeEach(() => {
            scrolled$ = new Subject<CdkScrollable | void>();
            const scrollDispatcherStub = {
                scrolled: () => scrolled$.asObservable(),
                ancestorScrolled: (element: ElementRef<Element> | Element) =>
                    scrolled$.pipe(
                        filter(
                            (scrollable) =>
                                !scrollable || scrollable.getElementRef().nativeElement.contains(coerceElement(element))
                        )
                    ),
                register: () => {},
                deregister: () => {},
                getAncestorScrollContainers: () => []
            } as unknown as ScrollDispatcher;

            closeOnScrollFixture = createComponent(PopoverCloseOnScroll, [
                { provide: ScrollDispatcher, useValue: scrollDispatcherStub }
            ]);
            trigger = closeOnScrollFixture.componentInstance.popoverTrigger();
        });

        beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        }));

        afterEach(() => overlayContainer.ngOnDestroy());

        const openPopover = () => {
            trigger.show(0);
            tick();
            closeOnScrollFixture.detectChanges();
        };

        it('subscribes to the ancestor-filtered stream: a scroll it excludes (the popover’s own content) does not close it', fakeAsync(() => {
            openPopover();
            const content = overlayContainerElement.querySelector('.kbq-popover__content')!;

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeTruthy();

            scrolled$.next(makeScrollable(content));
            tick();
            closeOnScrollFixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeTruthy();
        }));

        it('hides when the ancestor-filtered stream emits (an ancestor/page scroll)', fakeAsync(() => {
            openPopover();
            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeTruthy();

            scrolled$.next(makeScrollable(document.body));
            tick();
            closeOnScrollFixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeFalsy();
        }));
    });

    describe('Check popover confirm', () => {
        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('Default text comes from the active locale', fakeAsync(() => {
            const fixture = createComponent(PopoverConfirmTestComponent);
            const { componentInstance, debugElement } = fixture;

            readOverlayContainer();

            const triggerElement = componentInstance.test8().nativeElement;

            dispatchMouseEvent(triggerElement, 'click');
            tick();
            fixture.detectChanges();

            const button = debugElement.query(By.css('.kbq-popover-confirm button'));

            expect(button.nativeElement.textContent.trim()).toEqual(ruRULocaleData.popoverConfirm.confirmButtonText);

            const confirmText = debugElement.query(By.css('.kbq-popover-confirm .kbq-popover__content div'));

            expect(confirmText.nativeElement.textContent).toEqual(ruRULocaleData.popoverConfirm.confirmText);
        }));

        it('Default text follows a locale switch made while the panel is open', fakeAsync(() => {
            const fixture = createComponent(PopoverConfirmTestComponent, [
                { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
            ]);
            const { componentInstance, debugElement } = fixture;

            readOverlayContainer();

            const buttonText = () =>
                debugElement.query(By.css('.kbq-popover-confirm button')).nativeElement.textContent.trim();
            const confirmText = () =>
                debugElement.query(By.css('.kbq-popover-confirm .kbq-popover__content div')).nativeElement.textContent;

            dispatchMouseEvent(componentInstance.test8().nativeElement, 'click');
            tick();
            fixture.detectChanges();

            expect(buttonText()).toEqual(ruRULocaleData.popoverConfirm.confirmButtonText);
            expect(confirmText()).toEqual(ruRULocaleData.popoverConfirm.confirmText);

            // Switched with the panel already on screen: `updateData` only runs on input writes, so nothing
            // but the trigger's locale effect can carry the new strings into the live panel.
            TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');
            tick();
            fixture.detectChanges();

            expect(buttonText()).toEqual(enUSLocaleData.popoverConfirm.confirmButtonText);
            expect(confirmText()).toEqual(enUSLocaleData.popoverConfirm.confirmText);
        }));

        it('Can set confirm text through input', fakeAsync(() => {
            const fixture = createComponent(PopoverConfirmTestComponent);
            const { componentInstance, debugElement } = fixture;
            const expectedValue = 'new confirm text';

            readOverlayContainer();

            const triggerElement = componentInstance.test9().nativeElement;

            dispatchMouseEvent(triggerElement, 'click');
            tick();
            fixture.detectChanges();

            const confirmText = debugElement.query(By.css('.kbq-popover-confirm .kbq-popover__content div'));

            expect(confirmText.nativeElement.textContent).toEqual(expectedValue);
        }));

        it('Can set button text through input', fakeAsync(() => {
            const fixture = createComponent(PopoverConfirmTestComponent);
            const { componentInstance, debugElement } = fixture;
            const expectedValue = 'new button text';

            readOverlayContainer();

            const triggerElement = componentInstance.test10().nativeElement;

            dispatchMouseEvent(triggerElement, 'click');
            tick();
            fixture.detectChanges();

            const button = debugElement.query(By.css('.kbq-popover-confirm button'));

            expect(button.nativeElement.textContent.trim()).toEqual(expectedValue);
        }));

        it('Click emits confirm exactly once and closes the panel', fakeAsync(() => {
            const fixture = createComponent(PopoverConfirmTestComponent);
            const { componentInstance, debugElement } = fixture;
            const onConfirmSpyFn = jest.spyOn(componentInstance, 'onConfirm');

            readOverlayContainer();

            dispatchMouseEvent(componentInstance.test11().nativeElement, 'click');
            tick();
            fixture.detectChanges();

            // Every input write re-runs `updateData`; the confirm handler must survive that without stacking.
            componentInstance.confirmText = 'updated confirm text';
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const confirmButton = debugElement.query(By.css('.kbq-popover-confirm button'));

            dispatchMouseEvent(confirmButton.nativeElement, 'click');
            settleClose(fixture);

            expect(onConfirmSpyFn).toHaveBeenCalledTimes(1);
            expect(overlayContainerElement.querySelector('.kbq-popover-confirm')).toBeFalsy();
        }));

        it('should not throw when a confirm popover is opened by hover', fakeAsync(() => {
            const fixture = createComponent(PopoverConfirmTestComponent);
            const { componentInstance } = fixture;

            readOverlayContainer();

            expect(() => {
                dispatchMouseEvent(componentInstance.test13().nativeElement, 'mouseenter');
                tick();
                fixture.detectChanges();
            }).not.toThrow();

            expect(overlayContainerElement.querySelector('.kbq-popover-confirm')).toBeTruthy();

            fixture.destroy();
        }));

        it(
            'should have no axe violations while open',
            async () => {
                const fixture = createComponent(PopoverConfirmTestComponent);

                readOverlayContainer();

                dispatchMouseEvent(fixture.componentInstance.test8().nativeElement, 'click');
                await fixture.whenStable();
                fixture.detectChanges();

                expect(await axe(overlayContainerElement)).toHaveNoViolations();
            },
            axeTimeout
        );
    });

    describe('Check popover confirm with providers', () => {
        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('Provided text is correct', fakeAsync(() => {
            const fixture = createComponent(PopoverConfirmWithProvidersTestComponent);
            const { componentInstance, debugElement } = fixture;

            readOverlayContainer();

            const triggerElement = componentInstance.test12().nativeElement;

            dispatchMouseEvent(triggerElement, 'click');
            tick();
            fixture.detectChanges();

            const button = debugElement.query(By.css('.kbq-popover-confirm button'));

            expect(button.nativeElement.textContent.trim()).toEqual('provided button text');

            const confirmText = debugElement.query(By.css('.kbq-popover-confirm .kbq-popover__content div'));

            expect(confirmText.nativeElement.textContent).toEqual('provided confirm text');
        }));
    });

    describe('Overlay offset', () => {
        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('should add offset for some positions if element is less than arrow margin', fakeAsync(() => {
            const fixture = createComponent(PopoverSimple);
            const { componentInstance } = fixture;

            readOverlayContainer();

            const rect = ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT * 2 - 1;

            componentInstance.triggerElementRef().nativeElement.getBoundingClientRect = () => ({
                width: rect,
                height: rect
            });
            fixture.detectChanges();

            openAndAssertPopover(fixture, componentInstance.triggerElementRef());

            const strategy: FlexibleConnectedPositionStrategy = componentInstance
                .popoverTrigger()
                .createOverlay()
                .getConfig().positionStrategy! as FlexibleConnectedPositionStrategy;

            expect(strategy.positions.some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeTruthy();
        }));

        it('should not add offset if element is large', fakeAsync(() => {
            const fixture = createComponent(PopoverSimple);
            const { componentInstance } = fixture;

            readOverlayContainer();

            componentInstance.triggerElementRef().nativeElement.getBoundingClientRect = () => ({
                width: 100,
                height: 100
            });
            fixture.detectChanges();

            openAndAssertPopover(fixture, componentInstance.triggerElementRef());

            const strategy: FlexibleConnectedPositionStrategy = componentInstance
                .popoverTrigger()
                .createOverlay()
                .getConfig().positionStrategy! as FlexibleConnectedPositionStrategy;

            expect(strategy.positions.some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeFalsy();
        }));
    });

    describe('with TemplateRef', () => {
        let templateFixture: ComponentFixture<PopoverWithTemplateRef>;
        let templateInstance: PopoverWithTemplateRef;

        beforeEach(() => {
            templateFixture = createComponent(PopoverWithTemplateRef);
            templateInstance = templateFixture.componentInstance;

            readOverlayContainer();
        });

        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('context for template', fakeAsync(() => {
            const triggerElement = templateInstance.trigger().nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            templateFixture.detectChanges();

            const header = overlayContainerElement.querySelector('.kbq-popover__header')?.textContent;
            const content = overlayContainerElement.querySelector('.kbq-popover__content')?.textContent;
            const footer = overlayContainerElement.querySelector('.kbq-popover__footer')?.textContent;

            expect(header).toEqual(templateInstance.context.header);
            expect(content).toEqual(templateInstance.context.content);
            expect(footer).toEqual(templateInstance.context.footer);

            templateFixture.destroy();
        }));

        it('should pass a falsy context to the template', fakeAsync(() => {
            templateInstance.context = 0 as never;
            templateFixture.detectChanges();

            dispatchMouseEvent(templateInstance.trigger().nativeElement, 'mouseenter');
            tick();
            templateFixture.detectChanges();

            const popover = templateFixture.debugElement.query(By.directive(KbqPopoverComponent))
                .componentInstance as KbqPopoverComponent;

            expect(popover.context).toEqual({ $implicit: 0 });

            templateFixture.destroy();
        }));
    });

    describe('closing behavior', () => {
        let closingFixture: ComponentFixture<PopoverClosingBehavior>;
        let closingInstance: PopoverClosingBehavior;
        let trigger: HTMLElement;

        const open = () => {
            dispatchMouseEvent(trigger, 'click');
            tick();
            closingFixture.detectChanges();
        };

        const isOpen = () => !!overlayContainerElement.querySelector('.kbq-popover');

        beforeEach(() => {
            closingFixture = createComponent(PopoverClosingBehavior);
            closingInstance = closingFixture.componentInstance;
            trigger = closingInstance.trigger().nativeElement;

            readOverlayContainer();
        });

        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('should emit kbqPopoverVisibleChange once per state change', fakeAsync(() => {
            const spy = jest.spyOn(closingInstance, 'onVisibleChange');

            for (let i = 0; i < 3; i++) {
                open();
                dispatchMouseEvent(document.body, 'click');
                settleClose(closingFixture);
            }

            expect(spy).toHaveBeenCalledTimes(6);
            expect(spy.mock.calls.map(([value]) => value)).toEqual([true, false, true, false, true, false]);
        }));

        it('should close on a backdrop click and use the configured backdrop class', fakeAsync(() => {
            closingInstance.hasBackdrop = true;
            closingInstance.backdropClass = 'test-backdrop';
            closingFixture.detectChanges();

            open();

            const backdrop = overlayContainerElement.querySelector<HTMLElement>('.cdk-overlay-backdrop')!;

            expect(backdrop).toBeTruthy();
            expect(backdrop.classList).toContain('test-backdrop');

            backdrop.click();
            settleClose(closingFixture);

            expect(isOpen()).toBeFalsy();
        }));

        it('should render a backdrop enabled after the first open', fakeAsync(() => {
            open();
            dispatchMouseEvent(document.body, 'click');
            settleClose(closingFixture);

            closingInstance.hasBackdrop = true;
            closingFixture.detectChanges();

            open();

            expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();
        }));

        it('should keep the popover open while kbqPopoverPreventClose is set', fakeAsync(() => {
            open();

            closingInstance.preventClose = true;
            closingFixture.detectChanges();

            dispatchMouseEvent(document.body, 'click');
            settleClose(closingFixture);

            expect(isOpen()).toBeTruthy();

            const panel = overlayContainerElement.querySelector('.kbq-popover')!;

            dispatchEvent(panel, createKeyboardEvent('keydown', ESCAPE, undefined, 'Escape'));
            settleClose(closingFixture);

            expect(isOpen()).toBeTruthy();

            closingInstance.preventClose = false;
            closingFixture.detectChanges();
        }));

        it('should close when the trigger becomes disabled', fakeAsync(() => {
            open();

            closingInstance.disabled = true;
            closingFixture.detectChanges();
            settleClose(closingFixture);

            expect(isOpen()).toBeFalsy();
        }));

        it('should close on touchend', fakeAsync(() => {
            open();

            dispatchFakeEvent(trigger, 'touchend');
            settleClose(closingFixture);

            expect(isOpen()).toBeFalsy();
        }));

        it('should close on scroll only when closeOnScroll is enabled', fakeAsync(() => {
            closingInstance.closeOnScroll = false;
            closingFixture.detectChanges();

            open();
            dispatchFakeEvent(document, 'scroll');
            tick(20);
            settleClose(closingFixture);

            expect(isOpen()).toBeTruthy();

            dispatchMouseEvent(document.body, 'click');
            settleClose(closingFixture);

            closingInstance.closeOnScroll = true;
            closingFixture.detectChanges();

            open();
            dispatchFakeEvent(document, 'scroll');
            tick(20);
            settleClose(closingFixture);

            expect(isOpen()).toBeFalsy();
        }));

        it('should restore focus to the trigger when the close button is used', fakeAsync(() => {
            closingInstance.hasCloseButton = true;
            closingFixture.detectChanges();

            open();

            const closeButton = overlayContainerElement.querySelector<HTMLElement>('.kbq-popover__close button')!;

            expect(closeButton).toBeTruthy();

            // The CDK focus trap resolves its first tabbable element through element geometry, which jsdom
            // never reports — stand in for it, so focus is where a browser would have put it on open.
            closeButton.focus();

            closeButton.click();
            settleClose(closingFixture);

            expect(isOpen()).toBeFalsy();
            expect(document.activeElement).toBe(trigger);
        }));

        it('should leave focus alone when it never entered the panel', fakeAsync(() => {
            const outside = closingInstance.outside().nativeElement as HTMLElement;

            open();
            outside.focus();

            dispatchMouseEvent(document.body, 'click');
            settleClose(closingFixture);

            expect(isOpen()).toBeFalsy();
            expect(document.activeElement).toBe(outside);
        }));

        it('should leave nothing in the overlay container when destroyed while open', fakeAsync(() => {
            open();

            expect(isOpen()).toBeTruthy();

            closingFixture.destroy();

            expect(overlayContainerElement.childNodes.length).toBe(0);
        }));
    });

    describe('reposition while closing', () => {
        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('should still close on an outside click that repositions the panel', fakeAsync(() => {
            const fixture = createComponent(PopoverRebuiltContext);

            readOverlayContainer();

            dispatchMouseEvent(fixture.componentInstance.trigger().nativeElement, 'click');
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeTruthy();

            // The outside click schedules the close through a `delay(0)`, so it is still pending here.
            dispatchMouseEvent(document.body, 'click');

            // Driven directly rather than through the context binding that queues it: what has to hold is
            // that a reposition landing inside that delay does not rebuild the closing-action subscription
            // and drop the close with it. The inherited `updatePosition` does exactly that.
            fixture.componentInstance.popoverTrigger().updatePosition(true);

            settleClose(fixture);

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeFalsy();
        }));
    });

    describe('accessibility', () => {
        let a11yFixture: ComponentFixture<PopoverClosingBehavior>;
        let a11yInstance: PopoverClosingBehavior;
        let trigger: HTMLElement;

        const open = () => {
            dispatchMouseEvent(trigger, 'click');
            tick();
            a11yFixture.detectChanges();
        };

        beforeEach(() => {
            a11yFixture = createComponent(PopoverClosingBehavior);
            a11yInstance = a11yFixture.componentInstance;
            trigger = a11yInstance.trigger().nativeElement;

            readOverlayContainer();
        });

        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('should describe the trigger as a dialog opener', fakeAsync(() => {
            expect(trigger.getAttribute('aria-haspopup')).toEqual('dialog');
            expect(trigger.getAttribute('aria-expanded')).toEqual('false');
            expect(trigger.getAttribute('aria-controls')).toBeNull();

            open();

            const panel = overlayContainerElement.querySelector('.kbq-popover')!;

            expect(trigger.getAttribute('aria-expanded')).toEqual('true');
            expect(trigger.getAttribute('aria-controls')).toEqual(panel.id);
            expect(panel.id).toBeTruthy();

            dispatchMouseEvent(document.body, 'click');
            settleClose(a11yFixture);

            expect(trigger.getAttribute('aria-expanded')).toEqual('false');
            expect(trigger.getAttribute('aria-controls')).toBeNull();
        }));

        it('should label the panel by its header', fakeAsync(() => {
            open();

            const panel = overlayContainerElement.querySelector('.kbq-popover')!;
            const header = overlayContainerElement.querySelector('.kbq-popover__header-text')!;

            expect(panel.getAttribute('role')).toEqual('dialog');
            expect(panel.getAttribute('aria-labelledby')).toEqual(header.id);
            expect(header.id).toBeTruthy();
        }));

        it('should label a header-less panel with kbqPopoverAriaLabel', fakeAsync(() => {
            a11yInstance.header = '';
            a11yInstance.ariaLabel = 'ARIA LABEL';
            a11yFixture.detectChanges();

            open();

            const panel = overlayContainerElement.querySelector('.kbq-popover')!;

            expect(panel.getAttribute('aria-labelledby')).toBeNull();
            expect(panel.getAttribute('aria-label')).toEqual('ARIA LABEL');
        }));

        it('should fall back to kbqPopoverAriaLabel when the header is a template', fakeAsync(() => {
            // A template header renders arbitrary markup with no text node to point `aria-labelledby` at.
            a11yInstance.header = a11yInstance.templateHeader();
            a11yInstance.ariaLabel = 'ARIA LABEL';
            a11yFixture.detectChanges();

            open();

            const panel = overlayContainerElement.querySelector('.kbq-popover')!;

            expect(panel.querySelector('.kbq-popover__header')!.textContent).toContain('TEMPLATE HEADER');
            expect(panel.getAttribute('aria-labelledby')).toBeNull();
            expect(panel.getAttribute('aria-label')).toEqual('ARIA LABEL');
        }));

        it('should arm the focus trap and claim focus for a click open', fakeAsync(() => {
            open();

            const panel = a11yFixture.debugElement.query(By.directive(KbqPopoverComponent))
                .componentInstance as KbqPopoverComponent;

            expect(panel.isTrapFocus).toBe(true);
            // Whether focus actually lands inside the panel depends on the CDK trap finding a tabbable
            // element by geometry, which jsdom has none of; the decision to claim it is what popover owns,
            // and the landing is covered by the Playwright suite.
            expect(a11yInstance.popoverTrigger().capturesFocusOnOpen).toBe(true);
        }));

        it(
            'should have no axe violations while open',
            async () => {
                a11yInstance.hasCloseButton = true;
                a11yFixture.detectChanges();

                dispatchMouseEvent(trigger, 'click');
                await a11yFixture.whenStable();
                a11yFixture.detectChanges();

                expect(await axe(overlayContainerElement)).toHaveNoViolations();
            },
            axeTimeout
        );

        it(
            'should have no axe violations when nothing names the panel',
            async () => {
                // The shipped examples are mostly header-less and none of them binds `kbqPopoverAriaLabel`,
                // so this is the configuration a consumer lands in by default.
                a11yInstance.header = '';
                a11yInstance.hasCloseButton = true;
                a11yFixture.detectChanges();

                dispatchMouseEvent(trigger, 'click');
                await a11yFixture.whenStable();
                a11yFixture.detectChanges();

                // Nothing can name the panel, so it must not claim to be a dialog: `aria-dialog-name` fails
                // an unnamed one, and a screen reader announces it as "dialog" and nothing more.
                expect(overlayContainerElement.querySelector('.kbq-popover')!.getAttribute('role')).toBeNull();
                expect(await axe(overlayContainerElement)).toHaveNoViolations();
            },
            axeTimeout
        );
    });

    describe('hover trigger', () => {
        let hoverFixture: ComponentFixture<PopoverHoverBehavior>;

        /** Walks the pointer off the trigger and onto the open panel, the way a user reaching its content does. */
        const movePointerOntoPanel = (trigger: HTMLElement) => {
            // The hover state is tracked by host listeners on the panel component itself, and the synthetic
            // events do not bubble — dispatching on the overlay container would never reach them.
            dispatchMouseEvent(trigger, 'mouseleave');
            hoverFixture.detectChanges();
            dispatchMouseEvent(overlayContainerElement.querySelector('kbq-popover-component')!, 'mouseenter');
            hoverFixture.detectChanges();
        };

        beforeEach(() => {
            hoverFixture = createComponent(PopoverHoverBehavior);

            readOverlayContainer();
        });

        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('should not steal keyboard focus', fakeAsync(() => {
            const outside = hoverFixture.componentInstance.outside().nativeElement as HTMLElement;

            outside.focus();

            dispatchMouseEvent(hoverFixture.componentInstance.trigger().nativeElement, 'mouseenter');
            tick();
            hoverFixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeTruthy();
            expect(hoverFixture.componentInstance.popoverTrigger().capturesFocusOnOpen).toBe(false);
            expect(document.activeElement).toBe(outside);

            hoverFixture.destroy();
        }));

        it('should claim focus for a keyboard open that follows a hover', fakeAsync(() => {
            const trigger = hoverFixture.componentInstance.keyboard().nativeElement as HTMLElement;

            // One hover is enough to leave the last recorded trigger event at `mouseleave`, and the shared
            // base records nothing for its own keyboard opener.
            dispatchMouseEvent(trigger, 'mouseenter');
            tick();
            hoverFixture.detectChanges();
            dispatchMouseEvent(trigger, 'mouseleave');
            tick(defaultHoverLeaveDelay);
            tick(defaultHoverLeaveDelay);
            hoverFixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeFalsy();

            dispatchKeyboardEvent(trigger, 'keydown', ENTER);
            tick();
            hoverFixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeTruthy();
            expect(hoverFixture.componentInstance.keyboardTrigger().capturesFocusOnOpen).toBe(true);

            hoverFixture.destroy();
        }));

        it('should hold the panel open for the default leave delay', fakeAsync(() => {
            const trigger = hoverFixture.componentInstance.trigger().nativeElement as HTMLElement;

            dispatchMouseEvent(trigger, 'mouseenter');
            tick();
            hoverFixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeTruthy();

            // The pointer leaves the trigger without landing on the panel, so the delay is the only thing
            // keeping the popover on screen while the pointer travels towards it.
            dispatchMouseEvent(trigger, 'mouseleave');
            tick(defaultHoverLeaveDelay - 1);
            hoverFixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeTruthy();

            // The scheduled hide hands the same delay on to the panel, so the second period is the panel's.
            tick(1);
            tick(defaultHoverLeaveDelay);
            hoverFixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeFalsy();
        }));

        it('should honour an explicit kbqLeaveDelay of zero', fakeAsync(() => {
            const trigger = hoverFixture.componentInstance.instantTrigger().nativeElement as HTMLElement;

            dispatchMouseEvent(trigger, 'mouseenter');
            tick();
            hoverFixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeTruthy();

            dispatchMouseEvent(trigger, 'mouseleave');
            settleClose(hoverFixture);

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeFalsy();
        }));

        it('should close on the close button while the pointer rests on the panel', fakeAsync(() => {
            const trigger = hoverFixture.componentInstance.closable().nativeElement as HTMLElement;

            dispatchMouseEvent(trigger, 'mouseenter');
            tick();
            hoverFixture.detectChanges();

            // Reaching the close button means the pointer has left the trigger and landed on the panel —
            // the one state the shared `hide()` refuses to close in, so that a hover popover survives the
            // trip between the two.
            movePointerOntoPanel(trigger);

            overlayContainerElement.querySelector<HTMLElement>('.kbq-popover__close button')!.click();
            settleClose(hoverFixture);

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeFalsy();

            // Drain the hide the trigger's own `mouseleave` scheduled; it is a no-op now that the panel is gone.
            tick(defaultHoverLeaveDelay);
        }));

        it('should close on Escape while the pointer rests on the panel', fakeAsync(() => {
            const trigger = hoverFixture.componentInstance.closable().nativeElement as HTMLElement;

            dispatchMouseEvent(trigger, 'mouseenter');
            tick();
            hoverFixture.detectChanges();

            movePointerOntoPanel(trigger);

            dispatchEvent(
                overlayContainerElement.querySelector('.kbq-popover')!,
                createKeyboardEvent('keydown', ESCAPE, undefined, 'Escape')
            );
            settleClose(hoverFixture);

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeFalsy();

            tick(defaultHoverLeaveDelay);
        }));
    });

    describe('input aliases', () => {
        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('should treat a bare hasCloseButton attribute as true', fakeAsync(() => {
            const fixture = createComponent(PopoverInputAliases);

            readOverlayContainer();

            dispatchMouseEvent(fixture.componentInstance.bare().nativeElement, 'click');
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover__close')).toBeTruthy();
        }));

        it('should treat hasCloseButton="false" as false', fakeAsync(() => {
            const fixture = createComponent(PopoverInputAliases);

            readOverlayContainer();

            dispatchMouseEvent(fixture.componentInstance.stringFalse().nativeElement, 'click');
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover__close')).toBeFalsy();
        }));

        it('should accept the prefixed aliases of the legacy inputs', fakeAsync(() => {
            const fixture = createComponent(PopoverInputAliases);

            readOverlayContainer();

            dispatchMouseEvent(fixture.componentInstance.prefixed().nativeElement, 'click');
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover__close')).toBeTruthy();
            expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();
            expect(
                overlayContainerElement
                    .querySelector('.kbq-popover__content')!
                    .classList.contains('kbq-popover__content_default-paddings')
            ).toBeFalsy();
        }));
    });

    describe('placement and positioning', () => {
        let placementFixture: ComponentFixture<PopoverPlacement>;
        let placementInstance: PopoverPlacement;

        const open = () => {
            dispatchMouseEvent(placementInstance.trigger().nativeElement, 'click');
            tick();
            placementFixture.detectChanges();
        };

        const close = () => {
            dispatchMouseEvent(document.body, 'click');
            settleClose(placementFixture);
        };

        const panel = () => overlayContainerElement.querySelector('.kbq-popover');

        const positions = () =>
            (
                placementInstance.popoverTrigger().createOverlay().getConfig()
                    .positionStrategy as FlexibleConnectedPositionStrategy
            ).positions;

        beforeEach(() => {
            placementFixture = createComponent(PopoverPlacement);
            placementInstance = placementFixture.componentInstance;

            readOverlayContainer();
        });

        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('should resolve every placement to its own panel class', fakeAsync(() => {
            const placements = Object.entries(POSITION_TO_CSS_MAP) as [KbqPopUpPlacementValues, string][];

            expect(placements).toHaveLength(12);

            for (const [placement, cssName] of placements) {
                placementInstance.placement = placement;
                placementFixture.detectChanges();

                open();

                expect(panel()!.classList).toContain(`kbq-popover_placement-${cssName}`);

                close();
            }
        }));

        it('should emit the placement resolved by the position strategy', fakeAsync(() => {
            const spy = jest.spyOn(placementInstance, 'onPlacementChange');

            open();

            // jsdom has no layout, so the strategy never flips on its own — feed it the connection pair the
            // browser would have resolved instead.
            placementInstance.popoverTrigger().onPositionChange({
                connectionPair: POSITION_MAP.rightTop
            } as ConnectedOverlayPositionChange);
            placementFixture.detectChanges();

            expect(spy).toHaveBeenCalledWith('rightTop');
            expect(panel()!.classList).toContain('kbq-popover_placement-right-top');
        }));

        it('should try only the prioritised placements', fakeAsync(() => {
            placementInstance.placementPriority = ['bottom', 'top'];
            placementFixture.detectChanges();

            open();

            expect(positions()).toHaveLength(2);
            expect(positions()[0]).toMatchObject(POSITION_MAP.bottom);
        }));

        it('should not offset the positions when the arrow is hidden', fakeAsync(() => {
            placementInstance.arrow = false;
            placementFixture.detectChanges();

            open();

            expect(positions().some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeFalsy();
        }));

        it('should keep the arrow dropped while stuck to the window', fakeAsync(() => {
            placementInstance.stickToWindow = 'right';
            placementFixture.detectChanges();

            open();

            expect(panel()!.classList).toContain('kbq-popover_arrowless');
            expect(overlayContainerElement.querySelector('.kbq-popover__arrow')).toBeFalsy();

            // Every input write re-runs `updateData`, which used to copy the `arrow` input back over the
            // stick-driven decision and resurrect a rotated square detached from the trigger.
            placementInstance.content = 'UPDATED';
            placementFixture.detectChanges();
            tick();
            placementFixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover__arrow')).toBeFalsy();
        }));
    });

    describe('placement and size fallbacks', () => {
        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('should warn and fall back to the top placement on an unknown value', fakeAsync(() => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
            const fixture = createComponent(PopoverFallbacks);

            readOverlayContainer();

            dispatchMouseEvent(fixture.componentInstance.badPlacement().nativeElement, 'click');
            tick();
            fixture.detectChanges();

            expect(warn).toHaveBeenCalled();
            expect(overlayContainerElement.querySelector('.kbq-popover_placement-top')).toBeTruthy();
        }));

        it('should warn and fall back to the medium size on an unknown value', fakeAsync(() => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
            const fixture = createComponent(PopoverFallbacks);

            readOverlayContainer();

            dispatchMouseEvent(fixture.componentInstance.badSize().nativeElement, 'click');
            tick();
            fixture.detectChanges();

            expect(warn).toHaveBeenCalled();
            expect(overlayContainerElement.querySelector('.kbq-popover_medium')).toBeTruthy();
        }));
    });

    describe('leaks', () => {
        it('should unsubscribe from the global scroll stream on destroy', () => {
            TestBed.configureTestingModule({ imports: [PopoverSimple, NoopAnimationsModule] });

            const scrolled = new Subject<CdkScrollable | void>();

            jest.spyOn(TestBed.inject(ScrollDispatcher), 'scrolled').mockReturnValue(scrolled);

            const fixture = TestBed.createComponent(PopoverSimple);

            fixture.detectChanges();

            expect(scrolled.observed).toBe(true);

            fixture.destroy();

            expect(scrolled.observed).toBe(false);
        });

        it('should not measure anything on scroll while closed', () => {
            TestBed.configureTestingModule({ imports: [PopoverSimple, NoopAnimationsModule] });

            const scrolled = new Subject<CdkScrollable | void>();

            jest.spyOn(TestBed.inject(ScrollDispatcher), 'scrolled').mockReturnValue(scrolled);

            const fixture = TestBed.createComponent(PopoverSimple);

            fixture.detectChanges();

            const measure = jest.spyOn(Element.prototype, 'getBoundingClientRect');
            const container = document.createElement('div');

            // A plain document scroll (`scrolled.next()`) never reaches the layout reads at all — the handler
            // bails on the missing container long before them. Emitting the one container the popover does
            // react to leaves the closed-state guard as the only thing between the scroll and two reflows.
            container.classList.add('kbq-hide-nested-popup');
            scrolled.next({ getElementRef: () => new ElementRef<HTMLElement>(container) } as CdkScrollable);

            expect(measure).not.toHaveBeenCalled();

            measure.mockRestore();
            fixture.destroy();
        });
    });

    describe('with a tooltip on the same element', () => {
        let tooltipFixture: ComponentFixture<PopoverWithTooltip>;
        let trigger: HTMLElement;

        /** Opens the tooltip by hover and settles its 400 ms enter delay and the deferred reposition. */
        const showTooltip = () => {
            dispatchMouseEvent(trigger, 'mouseenter');
            tooltipFixture.detectChanges();
            tick(tooltipEnterDelay);
            tooltipFixture.detectChanges();
            tick();
            tooltipFixture.detectChanges();
        };

        /** Presses `Escape` inside the open panel, which is what makes the popover restore focus. */
        const pressEscapeInPanel = () => {
            const panel = overlayContainerElement.querySelector('.kbq-popover')!;

            // The CDK focus trap picks its first tabbable element by geometry, which jsdom never reports —
            // put focus where a browser would have put it on open, so there is something to restore from.
            panel.querySelector<HTMLElement>('button')?.focus();

            dispatchEvent(panel, createKeyboardEvent('keydown', ESCAPE, undefined, 'Escape'));
            tick();
            tooltipFixture.detectChanges();
            tick();
            tooltipFixture.detectChanges();
        };

        beforeEach(() => {
            tooltipFixture = createComponent(PopoverWithTooltip);
            trigger = tooltipFixture.componentInstance.trigger().nativeElement;

            readOverlayContainer();
        });

        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('should hide the tooltip when the popover opens', fakeAsync(() => {
            showTooltip();

            expect(overlayContainerElement.textContent).toContain('TOOLTIP');

            dispatchMouseEvent(trigger, 'click');
            tick();
            tooltipFixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeTruthy();
            expect(overlayContainerElement.textContent).not.toContain('TOOLTIP');
        }));

        it('should not show the tooltip when the popover is closed with Escape', fakeAsync(() => {
            showTooltip();

            dispatchMouseEvent(trigger, 'click');
            tick();
            tooltipFixture.detectChanges();

            pressEscapeInPanel();

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeFalsy();
            expect(document.activeElement).toBe(trigger);
            expect(overlayContainerElement.textContent).not.toContain('TOOLTIP');
        }));

        it('should release the mute after the popover is closed by an outside click', fakeAsync(() => {
            dispatchMouseEvent(trigger, 'click');
            tick();
            tooltipFixture.detectChanges();

            dispatchMouseEvent(document.body, 'click');
            tick();
            tooltipFixture.detectChanges();
            tick();

            expect(overlayContainerElement.querySelector('.kbq-popover')).toBeFalsy();
            expect(overlayContainerElement.textContent).not.toContain('TOOLTIP');

            // The mute must be released by this closing path too, not just by Escape (the other test above):
            // a genuine mouseleave + mouseenter after the outside click should show the tooltip again.
            dispatchMouseEvent(trigger, 'mouseleave');
            tick();
            tooltipFixture.detectChanges();

            showTooltip();

            expect(overlayContainerElement.textContent).toContain('TOOLTIP');
        }));

        it('should show the tooltip again after the pointer leaves and returns to the trigger', fakeAsync(() => {
            dispatchMouseEvent(trigger, 'click');
            tick();
            tooltipFixture.detectChanges();

            pressEscapeInPanel();

            dispatchMouseEvent(trigger, 'mouseleave');
            tick();
            tooltipFixture.detectChanges();

            showTooltip();

            expect(overlayContainerElement.textContent).toContain('TOOLTIP');
        }));
    });
});

@Component({
    selector: 'popover-simple',
    imports: [KbqPopoverModule],
    template: `
        <button kbqPopover [kbqPopoverContent]="'test'">Popover Trigger</button>
    `
})
class PopoverSimple {
    readonly popoverTrigger = viewChild.required(KbqPopoverTrigger);
    readonly triggerElementRef = viewChild.required(KbqPopoverTrigger, { read: ElementRef });
}

@Component({
    selector: 'popover-close-on-scroll',
    imports: [KbqPopoverModule],
    template: `
        <button kbqPopover [closeOnScroll]="true" [kbqTrigger]="'manual'" [kbqPopoverContent]="'CONTENT'">
            trigger
        </button>
    `
})
class PopoverCloseOnScroll {
    readonly popoverTrigger = viewChild.required(KbqPopoverTrigger);
}

@Component({
    selector: 'popover-test-component',
    imports: [KbqPopoverModule],
    template: `
        <button #test1 kbqPopover [kbqTrigger]="'hover'" [kbqPopoverContent]="'_TEST1'">_TEST1asdasd</button>
        <button
            #test2
            kbqPopover
            kbqPopoverContent="_TEST2"
            [kbqTrigger]="'manual'"
            [kbqPopoverVisible]="popoverVisibility"
        >
            _TEST2
        </button>
        <button #test3 kbqPopover [kbqTrigger]="'focus'" [kbqPopoverContent]="'_TEST3'">_TEST3</button>

        <button #test4 kbqPopover [kbqTrigger]="'hover'" [kbqPopoverHeader]="'_TEST4'">_TEST4</button>
        <button #test5 kbqPopover [kbqTrigger]="'hover'" [kbqPopoverContent]="'_TEST5'">_TEST5</button>
        <button #test6 kbqPopover [kbqTrigger]="'hover'" [kbqPopoverFooter]="'_TEST6'">_TEST6</button>

        <button #test7 kbqPopover [kbqPopoverClass]="'_TEST7'" [kbqPopoverContent]="'_TEST7'">_TEST7</button>
        <!-- Not a button on purpose: the keyboard trigger has to work on any focusable host. -->
        <div #test8 tabindex="0" kbqPopover [kbqPopoverClass]="'_TEST8'" [kbqPopoverContent]="'_TEST8'">_TEST8</div>
    `
})
class PopoverTestComponent {
    popoverVisibility: boolean = false;

    readonly test1 = viewChild.required<ElementRef>('test1');
    readonly test2 = viewChild.required<ElementRef>('test2');
    readonly test3 = viewChild.required<ElementRef>('test3');
    readonly test4 = viewChild.required<ElementRef>('test4');
    readonly test5 = viewChild.required<ElementRef>('test5');
    readonly test6 = viewChild.required<ElementRef>('test6');
    readonly test7 = viewChild.required<ElementRef>('test7');
    readonly test8 = viewChild.required<ElementRef>('test8');
}

@Component({
    selector: 'popover-confirm-test-component',
    imports: [KbqPopoverModule],
    template: `
        <button #test8 kbqPopoverConfirm>_TEST8</button>
        <button #test9 kbqPopoverConfirm kbqPopoverConfirmText="new confirm text">_TEST9</button>
        <button #test10 kbqPopoverConfirm kbqPopoverConfirmButtonText="new button text">_TEST10</button>
        <button #test11 kbqPopoverConfirm [kbqPopoverConfirmText]="confirmText" (confirm)="onConfirm()">_TEST11</button>
        <button #test13 kbqPopoverConfirm [kbqTrigger]="'hover'">_TEST13</button>
    `
})
class PopoverConfirmTestComponent {
    confirmText = 'initial confirm text';

    readonly test8 = viewChild.required<ElementRef>('test8');
    readonly test9 = viewChild.required<ElementRef>('test9');
    readonly test10 = viewChild.required<ElementRef>('test10');
    readonly test11 = viewChild.required<ElementRef>('test11');
    readonly test13 = viewChild.required<ElementRef>('test13');

    onConfirm() {
        return;
    }
}

@Component({
    selector: 'popover-confirm-with-providers-test-component',
    imports: [KbqPopoverModule],
    template: `
        <button #test12 kbqPopoverConfirm>_TEST12</button>
    `,
    providers: [
        { provide: KBQ_POPOVER_CONFIRM_TEXT, useValue: 'provided confirm text' },
        { provide: KBQ_POPOVER_CONFIRM_BUTTON_TEXT, useValue: 'provided button text' }
    ]
})
class PopoverConfirmWithProvidersTestComponent {
    readonly test12 = viewChild.required<ElementRef>('test12');
}

@Component({
    selector: 'popover-with-template-ref',
    imports: [KbqPopoverModule],
    template: `
        <ng-template #popoverHeaderTemplate let-ctx>{{ ctx.header }}</ng-template>
        <ng-template #popoverContentTemplate let-ctx>{{ ctx.content }}</ng-template>
        <ng-template #popoverFooterTemplate let-ctx>{{ ctx.footer }}</ng-template>
        <button
            #trigger
            kbqPopover
            [kbqTrigger]="'hover'"
            [kbqPopoverHeader]="popoverHeaderTemplate"
            [kbqPopoverContent]="popoverContentTemplate"
            [kbqPopoverFooter]="popoverFooterTemplate"
            [kbqPopoverContext]="context"
        >
            Button
        </button>
    `
})
class PopoverWithTemplateRef {
    readonly trigger = viewChild.required<ElementRef>('trigger');
    context = { header: 'header', content: 'content', footer: 'footer' };
}

@Component({
    selector: 'popover-closing-behavior',
    imports: [KbqPopoverModule],
    template: `
        <ng-template #templateHeader>TEMPLATE HEADER</ng-template>
        <button #outside>Outside</button>
        <button
            #trigger
            kbqPopover
            kbqPopoverContent="CONTENT"
            [kbqPopoverHeader]="header"
            [kbqPopoverAriaLabel]="ariaLabel"
            [kbqPopoverDisabled]="disabled"
            [kbqPopoverPreventClose]="preventClose"
            [kbqPopoverHasBackdrop]="hasBackdrop"
            [kbqPopoverBackdropClass]="backdropClass"
            [kbqPopoverHasCloseButton]="hasCloseButton"
            [kbqPopoverCloseOnScroll]="closeOnScroll"
            (kbqPopoverVisibleChange)="onVisibleChange($event)"
        >
            Trigger
        </button>
    `
})
class PopoverClosingBehavior {
    header: string | TemplateRef<unknown> = 'HEADER';
    ariaLabel: string | undefined;
    disabled = false;
    preventClose = false;
    hasBackdrop = false;
    backdropClass = 'cdk-overlay-transparent-backdrop';
    hasCloseButton = false;
    closeOnScroll: boolean | null = null;

    readonly outside = viewChild.required<ElementRef>('outside');
    readonly trigger = viewChild.required<ElementRef>('trigger');
    readonly templateHeader = viewChild.required<TemplateRef<unknown>>('templateHeader');
    readonly popoverTrigger = viewChild.required(KbqPopoverTrigger);

    onVisibleChange(_value: boolean) {
        return;
    }
}

@Component({
    selector: 'popover-hover-behavior',
    imports: [KbqPopoverModule],
    template: `
        <button #outside>Outside</button>
        <button #trigger kbqPopover kbqTrigger="hover" kbqPopoverContent="HOVER">Hover</button>
        <button #instantTrigger kbqPopover kbqTrigger="hover" kbqLeaveDelay="0" kbqPopoverContent="INSTANT">
            Instant
        </button>
        <button
            #closable
            kbqPopover
            kbqTrigger="hover"
            kbqPopoverHasCloseButton
            kbqPopoverHeader="HEADER"
            kbqPopoverContent="CLOSABLE"
        >
            Closable
        </button>
        <button #keyboard kbqPopover kbqTrigger="hover, keydown" kbqPopoverContent="KEYBOARD">Keyboard</button>
    `
})
class PopoverHoverBehavior {
    readonly outside = viewChild.required<ElementRef>('outside');
    readonly trigger = viewChild.required<ElementRef>('trigger');
    readonly instantTrigger = viewChild.required<ElementRef>('instantTrigger');
    readonly closable = viewChild.required<ElementRef>('closable');
    readonly keyboard = viewChild.required<ElementRef>('keyboard');
    readonly keyboardTrigger = viewChild.required('keyboard', { read: KbqPopoverTrigger });
    readonly popoverTrigger = viewChild.required(KbqPopoverTrigger);
}

@Component({
    selector: 'popover-rebuilt-context',
    imports: [KbqPopoverModule],
    template: `
        <ng-template #content let-ctx>{{ ctx.text }}</ng-template>
        <button #trigger kbqPopover [kbqPopoverContent]="content" [kbqPopoverContext]="context">Trigger</button>
    `,
    host: {
        '(document:click)': 'rewriteContext()'
    }
})
class PopoverRebuiltContext {
    readonly trigger = viewChild.required<ElementRef>('trigger');
    readonly popoverTrigger = viewChild.required(KbqPopoverTrigger);

    // Rewritten from the document click handler rather than rebuilt on every pass: a binding that returns a
    // fresh object each time queues a reposition per pass, and the reposition's own tick then feeds the next
    // one — a live-lock that says nothing about the close. What matters here is only that the input is
    // written during the very change-detection pass the outside click runs.
    context = { text: 'CONTENT' };

    rewriteContext() {
        this.context = { text: 'CONTENT' };
    }
}

@Component({
    selector: 'popover-input-aliases',
    imports: [KbqPopoverModule],
    template: `
        <button #bare kbqPopover hasCloseButton kbqPopoverContent="BARE" kbqPopoverHeader="HEADER">Bare</button>
        <button #stringFalse kbqPopover hasCloseButton="false" kbqPopoverContent="FALSE">False</button>
        <button
            #prefixed
            kbqPopover
            kbqPopoverContent="PREFIXED"
            kbqPopoverHeader="HEADER"
            kbqPopoverHasCloseButton
            kbqPopoverHasBackdrop
            [kbqPopoverDefaultPaddings]="false"
        >
            Prefixed
        </button>
    `
})
class PopoverInputAliases {
    readonly bare = viewChild.required<ElementRef>('bare');
    readonly stringFalse = viewChild.required<ElementRef>('stringFalse');
    readonly prefixed = viewChild.required<ElementRef>('prefixed');
}

@Component({
    selector: 'popover-placement',
    imports: [KbqPopoverModule],
    template: `
        <button
            #trigger
            kbqPopover
            [kbqPopoverContent]="content"
            [kbqPopoverPlacement]="placement"
            [kbqPopoverPlacementPriority]="placementPriority"
            [kbqPopoverArrow]="arrow"
            [kbqPopoverStickToWindow]="stickToWindow"
            (kbqPopoverPlacementChange)="onPlacementChange($event)"
        >
            Trigger
        </button>
    `
})
class PopoverPlacement {
    content = 'CONTENT';
    placement: KbqPopUpPlacementValues = 'top';
    placementPriority: KbqPopUpPlacementValues[] | null = null;
    arrow = true;
    stickToWindow: KbqStickToWindowPlacementValues | undefined;

    readonly trigger = viewChild.required<ElementRef>('trigger');
    readonly popoverTrigger = viewChild.required(KbqPopoverTrigger);

    onPlacementChange(_value: KbqPopUpPlacementValues) {
        return;
    }
}

@Component({
    selector: 'popover-fallbacks',
    imports: [KbqPopoverModule],
    template: `
        <button #badPlacement kbqPopover kbqPopoverPlacement="nowhere" kbqPopoverContent="CONTENT">Placement</button>
        <button #badSize kbqPopover kbqPopoverSize="huge" kbqPopoverContent="CONTENT">Size</button>
    `
})
class PopoverFallbacks {
    readonly badPlacement = viewChild.required<ElementRef>('badPlacement');
    readonly badSize = viewChild.required<ElementRef>('badSize');
}

// No `kbqTrigger` binding on purpose: the input alias is shared by both directives, so setting it would
// reconfigure the tooltip and the popover at once. Left at the defaults — `hover, focus` and `click, keydown`.
@Component({
    selector: 'popover-with-tooltip',
    imports: [KbqPopoverModule, KbqToolTipModule],
    template: `
        <button #trigger kbqPopover kbqPopoverHasCloseButton [kbqPopoverContent]="'POPOVER'" [kbqTooltip]="'TOOLTIP'">
            Button
        </button>
    `
})
class PopoverWithTooltip {
    readonly trigger = viewChild.required<ElementRef>('trigger');
}
