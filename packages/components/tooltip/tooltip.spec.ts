import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceElement } from '@angular/cdk/coercion';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, Directive, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqButton, KbqButtonModule } from '@koobiq/components/button';
import {
    ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    ENTER,
    ESCAPE,
    KBQ_PARENT_POPUP,
    KbqParentPopup,
    KbqSiblingPopup,
    kbqSiblingPopupProvider,
    TAB
} from '@koobiq/components/core';
import { KbqIconButton, KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkModule } from '@koobiq/components/link';
import { axe } from 'jest-axe';
import { Subject } from 'rxjs';
import { KBQ_TOOLTIP_SINGLE_INSTANCE_DEFAULT, KbqTooltipRegistry } from './tooltip-registry';
import { KBQ_TOOLTIP_INSTANT_SHOW_WINDOW, KbqCaretVerticalAnchor, KbqTooltipTrigger } from './tooltip.component';
import { KbqToolTipModule } from './tooltip.module';

// KbqPopUpTrigger default enter delay (400ms) plus a buffer for the deferred show.
const tooltipDefaultEnterDelayWithDefer = 410;
const defaultLeaveDelay = 100;

async function openAndAssertTooltip<T>(componentFixture: ComponentFixture<T>, triggerElement: ElementRef) {
    dispatchMouseEvent(coerceElement(triggerElement), 'mouseenter');
    await vi.advanceTimersByTimeAsync(0);
    componentFixture.detectChanges();

    const tooltip = componentFixture.debugElement.query(By.css('.kbq-tooltip'));

    expect(tooltip).toBeTruthy();

    return tooltip;
}

/** Opens a tooltip by hover and settles the deferred show, the reposition timeout and change detection. */
async function showByHover<T>(componentFixture: ComponentFixture<T>, element: HTMLElement) {
    dispatchMouseEvent(element, 'mouseenter');
    componentFixture.detectChanges();
    await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
    componentFixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    componentFixture.detectChanges();
}

/** Opens a tooltip by keyboard focus — a non-keyboard focus origin is ignored by the trigger. */
async function showByKeyboardFocus<T>(componentFixture: ComponentFixture<T>, element: HTMLElement) {
    dispatchKeyboardEvent(document, 'keydown', TAB);
    dispatchFakeEvent(element, 'focus');
    componentFixture.detectChanges();
    await vi.runOnlyPendingTimersAsync();
    componentFixture.detectChanges();
}

describe('KbqTooltip', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqToolTipModule,
                KbqTooltipTestWrapperComponent,
                KbqTooltipDisabledComponent,
                KbqTooltipWithTemplateRefContent,
                TooltipWithSiblingPopup
            ]
        }).compileComponents();
    });

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
        overlayContainer = oc;
        overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    const getTooltip = async (trigger: ElementRef, selector = '.kbq-tooltip'): Promise<Element | null> => {
        dispatchMouseEvent(trigger.nativeElement, 'mouseenter');
        await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);

        return overlayContainer.getContainerElement().querySelector(selector);
    };

    describe('show/hide behavior', () => {
        let fixture: ComponentFixture<KbqTooltipTestWrapperComponent>;
        let component: KbqTooltipTestWrapperComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(KbqTooltipTestWrapperComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should remove the tooltip only once the hide scheduled on mouseleave has run', async () => {
            vi.useFakeTimers();

            const featureKey = 'MOST-SIMPLE';
            const triggerElement = component.mostSimpleTrigger().nativeElement;

            expect(overlayContainerElement.textContent).not.toContain(featureKey);

            await showByHover(fixture, triggerElement);

            expect(overlayContainerElement.textContent).toContain(featureKey);

            // The default `kbqLeaveDelay` is 0, so what keeps the tooltip on screen for one more task is the
            // hide being scheduled rather than any delay. Retention under a pointer that moves onto the
            // tooltip is a `hideWithTimeout` feature and is covered by its own describe.
            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain(featureKey);

            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        });

        it('should show/hide normal tooltip', async () => {
            vi.useFakeTimers();

            const featureKey = 'NORMAL';
            const triggerElement = component.normalTrigger().nativeElement;

            expect(overlayContainerElement.textContent).not.toContain(featureKey);

            dispatchMouseEvent(triggerElement, 'mouseenter');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            await vi.advanceTimersByTimeAsync(defaultLeaveDelay);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        });

        it('should show/hide tooltip by focus', async () => {
            vi.useFakeTimers();

            const featureKey = 'FOCUS';
            const triggerElement = component.focusTrigger().nativeElement;

            dispatchKeyboardEvent(document, 'keydown', TAB);
            dispatchFakeEvent(triggerElement, 'focus');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            expect(overlayContainerElement.textContent).toContain(featureKey);

            dispatchFakeEvent(triggerElement, 'blur');
            await vi.advanceTimersByTimeAsync(defaultLeaveDelay);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        });

        it('should not render arrow when kbqTooltipArrow is false', async () => {
            vi.useFakeTimers();

            let tooltip = await getTooltip(component.dynamicArrowAndOffsetTrigger(), '.kbq-tooltip_arrowless');

            expect(tooltip).toBeFalsy();

            const dynamicArrowAndOffsetTrigger = component.dynamicArrowAndOffsetTrigger();

            dispatchMouseEvent(dynamicArrowAndOffsetTrigger.nativeElement, 'mouseleave');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(defaultLeaveDelay);

            component.arrow = false;
            fixture.detectChanges();

            tooltip = await getTooltip(dynamicArrowAndOffsetTrigger, '.kbq-tooltip_arrowless');

            expect(tooltip).toBeTruthy();
            expect(tooltip?.querySelector('.kbq-tooltip__arrow')).toBeFalsy();
        });
    });

    describe('kbqTooltipDisabled', () => {
        let fixture: ComponentFixture<KbqTooltipDisabledComponent>;
        let component: KbqTooltipDisabledComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(KbqTooltipDisabledComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should not show tooltip when disabled', async () => {
            vi.useFakeTimers();

            const featureKey = 'DISABLED';
            const tooltipDirective = component.disabledDirective();

            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            tooltipDirective.show();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        });

        it('should show tooltip after kbqTooltipDisabled is set to false', async () => {
            vi.useFakeTimers();

            const featureKey = 'DISABLED';
            const tooltipDirective = component.disabledDirective();

            tooltipDirective.disabled = false;
            tooltipDirective.show();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
        });
    });

    describe('with TemplateRef', () => {
        let fixture: ComponentFixture<KbqTooltipWithTemplateRefContent>;
        let component: KbqTooltipWithTemplateRefContent;

        beforeEach(() => {
            fixture = TestBed.createComponent(KbqTooltipWithTemplateRefContent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should pass kbqTooltipContext into TemplateRef content', async () => {
            vi.useFakeTimers();

            const trigger = component.trigger().nativeElement;

            trigger.click();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toEqual(component.tooltipContext.content);
        });
    });

    describe('Overlay offset', () => {
        let fixture: ComponentFixture<TooltipSimple>;
        let componentInstance: TooltipSimple;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipSimple);
            componentInstance = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should add offset for position config if element is less than arrow margin', async () => {
            vi.useFakeTimers();

            const rect = ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT * 2 - 1;

            componentInstance.triggerElementRef().nativeElement.getBoundingClientRect = () => ({
                width: rect,
                height: rect
            });
            fixture.detectChanges();

            await openAndAssertTooltip(fixture, componentInstance.triggerElementRef());

            const strategy: FlexibleConnectedPositionStrategy = componentInstance
                .tooltipTrigger()
                .createOverlay()
                .getConfig().positionStrategy! as FlexibleConnectedPositionStrategy;

            expect(strategy.positions.some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeTruthy();
        });

        it('should not add offset to tooltip position config if element is large', async () => {
            vi.useFakeTimers();

            componentInstance.triggerElementRef().nativeElement.getBoundingClientRect = () => ({
                width: 100,
                height: 100
            });
            fixture.detectChanges();

            await openAndAssertTooltip(fixture, componentInstance.triggerElementRef());

            const strategy: FlexibleConnectedPositionStrategy = componentInstance
                .tooltipTrigger()
                .createOverlay()
                .getConfig().positionStrategy! as FlexibleConnectedPositionStrategy;

            expect(strategy.positions.some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeFalsy();
        });

        it('should not apply adjusted positions if tooltip initialized without arrow', async () => {
            vi.useFakeTimers();

            componentInstance.tooltipTrigger().arrow = false;
            fixture.detectChanges();

            await openAndAssertTooltip(fixture, componentInstance.triggerElementRef());

            const strategy: FlexibleConnectedPositionStrategy = componentInstance
                .tooltipTrigger()
                .createOverlay()
                .getConfig().positionStrategy! as FlexibleConnectedPositionStrategy;

            expect(strategy.positions.some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeFalsy();
        });
    });

    describe('forDisabledComponent input', () => {
        let fixture: ComponentFixture<KbqTooltipForDisabledComponent>;
        let component: KbqTooltipForDisabledComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(KbqTooltipForDisabledComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should set attributes for kbqButton', async () => {
            vi.useFakeTimers();

            const triggerElement = component.buttonTooltip().getNativeElement();

            expect(triggerElement.getAttribute('tabindex')).toBe('-1');
            expect(component.buttonTooltip().disabled).toBe(true);

            component.disableState = true;
            fixture.detectChanges();

            expect(triggerElement.getAttribute('tabindex')).toBe('0');
            expect(component.buttonTooltip().disabled).toBe(false);
        });

        it('should set attributes for kbqIconButton', async () => {
            vi.useFakeTimers();

            const triggerElement = component.iconButtonTooltip().getNativeElement();

            expect(triggerElement.getAttribute('tabindex')).toBe('-1');
            expect(component.iconButtonTooltip().disabled).toBe(true);

            component.disableState = true;
            fixture.detectChanges();

            expect(triggerElement.getAttribute('tabindex')).toBe('0');
            expect(component.iconButtonTooltip().disabled).toBe(false);
        });

        it('should set attributes for kbqLink', async () => {
            vi.useFakeTimers();

            const triggerElement = component.linkTooltip().getNativeElement();

            expect(triggerElement.getAttribute('tabindex')).toBe('-1');
            expect(component.linkTooltip().disabled).toBe(true);

            component.disableState = true;
            fixture.detectChanges();

            expect(triggerElement.getAttribute('tabindex')).toBe('0');
            expect(component.linkTooltip().disabled).toBe(false);
        });
    });

    describe('reactive modifier and header inputs', () => {
        let fixture: ComponentFixture<KbqTooltipReactiveInputsComponent>;
        let component: KbqTooltipReactiveInputsComponent;

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [KbqToolTipModule, KbqTooltipReactiveInputsComponent]
            });
            inject([OverlayContainer], (oc: OverlayContainer) => {
                overlayContainer = oc;
                overlayContainerElement = oc.getContainerElement();
            })();

            fixture = TestBed.createComponent(KbqTooltipReactiveInputsComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should refresh the tooltip class map when [kbqTooltipModifier] changes while open', async () => {
            vi.useFakeTimers();

            await openAndAssertTooltip(fixture, component.triggerElementRef());

            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-tooltip_warning')).toBeFalsy();

            component.modifier = 'warning';
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            expect(overlayContainerElement.querySelector('.kbq-tooltip_warning')).toBeTruthy();

            // Cleanup the open overlay so trailing timers don't leak into other tests.
            component.tooltipTrigger().hide();
            await vi.advanceTimersByTimeAsync(defaultLeaveDelay);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should refresh the rendered header when [kbqTooltipHeader] changes while open', async () => {
            vi.useFakeTimers();

            component.modifier = 'extended';
            component.header = 'initial header';
            fixture.detectChanges();

            await openAndAssertTooltip(fixture, component.triggerElementRef());

            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            const headerEl = () => overlayContainerElement.querySelector<HTMLElement>('.kbq-tooltip__header');

            expect(headerEl()?.textContent?.trim()).toBe('initial header');

            component.header = 'updated header';
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            expect(headerEl()?.textContent?.trim()).toBe('updated header');

            component.tooltipTrigger().hide();
            await vi.advanceTimersByTimeAsync(defaultLeaveDelay);
            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('single visible tooltip', () => {
        let fixture: ComponentFixture<KbqTooltipSingleInstanceComponent>;
        let component: KbqTooltipSingleInstanceComponent;
        let registry: KbqTooltipRegistry;

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [KbqToolTipModule, KbqTooltipSingleInstanceComponent]
            });
            inject([OverlayContainer], (oc: OverlayContainer) => {
                overlayContainer = oc;
                overlayContainerElement = oc.getContainerElement();
            })();

            registry = TestBed.inject(KbqTooltipRegistry);
            fixture = TestBed.createComponent(KbqTooltipSingleInstanceComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should hide the previously visible tooltip when another one is shown', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(overlayContainerElement.textContent).toContain('HOVER-A');

            await showByKeyboardFocus(fixture, component.focusTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('FOCUS-B');
            expect(overlayContainerElement.textContent).not.toContain('HOVER-A');
        });

        it('should hide the previously visible tooltip opened by click', async () => {
            vi.useFakeTimers();

            dispatchMouseEvent(component.clickTrigger().nativeElement, 'click');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('CLICK-E');

            await showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(overlayContainerElement.textContent).toContain('HOVER-A');
            expect(overlayContainerElement.textContent).not.toContain('CLICK-E');
        });

        it('should close the previous tooltip when shown via showForMouseEvent', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(overlayContainerElement.textContent).toContain('HOVER-A');

            // `showForMouseEvent` calls `KbqPopUpTrigger.show` directly, bypassing `KbqTooltipTrigger.show`.
            const element: HTMLElement = component.clickTrigger().nativeElement;
            const clickDirective = component.clickDirective();

            element.addEventListener('mouseover', (event) => clickDirective.showForMouseEvent(event as MouseEvent));
            dispatchMouseEvent(element, 'mouseover');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('CLICK-E');
            expect(overlayContainerElement.textContent).not.toContain('HOVER-A');
        });

        it('should force-close a tooltip via hideAsInactive even while its own overlay is hovered', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(overlayContainerElement.textContent).toContain('HOVER-A');

            const hoverDirective = component.hoverDirective()!;

            // Reproduce the exact state `hide()` silently no-ops on: the last recorded trigger event is
            // `mouseleave`, and the pop-up itself reports being hovered (mouse moved onto its own panel).
            dispatchMouseEvent(overlayContainerElement.querySelector('kbq-tooltip-component')!, 'mouseenter');
            expect(hoverDirective['instance'].hovered()).toBe(true);
            hoverDirective.triggerName = 'mouseleave';
            hoverDirective.hide(0);
            await vi.advanceTimersByTimeAsync(defaultLeaveDelay);
            fixture.detectChanges();

            // Confirms the guard: an ordinary hide() attempt in this state is indeed a no-op.
            expect(overlayContainerElement.textContent).toContain('HOVER-A');

            // hideAsInactive() (triggered by the registry below) is documented to bypass that guard.
            await showByKeyboardFocus(fixture, component.focusTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('FOCUS-B');
            expect(overlayContainerElement.textContent).not.toContain('HOVER-A');
        });

        it('should keep both tooltips visible when kbqTooltipSingleInstance is false', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.hoverTrigger()!.nativeElement);
            await showByHover(fixture, component.independentTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('INDEPENDENT-D');
            expect(overlayContainerElement.textContent).toContain('HOVER-A');
        });

        it('should not close a manually controlled tooltip', async () => {
            vi.useFakeTimers();

            component.manualDirective().show(0);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('MANUAL-C');

            await showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(overlayContainerElement.textContent).toContain('HOVER-A');
            expect(overlayContainerElement.textContent).toContain('MANUAL-C');
        });

        it('should not be closed by a manually controlled tooltip', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.hoverTrigger()!.nativeElement);

            component.manualDirective().show(0);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('MANUAL-C');
            expect(overlayContainerElement.textContent).toContain('HOVER-A');
        });

        it('should emit kbqVisibleChange(false) for the automatically closed tooltip', async () => {
            vi.useFakeTimers();

            const visibleChangeSpy = vi.fn();

            component.hoverDirective()!.visibleChange.subscribe(visibleChangeSpy);

            await showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(visibleChangeSpy).toHaveBeenLastCalledWith(true);

            await showByKeyboardFocus(fixture, component.focusTrigger().nativeElement);

            expect(visibleChangeSpy).toHaveBeenLastCalledWith(false);
            expect(component.hoverDirective()!.isOpen).toBe(false);
        });

        it('should release the destroyed trigger so it is not retained as the visible one', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(registry['visibleTooltip']).toBe(component.hoverDirective());

            component.hoverTriggerRendered = false;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(registry['visibleTooltip']).toBeNull();
        });

        it('should not retroactively exempt a tooltip that is toggled out of the group while still open', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.toggleableTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('TOGGLE-F');

            component.toggleableSingleInstance = false;
            fixture.detectChanges();

            await showByKeyboardFocus(fixture, component.focusTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('FOCUS-B');
            // Characterizes current behavior: `participatesInSingleInstance` is only read once, inside the
            // `visibleChange` subscription set up in the constructor — flipping `kbqTooltipSingleInstance`
            // while the tooltip is already open does not retroactively free its registry slot.
            expect(overlayContainerElement.textContent).not.toContain('TOGGLE-F');
        });
    });

    describe('single visible tooltip / app-wide default disabled via DI', () => {
        let fixture: ComponentFixture<KbqTooltipSingleInstanceComponent>;
        let component: KbqTooltipSingleInstanceComponent;

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [KbqToolTipModule, KbqTooltipSingleInstanceComponent],
                providers: [{ provide: KBQ_TOOLTIP_SINGLE_INSTANCE_DEFAULT, useValue: false }]
            });
            inject([OverlayContainer], (oc: OverlayContainer) => {
                overlayContainer = oc;
                overlayContainerElement = oc.getContainerElement();
            })();

            fixture = TestBed.createComponent(KbqTooltipSingleInstanceComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should keep both tooltips visible when the app-wide default is provided as false', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(overlayContainerElement.textContent).toContain('HOVER-A');

            await showByKeyboardFocus(fixture, component.focusTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('FOCUS-B');
            expect(overlayContainerElement.textContent).toContain('HOVER-A');
        });
    });

    describe('pop-up on the same element', () => {
        let fixture: ComponentFixture<TooltipWithSiblingPopup>;
        let component: TooltipWithSiblingPopup;
        let trigger: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipWithSiblingPopup);
            component = fixture.componentInstance;
            fixture.detectChanges();

            trigger = component.trigger().nativeElement;
        });

        it('should hide a visible tooltip when the pop-up opens', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, trigger);

            expect(overlayContainerElement.textContent).toContain('SIBLING');

            component.popup().open();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).not.toContain('SIBLING');
        });

        it('should cancel a pending show when the pop-up opens', async () => {
            vi.useFakeTimers();

            dispatchMouseEvent(trigger, 'mouseenter');
            fixture.detectChanges();

            component.popup().open();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).not.toContain('SIBLING');
            await vi.runOnlyPendingTimersAsync();
        });

        it('should not show the tooltip while a sibling is attached, even before it announces opening', async () => {
            vi.useFakeTimers();

            // Models the gap between a sibling's overlay attaching and its `openedChange` actually firing —
            // e.g. select/tree-select only emit it once their open CSS animation finishes.
            component.popup().isAttached = true;

            dispatchMouseEvent(trigger, 'mouseenter');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).not.toContain('SIBLING');
        });

        it('should not show the tooltip on hover while the pop-up is open', async () => {
            vi.useFakeTimers();

            component.popup().open();
            await vi.runOnlyPendingTimersAsync();

            await showByHover(fixture, trigger);

            expect(overlayContainerElement.textContent).not.toContain('SIBLING');
        });

        it('should not show the tooltip when the closing pop-up restores focus to the trigger', async () => {
            vi.useFakeTimers();

            component.popup().open();
            await vi.runOnlyPendingTimersAsync();

            // How `KbqPopoverComponent.onEscape` closes: it restores focus to the trigger with a `keyboard`
            // origin (passing the tooltip's own focus-origin gate) before the overlay is actually detached —
            // `isAttached` is still `true` at this point, which is what must keep the tooltip suppressed.
            await showByKeyboardFocus(fixture, trigger);

            expect(overlayContainerElement.textContent).not.toContain('SIBLING');
        });

        it('should not show the tooltip on the mouseenter replayed when the pop-up overlay is removed', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, trigger);

            component.popup().open();
            await vi.runOnlyPendingTimersAsync();
            // Inserting a backdrop over the trigger makes the browser fire `mouseleave` without the pointer
            // having moved; removing it fires the matching `mouseenter`.
            dispatchMouseEvent(trigger, 'mouseleave');
            component.popup().close();
            component.popup().detach();

            await showByHover(fixture, trigger);

            expect(overlayContainerElement.textContent).not.toContain('SIBLING');
        });

        it('should show the tooltip again after the pointer leaves the trigger', async () => {
            vi.useFakeTimers();

            component.popup().open();
            await vi.runOnlyPendingTimersAsync();
            component.popup().close();
            component.popup().detach();

            dispatchMouseEvent(trigger, 'mouseleave');
            await vi.runOnlyPendingTimersAsync();

            await showByHover(fixture, trigger);

            expect(overlayContainerElement.textContent).toContain('SIBLING');
        });

        it('should show the tooltip again after the focus leaves the trigger', async () => {
            vi.useFakeTimers();

            component.popup().open();
            await vi.runOnlyPendingTimersAsync();
            component.popup().close();
            component.popup().detach();

            dispatchFakeEvent(trigger, 'blur');
            await vi.runOnlyPendingTimersAsync();

            await showByKeyboardFocus(fixture, trigger);

            expect(overlayContainerElement.textContent).toContain('SIBLING');
        });

        it('should not mute a tooltip that is driven imperatively', async () => {
            vi.useFakeTimers();

            component.manualPopup().open();
            await vi.runOnlyPendingTimersAsync();

            component.manualTooltip().show();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('MANUAL');
        });
    });

    describe('accessibility', () => {
        let fixture: ComponentFixture<TooltipAccessibility>;
        let component: TooltipAccessibility;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipAccessibility);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        const tooltipElement = () => overlayContainerElement.querySelector<HTMLElement>('.kbq-tooltip');

        it('should render the tooltip as role="tooltip" with an id', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.trigger().nativeElement);

            expect(tooltipElement()?.getAttribute('role')).toBe('tooltip');
            expect(tooltipElement()?.id).toBeTruthy();

            await vi.runOnlyPendingTimersAsync();
        });

        it('should mark the arrow as decorative', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.trigger().nativeElement);

            expect(tooltipElement()?.querySelector('.kbq-tooltip__arrow')?.getAttribute('aria-hidden')).toBe('true');

            await vi.runOnlyPendingTimersAsync();
        });

        it('should describe the trigger by the open tooltip and stop describing it once hidden', async () => {
            vi.useFakeTimers();

            const triggerElement = component.trigger().nativeElement;

            expect(triggerElement.hasAttribute('aria-describedby')).toBe(false);

            await showByHover(fixture, triggerElement);

            expect(triggerElement.getAttribute('aria-describedby')).toBe(tooltipElement()?.id);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(triggerElement.hasAttribute('aria-describedby')).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should keep the ids the consumer already put on the trigger', async () => {
            vi.useFakeTimers();

            const triggerElement = component.describedTrigger().nativeElement;

            await showByHover(fixture, triggerElement);

            expect(triggerElement.getAttribute('aria-describedby')).toBe(`external-hint ${tooltipElement()?.id}`);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(triggerElement.getAttribute('aria-describedby')).toBe('external-hint');

            await vi.runOnlyPendingTimersAsync();
        });

        it('should not describe a trigger whose tooltip only repeats its own text', async () => {
            vi.useFakeTimers();

            const triggerElement = component.selfDescribingTrigger().nativeElement;

            await showByHover(fixture, triggerElement);

            expect(triggerElement.hasAttribute('aria-describedby')).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should drop the description when the trigger is destroyed while the tooltip is open', async () => {
            vi.useFakeTimers();

            const triggerElement = component.trigger().nativeElement;

            await showByHover(fixture, triggerElement);

            expect(triggerElement.hasAttribute('aria-describedby')).toBe(true);

            fixture.destroy();

            expect(triggerElement.hasAttribute('aria-describedby')).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should close a hover tooltip on Escape even though the trigger has no focus', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.trigger().nativeElement);

            expect(component.tooltipTrigger().isOpen).toBe(true);

            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should not close an imperatively driven tooltip on Escape', async () => {
            vi.useFakeTimers();

            component.manualTooltip().show(0);
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(component.manualTooltip().isOpen).toBe(true);

            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(component.manualTooltip().isOpen).toBe(true);

            component.manualTooltip().hide(0);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should leave Escape for the overlay underneath the tooltip', async () => {
            vi.useFakeTimers();

            const underlyingOverlay = TestBed.inject(Overlay).create();

            underlyingOverlay.attach(new ComponentPortal(OverlayPanel));

            const keydown = vi.fn();

            underlyingOverlay.keydownEvents().subscribe(keydown);

            await showByHover(fixture, component.trigger().nativeElement);

            expect(component.tooltipTrigger().isOpen).toBe(true);

            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            // CDK hands each keydown to the last attached overlay that has subscribers and stops there. A
            // tooltip is by construction the last overlay attached, so joining that chain would make it
            // swallow Escape for the modal, sidepanel or inline edit underneath it.
            expect(keydown).toHaveBeenCalled();
            expect(component.tooltipTrigger().isOpen).toBe(false);

            underlyingOverlay.dispose();
            await vi.runOnlyPendingTimersAsync();
        });

        it('has no axe violations while a tooltip is open', async () => {
            component.tooltipTrigger().show(0);
            fixture.detectChanges();
            await new Promise((resolve) => setTimeout(resolve));
            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
            expect(await axe(overlayContainerElement)).toHaveNoViolations();
        });
    });

    describe('focus origin', () => {
        let fixture: ComponentFixture<TooltipFocusTrigger>;
        let component: TooltipFocusTrigger;
        let triggerElement: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipFocusTrigger);
            component = fixture.componentInstance;
            fixture.detectChanges();

            triggerElement = component.trigger().nativeElement;
        });

        // The origin is set through `focusVia` rather than a synthetic `mousedown`: CDK reads pointer
        // interactions from `InputModalityDetector`, which treats a `MouseEvent` carrying no pressed button
        // as a screen-reader-synthesized click and reports it as `keyboard`.
        it('should not show the tooltip on the focus that follows a pointer interaction', async () => {
            vi.useFakeTimers();

            TestBed.inject(FocusMonitor).focusVia(triggerElement, 'mouse');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should show the tooltip on keyboard focus', async () => {
            vi.useFakeTimers();

            await showByKeyboardFocus(fixture, triggerElement);

            expect(component.tooltipTrigger().isOpen).toBe(true);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should not show the tooltip on an unattributed focus', async () => {
            vi.useFakeTimers();

            // CDK reports `program` both for focus the application moved and for any focus it could not
            // attribute, so the gate cannot admit it. Deliberate programmatic focus goes through
            // `focusVia(element, 'keyboard')`, which the case above covers.
            dispatchFakeEvent(triggerElement, 'focus');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should open on Enter for a keydown trigger even after a pointer-originated focus', async () => {
            vi.useFakeTimers();

            TestBed.inject(FocusMonitor).focusVia(triggerElement, 'mouse');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);

            expect(component.tooltipTrigger().isOpen).toBe(false);

            dispatchKeyboardEvent(triggerElement, 'keydown', ENTER);
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(true);

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('enter delay', () => {
        let fixture: ComponentFixture<TooltipPair>;
        let component: TooltipPair;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipPair);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should apply the full enter delay to the first tooltip', async () => {
            vi.useFakeTimers();

            dispatchMouseEvent(component.first().nativeElement, 'mouseenter');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(399);

            expect(component.firstTrigger().isOpen).toBe(false);

            await vi.advanceTimersByTimeAsync(2);

            expect(component.firstTrigger().isOpen).toBe(true);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should show a following tooltip without the enter delay', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.first().nativeElement);
            dispatchMouseEvent(component.first().nativeElement, 'mouseleave');
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            dispatchMouseEvent(component.second().nativeElement, 'mouseenter');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(1);

            expect(component.secondTrigger().isOpen).toBe(true);

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('enter delay / instant-show window disabled via DI', () => {
        let fixture: ComponentFixture<TooltipPair>;
        let component: TooltipPair;

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [KbqToolTipModule, TooltipPair],
                providers: [{ provide: KBQ_TOOLTIP_INSTANT_SHOW_WINDOW, useValue: 0 }]
            });
            inject([OverlayContainer], (oc: OverlayContainer) => {
                overlayContainer = oc;
                overlayContainerElement = oc.getContainerElement();
            })();

            fixture = TestBed.createComponent(TooltipPair);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should apply the enter delay to every tooltip when the window is zero', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.first().nativeElement);
            dispatchMouseEvent(component.first().nativeElement, 'mouseleave');
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            dispatchMouseEvent(component.second().nativeElement, 'mouseenter');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(1);

            expect(component.secondTrigger().isOpen).toBe(false);

            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);

            expect(component.secondTrigger().isOpen).toBe(true);

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('hideWithTimeout and kbqLeaveDelay', () => {
        let fixture: ComponentFixture<TooltipHideWithTimeout>;
        let component: TooltipHideWithTimeout;
        let triggerElement: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipHideWithTimeout);
            component = fixture.componentInstance;
            fixture.detectChanges();

            triggerElement = component.trigger().nativeElement;
        });

        it('should hide exactly one leave delay after the pointer leaves', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, triggerElement);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(999);

            expect(component.tooltipTrigger().isOpen).toBe(true);

            await vi.advanceTimersByTimeAsync(2);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should cancel the pending hide when the pointer comes back', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, triggerElement);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(500);

            dispatchMouseEvent(triggerElement, 'mouseenter');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(1500);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(true);

            component.tooltipTrigger().hide(0);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should cancel the pending hide while the pointer rests on the tooltip', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, triggerElement);

            const popUpElement = overlayContainerElement.querySelector<HTMLElement>('kbq-tooltip-component')!;

            dispatchMouseEvent(triggerElement, 'mouseleave');
            dispatchMouseEvent(popUpElement, 'mouseenter');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(1500);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(true);

            component.tooltipTrigger().hideAsInactive();
            await vi.runOnlyPendingTimersAsync();
        });

        it('should leave no pending hide behind when the trigger is destroyed during the leave delay', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, triggerElement);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(500);

            fixture.destroy();
            await vi.runOnlyPendingTimersAsync();

            expect(overlayContainerElement.querySelector('.kbq-tooltip')).toBeNull();
        });
    });

    describe('kbqLeaveDelay without hideWithTimeout', () => {
        let fixture: ComponentFixture<TooltipLeaveDelay>;
        let component: TooltipLeaveDelay;
        let triggerElement: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipLeaveDelay);
            component = fixture.componentInstance;
            fixture.detectChanges();

            triggerElement = component.trigger().nativeElement;
        });

        // `hideWithTimeout` only adds the hover watchdog on top: the delay itself is what `hide()` defaults to,
        // so it applies to every hide. Both API tables document it that way.
        it('should wait out the leave delay on mouseleave', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, triggerElement);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(999);

            expect(component.tooltipTrigger().isOpen).toBe(true);

            await vi.advanceTimersByTimeAsync(2);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should wait out the leave delay on blur', async () => {
            vi.useFakeTimers();

            await showByKeyboardFocus(fixture, triggerElement);

            dispatchFakeEvent(triggerElement, 'blur');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(999);

            expect(component.tooltipTrigger().isOpen).toBe(true);

            await vi.advanceTimersByTimeAsync(2);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('reactive arrow and offset inputs', () => {
        let fixture: ComponentFixture<TooltipArrowAndOffset>;
        let component: TooltipArrowAndOffset;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipArrowAndOffset);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        const tooltipElement = () => overlayContainerElement.querySelector<HTMLElement>('.kbq-tooltip');

        it('should render the arrow when [kbqTooltipArrow] is set while the tooltip is open', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.trigger().nativeElement);

            expect(tooltipElement()?.querySelector('.kbq-tooltip__arrow')).toBeFalsy();

            component.arrow = true;
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(tooltipElement()?.querySelector('.kbq-tooltip__arrow')).toBeTruthy();

            await vi.runOnlyPendingTimersAsync();
        });

        it('should re-apply the margins when [kbqTooltipOffset] changes while the tooltip is open', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.trigger().nativeElement);

            expect(tooltipElement()?.style.marginBottom).toBe('');

            component.offset = 24;
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(tooltipElement()?.style.marginBottom).toBe('24px');

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('kbqTooltipColor', () => {
        let fixture: ComponentFixture<TooltipColor>;
        let component: TooltipColor;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipColor);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        const tooltipClasses = () => overlayContainerElement.querySelector('.kbq-tooltip')!.classList;

        it('should default to the contrast color class', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.trigger().nativeElement);

            expect(tooltipClasses()).toContain('kbq-contrast');

            await vi.runOnlyPendingTimersAsync();
        });

        for (const color of ['contrast-fade', 'theme', 'warning', 'error']) {
            it(`should apply the ${color} color class`, async () => {
                vi.useFakeTimers();

                component.color = color;
                fixture.detectChanges();

                await showByHover(fixture, component.trigger().nativeElement);

                expect(tooltipClasses()).toContain(`kbq-${color}`);

                await vi.runOnlyPendingTimersAsync();
            });
        }

        it('should read back the assigned color rather than its CSS class', async () => {
            vi.useFakeTimers();

            const trigger = component.tooltipTrigger();

            trigger.color = 'error';

            // A consumer reading the input and writing it straight back must not end up with `kbq-kbq-error`.
            const readBack = trigger.color;

            trigger.color = readBack;
            fixture.detectChanges();

            expect(trigger.color).toBe('error');

            await showByHover(fixture, component.trigger().nativeElement);

            expect(tooltipClasses()).toContain('kbq-error');

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('kbqTooltipContext', () => {
        let fixture: ComponentFixture<TooltipFalsyContext>;
        let component: TooltipFalsyContext;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipFalsyContext);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should pass a falsy context into the template', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.trigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('0');

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('kbqRelativeToPointer', () => {
        let fixture: ComponentFixture<TooltipRelativeToPointer>;
        let component: TooltipRelativeToPointer;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipRelativeToPointer);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should anchor the tooltip to the cursor instead of the host element', async () => {
            vi.useFakeTimers();

            const trigger = component.tooltipTrigger();

            trigger.createOverlay();

            const setOrigin = vi.spyOn(trigger['strategy'], 'setOrigin');

            await showByHover(fixture, component.trigger().nativeElement);

            expect(setOrigin).toHaveBeenCalledWith(expect.objectContaining({ y: expect.any(Number) }));

            await vi.runOnlyPendingTimersAsync();
        });

        it('should keep [kbqPlacementPriority] intact across a cursor-relative show', async () => {
            vi.useFakeTimers();

            const trigger = component.tooltipTrigger();

            expect(trigger['placementPriority']).toEqual(['top', 'bottom']);

            await showByHover(fixture, component.trigger().nativeElement);

            expect(trigger['placementPriority']).toEqual(['top', 'bottom']);

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('kbqRelativeToCaret', () => {
        let fixture: ComponentFixture<TooltipRelativeToCaret>;
        let component: TooltipRelativeToCaret;

        /** Opens a manually triggered tooltip and hands back the spy on its position strategy. */
        const showAndSpy = async (trigger: KbqTooltipTrigger) => {
            trigger.createOverlay();

            const setOrigin = vi.spyOn(trigger['strategy'], 'setOrigin');

            trigger.show();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            return setOrigin;
        };

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipRelativeToCaret);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should anchor the tooltip to the caret of the host field', async () => {
            vi.useFakeTimers();

            const setOrigin = await showAndSpy(component.fieldTooltip());

            expect(setOrigin).toHaveBeenCalledWith(
                expect.objectContaining({
                    x: expect.any(Number),
                    y: expect.any(Number),
                    width: expect.any(Number),
                    height: expect.any(Number)
                })
            );

            component.fieldTooltip().hide(0);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should anchor the tooltip to the field the host wraps', async () => {
            vi.useFakeTimers();

            const setOrigin = await showAndSpy(component.wrapperTooltip());

            expect(setOrigin).toHaveBeenCalledWith(expect.objectContaining({ height: expect.any(Number) }));

            component.wrapperTooltip().hide(0);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should fall back to the host element when there is no field to measure', async () => {
            vi.useFakeTimers();

            const host = component.plain().nativeElement;

            host.getBoundingClientRect = () => ({ left: 5, top: 7, width: 40, height: 20 }) as DOMRect;

            const setOrigin = await showAndSpy(component.plainTooltip());

            expect(setOrigin).toHaveBeenCalledWith(expect.objectContaining({ x: 5, y: 7, width: 40, height: 20 }));

            component.plainTooltip().hide(0);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should measure nothing while nothing lays the tooltip out, as on the server', async () => {
            vi.useFakeTimers();

            const trigger = component.fieldTooltip();

            trigger.createOverlay();
            // Outside the browser the position strategy skips layout, and the server DOM has no geometry to read.
            Object.assign(trigger['strategy'], { _platform: { isBrowser: false } });
            Object.defineProperty(component.field().nativeElement, 'getBoundingClientRect', {
                value: undefined,
                configurable: true
            });

            await expect(
                (async () => {
                    trigger.show();
                    await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
                    fixture.detectChanges();
                })()
            ).resolves.toBeUndefined();

            trigger.hide(0);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should measure the caret again whenever the origin is read', async () => {
            vi.useFakeTimers();

            const trigger = component.fieldTooltip();
            const setOrigin = await showAndSpy(trigger);
            const origin = setOrigin.mock.calls[0][0] as { x: number };
            const field = component.field().nativeElement;

            field.getBoundingClientRect = () => ({ left: 10, top: 100, width: 200, height: 32 }) as DOMRect;
            await fixture.whenStable();

            const before = origin.x;

            field.getBoundingClientRect = () => ({ left: 60, top: 100, width: 200, height: 32 }) as DOMRect;
            await fixture.whenStable();

            expect(origin.x - before).toBe(50);

            trigger.hide(0);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should follow the caret while the field is edited, free to change the placement', async () => {
            vi.useFakeTimers();

            const trigger = component.fieldTooltip();

            await showAndSpy(trigger);

            const updatePosition = vi.spyOn(trigger['overlayRef']!, 'updatePosition');
            const withLockedPosition = vi.spyOn(trigger['strategy'], 'withLockedPosition');

            dispatchFakeEvent(component.field().nativeElement, 'input');

            expect(updatePosition).toHaveBeenCalled();
            expect(withLockedPosition.mock.calls).toEqual([[false], [true]]);

            trigger.hide(0);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should stop following the caret once the tooltip is closed', async () => {
            vi.useFakeTimers();

            const trigger = component.fieldTooltip();

            await showAndSpy(trigger);

            const updatePosition = vi.spyOn(trigger['overlayRef']!, 'updatePosition');

            trigger.hide(0);
            await vi.runOnlyPendingTimersAsync();
            updatePosition.mockClear();

            dispatchFakeEvent(component.field().nativeElement, 'input');

            expect(updatePosition).not.toHaveBeenCalled();
        });

        it('should anchor to the host element again once kbqRelativeToCaret is switched off', async () => {
            vi.useFakeTimers();

            const trigger = component.fieldTooltip();
            const setOrigin = await showAndSpy(trigger);
            const origin = setOrigin.mock.calls[0][0] as { height: number };

            component.field().nativeElement.getBoundingClientRect = () =>
                ({ left: 10, top: 100, width: 200, height: 48 }) as DOMRect;
            trigger.relativeToCaretVertical = 'line';
            await fixture.whenStable();

            expect(origin.height).not.toBe(48);

            trigger.relativeToCaret = false;
            await fixture.whenStable();

            expect(origin.height).toBe(48);

            trigger.hide(0);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should align the arrow against the caret instead of the whole field', () => {
            const trigger = component.fieldTooltip();

            component.field().nativeElement.getBoundingClientRect = () =>
                ({ left: 10, top: 100, width: 300, height: 32 }) as DOMRect;

            expect(trigger['getAnchorSize']().width).toBe(0);

            trigger.relativeToCaret = false;

            expect(trigger['getAnchorSize']().width).toBe(300);
        });

        describe('kbqRelativeToCaretVertical', () => {
            /** jsdom lays nothing out; the field box is what tells the two vertical anchors apart. */
            const setFieldBox = (element: HTMLElement, top: number, height: number) => {
                element.getBoundingClientRect = () =>
                    ({ left: 10, top, width: 200, height, right: 210, bottom: top + height, x: 10, y: top }) as DOMRect;
            };

            it('should anchor to the whole single-line input by default', async () => {
                vi.useFakeTimers();

                setFieldBox(component.field().nativeElement, 100, 32);

                const setOrigin = await showAndSpy(component.fieldTooltip());

                expect(setOrigin).toHaveBeenCalledWith(expect.objectContaining({ y: 100, height: 32 }));

                component.fieldTooltip().hide(0);
                await vi.runOnlyPendingTimersAsync();
            });

            it('should anchor to the caret line of a textarea by default', async () => {
                vi.useFakeTimers();

                setFieldBox(component.textarea().nativeElement, 200, 80);

                const setOrigin = await showAndSpy(component.wrapperTooltip());

                expect(setOrigin).toHaveBeenCalledWith(expect.objectContaining({ height: expect.any(Number) }));
                expect(setOrigin).not.toHaveBeenCalledWith(expect.objectContaining({ height: 80 }));

                component.wrapperTooltip().hide(0);
                await vi.runOnlyPendingTimersAsync();
            });

            it('should anchor to the caret line of an input when set to line', async () => {
                vi.useFakeTimers();

                component.fieldVertical = 'line';
                fixture.detectChanges();
                setFieldBox(component.field().nativeElement, 100, 32);

                const setOrigin = await showAndSpy(component.fieldTooltip());

                expect(setOrigin).not.toHaveBeenCalledWith(expect.objectContaining({ height: 32 }));

                component.fieldTooltip().hide(0);
                await vi.runOnlyPendingTimersAsync();
            });

            it('should anchor to the whole textarea when set to field', async () => {
                vi.useFakeTimers();

                component.wrapperVertical = 'field';
                fixture.detectChanges();
                setFieldBox(component.textarea().nativeElement, 200, 80);

                const setOrigin = await showAndSpy(component.wrapperTooltip());

                expect(setOrigin).toHaveBeenCalledWith(expect.objectContaining({ y: 200, height: 80 }));

                component.wrapperTooltip().hide(0);
                await vi.runOnlyPendingTimersAsync();
            });
        });

        it('should take precedence over kbqRelativeToPointer', async () => {
            vi.useFakeTimers();

            const trigger = component.fieldTooltip();
            const applyRelativeToPointer = vi.spyOn(trigger as never, 'applyRelativeToPointer');

            await showAndSpy(trigger);

            expect(applyRelativeToPointer).not.toHaveBeenCalled();

            trigger.hide(0);
            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('imperative show', () => {
        let fixture: ComponentFixture<TooltipImperative>;
        let component: TooltipImperative;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipImperative);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should not attach an overlay while the content is empty', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.emptyTrigger().nativeElement);

            expect(component.emptyTooltip().isAttached).toBe(false);

            component.content = 'FILLED';
            fixture.detectChanges();

            await showByHover(fixture, component.emptyTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('FILLED');

            await vi.runOnlyPendingTimersAsync();
        });

        it('should no-op instead of throwing when showForElement runs on a disabled trigger', async () => {
            vi.useFakeTimers();

            const host = component.emptyTrigger().nativeElement;

            expect(() => component.disabledTooltip().showForElement(host)).not.toThrow();
            expect(component.disabledTooltip().isAttached).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should anchor showForElement to the passed element', async () => {
            vi.useFakeTimers();

            const host = component.emptyTrigger().nativeElement;
            const trigger = component.enabledTooltip();

            trigger.createOverlay();

            const setOrigin = vi.spyOn(trigger['strategy'], 'setOrigin');

            trigger.showForElement(host);
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(setOrigin).toHaveBeenCalledWith(host);

            trigger.hide(0);
            await vi.runOnlyPendingTimersAsync();
        });

        it('should reset the open state when the overlay is detached without a hide', async () => {
            vi.useFakeTimers();

            const trigger = component.enabledTooltip();
            const visibility: boolean[] = [];

            trigger.visibleChange.subscribe((value) => visibility.push(value));

            trigger.show(0);
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(trigger.isOpen).toBe(true);

            // What the close-on-scroll strategy does: the pop-up is destroyed without `hide()` ever running.
            trigger['overlayRef']!.detach();
            fixture.detectChanges();

            expect(trigger.isOpen).toBe(false);
            expect(visibility).toEqual([true, false]);

            trigger.show(0);
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(trigger.isOpen).toBe(true);
            expect(overlayContainerElement.textContent).toContain('ENABLED');

            trigger.hide(0);
            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('showForMouseEvent re-anchoring', () => {
        let fixture: ComponentFixture<TooltipSharedByCells>;
        let component: TooltipSharedByCells;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipSharedByCells);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        /** Shows the shared tooltip for a cell the way a table does — through a real pointer event. */
        const showForCell = (cell: HTMLElement) => {
            const listener = (event: Event) => component.tooltip().showForMouseEvent(event as MouseEvent);

            cell.addEventListener('mouseover', listener);
            dispatchMouseEvent(cell, 'mouseover');
            cell.removeEventListener('mouseover', listener);
        };

        it('should move aria-describedby onto the element the tooltip is re-anchored to', async () => {
            vi.useFakeTimers();

            const cellA = component.cellA().nativeElement;
            const cellB = component.cellB().nativeElement;

            showForCell(cellA);
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            const tooltipId = overlayContainerElement.querySelector('.kbq-tooltip')!.id;

            expect(cellA.getAttribute('aria-describedby')).toBe(tooltipId);

            // Both boundary events of one pointer move are dispatched in the same task, so the tooltip is
            // re-anchored while it is still attached and the hide scheduled for cell A has not run.
            component.tooltip().hide();
            showForCell(cellB);
            fixture.detectChanges();

            expect(cellA.hasAttribute('aria-describedby')).toBe(false);
            expect(cellB.getAttribute('aria-describedby')).toBe(tooltipId);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should not attach a pane while the shared tooltip has no content', async () => {
            vi.useFakeTimers();

            component.tooltip().content = '';
            fixture.detectChanges();

            showForCell(component.cellA().nativeElement);
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-tooltip')).toBeNull();

            // An empty pane would latch: `KbqPopUpTrigger.show` returns early for as long as one is
            // attached, so the tooltip would never show again once content arrives.
            component.tooltip().content = 'SHARED';
            fixture.detectChanges();

            showForCell(component.cellA().nativeElement);
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-tooltip')).not.toBeNull();

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('parent pop-up', () => {
        let fixture: ComponentFixture<TooltipInsideParentPopup>;
        let component: TooltipInsideParentPopup;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipInsideParentPopup);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should hide the tooltip when the parent pop-up closes', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.trigger().nativeElement);

            expect(component.tooltipTrigger().isOpen).toBe(true);

            component.parentPopup().closedStream.next(false);
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('ignoreTooltipPointerEvents', () => {
        let fixture: ComponentFixture<TooltipPointerEvents>;
        let component: TooltipPointerEvents;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipPointerEvents);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        const paneClasses = (trigger: KbqTooltipTrigger) => trigger['overlayRef']!.overlayElement.classList;

        it('should keep the pane hoverable by default', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.hoverable().nativeElement);

            expect(paneClasses(component.hoverableTooltip())).not.toContain('cdk-overlay-pane_ignore-pointer-events');

            await vi.runOnlyPendingTimersAsync();
        });

        it('should make the pane click-through when the input is set', async () => {
            vi.useFakeTimers();

            await showByHover(fixture, component.clickThrough().nativeElement);

            expect(paneClasses(component.clickThroughTooltip())).toContain('cdk-overlay-pane_ignore-pointer-events');

            await vi.runOnlyPendingTimersAsync();
        });

        it('should make the pane click-through for a trigger the pointer cannot drive', async () => {
            vi.useFakeTimers();

            component.manualTooltip().show(0);
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            expect(paneClasses(component.manualTooltip())).toContain('cdk-overlay-pane_ignore-pointer-events');

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('lifecycle', () => {
        let fixture: ComponentFixture<TooltipSimple>;
        let component: TooltipSimple;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipSimple);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should complete the pop-up visibility stream when the tooltip is torn down', async () => {
            vi.useFakeTimers();

            const trigger = component.tooltipTrigger();

            await showByHover(fixture, component.triggerElementRef().nativeElement);

            let completed = false;

            trigger['instance'].visibleChange.subscribe({ complete: () => (completed = true) });

            trigger.hide(0);
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(completed).toBe(true);
        });

        it('should report the hover state of the trigger', async () => {
            vi.useFakeTimers();

            const trigger = component.tooltipTrigger();
            const triggerElement = component.triggerElementRef().nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');

            expect(trigger.hovered()).toBe(true);

            dispatchMouseEvent(triggerElement, 'mouseleave');

            expect(trigger.hovered()).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should subscribe to the closing actions once per open', async () => {
            vi.useFakeTimers();

            const trigger = component.tooltipTrigger();
            const closingActions = vi.spyOn(trigger, 'closingActions');

            await showByHover(fixture, component.triggerElementRef().nativeElement);

            expect(closingActions).toHaveBeenCalledTimes(1);

            await vi.runOnlyPendingTimersAsync();
        });
    });

    describe('forDisabledComponent precedence', () => {
        let fixture: ComponentFixture<TooltipForDisabledWithExplicitState>;
        let component: TooltipForDisabledWithExplicitState;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipForDisabledWithExplicitState);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should let an explicit [kbqTooltipDisabled] win over the wrapped control state', () => {
            expect(component.explicitTooltip().disabled).toBe(true);

            component.controlDisabled = true;
            fixture.detectChanges();

            expect(component.explicitTooltip().disabled).toBe(true);
        });

        it('should not leave an inline outline behind after a disable/enable cycle', () => {
            const host = component.derivedTooltip().getNativeElement();

            component.controlDisabled = true;
            fixture.detectChanges();

            expect(host.classList).toContain('kbq-tooltip-trigger_for-disabled');
            expect(host.getAttribute('role')).toBe('group');

            component.controlDisabled = false;
            fixture.detectChanges();

            expect(host.classList).not.toContain('kbq-tooltip-trigger_for-disabled');
            expect(host.hasAttribute('role')).toBe(false);
            expect(host.style.outlineColor).toBe('');
        });

        it('should let an explicit false ask for a hint the wrapped control state would not have produced', () => {
            // The base fold lets the input win in both directions. Only `true` is pinned above, and `true`
            // agrees with the derived state here — this is the row where the two genuinely disagree.
            expect(component.enabledTooltip().disabled).toBe(false);
        });

        it('should hide an open tooltip once the wrapped control stops being disabled', async () => {
            vi.useFakeTimers();

            component.controlDisabled = true;
            fixture.detectChanges();

            component.derivedTooltip().show();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('DERIVED');

            // The hint exists only to explain a control the user cannot reach, so re-enabling the control
            // takes its reason away. Closing it has to happen there and then, not whenever a pointer next
            // leaves — the pane may be sitting over the control that just became clickable.
            component.controlDisabled = false;
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).not.toContain('DERIVED');
        });
    });
});

/**
 * Stand-in for a popover/dropdown/select sharing the host element with a tooltip. Announcing the close and
 * detaching the overlay are separate steps on purpose — that is the gap in which the real pop-ups restore
 * focus to their trigger and let the browser replay `mouseenter`.
 */
@Directive({
    selector: '[siblingPopup]',
    providers: [kbqSiblingPopupProvider(SiblingPopup)],
    exportAs: 'siblingPopup'
})
class SiblingPopup implements KbqSiblingPopup {
    isAttached = false;

    readonly openedChange = new Subject<boolean>();

    open(): void {
        this.isAttached = true;
        this.openedChange.next(true);
    }

    close(): void {
        this.openedChange.next(false);
    }

    detach(): void {
        this.isAttached = false;
    }
}

@Component({
    selector: 'tooltip-with-sibling-popup',
    imports: [KbqToolTipModule, SiblingPopup],
    template: `
        <button #trigger siblingPopup [kbqTooltip]="'SIBLING'">Show</button>
        <button #manualTrigger siblingPopup [kbqTooltip]="'MANUAL'" [kbqTrigger]="'manual'">Show</button>
    `
})
class TooltipWithSiblingPopup {
    readonly trigger = viewChild.required<ElementRef>('trigger');
    readonly popup = viewChild.required('trigger', { read: SiblingPopup });
    readonly manualPopup = viewChild.required('manualTrigger', { read: SiblingPopup });
    readonly manualTooltip = viewChild.required('manualTrigger', { read: KbqTooltipTrigger });
}

@Component({
    selector: 'kbq-tooltip-single-instance',
    imports: [KbqToolTipModule],
    template: `
        @if (hoverTriggerRendered) {
            <span #hoverTrigger [kbqTooltip]="'HOVER-A'">A</span>
        }

        <span #focusTrigger [kbqTrigger]="'focus'" [kbqTooltip]="'FOCUS-B'">B</span>
        <span #manualTrigger [kbqTrigger]="'manual'" [kbqTooltip]="'MANUAL-C'">C</span>
        <span #independentTrigger [kbqTooltip]="'INDEPENDENT-D'" [kbqTooltipSingleInstance]="false">D</span>
        <span #clickTrigger [kbqTrigger]="'click'" [kbqTooltip]="'CLICK-E'">E</span>
        <span #toggleableTrigger [kbqTooltip]="'TOGGLE-F'" [kbqTooltipSingleInstance]="toggleableSingleInstance">
            F
        </span>
    `
})
class KbqTooltipSingleInstanceComponent {
    readonly hoverTrigger = viewChild<ElementRef>('hoverTrigger');
    readonly hoverDirective = viewChild('hoverTrigger', { read: KbqTooltipTrigger });
    readonly focusTrigger = viewChild.required<ElementRef>('focusTrigger');
    readonly manualDirective = viewChild.required('manualTrigger', { read: KbqTooltipTrigger });
    readonly independentTrigger = viewChild.required<ElementRef>('independentTrigger');
    readonly clickTrigger = viewChild.required<ElementRef>('clickTrigger');
    readonly clickDirective = viewChild.required('clickTrigger', { read: KbqTooltipTrigger });
    readonly toggleableTrigger = viewChild.required<ElementRef>('toggleableTrigger');

    toggleableSingleInstance = true;

    hoverTriggerRendered = true;
}

@Component({
    selector: 'kbq-tooltip-reactive-inputs',
    imports: [KbqToolTipModule],
    template: `
        <span #trigger [kbqTooltip]="'CONTENT'" [kbqTooltipModifier]="modifier" [kbqTooltipHeader]="header">Show</span>
    `
})
export class KbqTooltipReactiveInputsComponent {
    readonly triggerElementRef = viewChild.required<ElementRef>('trigger');
    readonly tooltipTrigger = viewChild.required('trigger', { read: KbqTooltipTrigger });

    modifier: 'default' | 'warning' | 'extended' = 'default';
    header: string = '';
}

@Component({
    selector: 'tooltip-simple',
    imports: [KbqToolTipModule],
    template: `
        <button [kbqTooltip]="'MOST-SIMPLE'" [kbqTooltipArrow]="true">Show</button>
    `
})
export class TooltipSimple {
    readonly tooltipTrigger = viewChild.required(KbqTooltipTrigger);
    readonly triggerElementRef = viewChild.required(KbqTooltipTrigger, { read: ElementRef });
}

@Component({
    selector: 'kbq-tooltip-test-wrapper',
    imports: [KbqToolTipModule],
    template: `
        <a #mostSimpleTrigger [kbqTooltip]="'MOST-SIMPLE'">Show</a>

        <span #normalTrigger [kbqTooltip]="'NORMAL'" [kbqTrigger]="'hover'" [kbqPlacement]="'right'">Show</span>

        <span #focusTrigger [kbqTooltip]="'FOCUS'" [kbqTrigger]="'focus'">Show</span>
        <span #dynamicArrowAndOffsetTrigger [kbqTooltip]="'ArrowAndOffset'" [kbqTooltipArrow]="arrow">Show</span>
    `
})
class KbqTooltipTestWrapperComponent {
    readonly normalTrigger = viewChild.required<ElementRef>('normalTrigger');
    readonly focusTrigger = viewChild.required<ElementRef>('focusTrigger');
    readonly mostSimpleTrigger = viewChild.required<ElementRef>('mostSimpleTrigger');
    readonly dynamicArrowAndOffsetTrigger = viewChild.required<ElementRef>('dynamicArrowAndOffsetTrigger');

    arrow: boolean = true;
}

@Component({
    selector: 'kbq-tooltip-disabled-wrapper',
    imports: [KbqToolTipModule],
    template: `
        <span #disabledAttribute [kbqTooltip]="'DISABLED'" [kbqTrigger]="'manual'" [kbqTooltipDisabled]="true">
            Disabled
        </span>
    `
})
class KbqTooltipDisabledComponent {
    readonly disabledDirective = viewChild.required('disabledAttribute', { read: KbqTooltipTrigger });
}

@Component({
    selector: 'kbq-tooltip-wih-template-ref-content',
    imports: [KbqToolTipModule],
    template: `
        <ng-template #tooltipContent let-ctx>
            <div>{{ ctx.content }}</div>
        </ng-template>
        <button #trigger kbqTrigger="click" [kbqTooltip]="tooltipContent" [kbqTooltipContext]="tooltipContext">
            Button
        </button>
    `
})
class KbqTooltipWithTemplateRefContent {
    readonly trigger = viewChild.required<ElementRef>('trigger');
    tooltipContext = { content: 'TestContent' };
}

@Component({
    selector: 'kbq-tooltip-for-disabled-component',
    imports: [KbqToolTipModule, KbqButtonModule, KbqIconModule, KbqLinkModule],
    template: `
        <div #buttonTooltip="kbqTooltip" kbqTooltip="kbq-button" [forDisabledComponent]="button">
            <button #button kbq-button aria-label="Create" [disabled]="disableState">
                <i kbq-icon="kbq-plus_16"></i>
            </button>
        </div>

        <div #iconButtonTooltip="kbqTooltip" kbqTooltip="kbq-icon-button" [forDisabledComponent]="iconButton">
            <i #iconButton #button kbq-icon-button="kbq-plus_16" color="theme" [disabled]="disableState"></i>
        </div>

        <div #linkTooltip="kbqTooltip" kbqTooltip="kbq-link" [forDisabledComponent]="link">
            <a #link="kbqLink" kbq-link kbqTooltip="Create" href="http://localhost:8080" [disabled]="disableState">
                kbq-link
            </a>
        </div>
    `
})
class KbqTooltipForDisabledComponent {
    readonly button = viewChild.required(KbqButton);
    readonly buttonTooltip = viewChild.required<KbqTooltipTrigger>('buttonTooltip');
    readonly iconButton = viewChild.required(KbqIconButton);
    readonly iconButtonTooltip = viewChild.required<KbqTooltipTrigger>('iconButtonTooltip');
    readonly link = viewChild.required(KbqLink);
    readonly linkTooltip = viewChild.required<KbqTooltipTrigger>('linkTooltip');

    disableState: boolean = false;
}

@Component({
    selector: 'tooltip-accessibility',
    imports: [KbqToolTipModule],
    template: `
        <span #trigger [kbqTooltip]="'HINT'" [kbqTooltipArrow]="true">Trigger</span>
        <span #describedTrigger aria-describedby="external-hint" [kbqTooltip]="'HINT'">Trigger</span>
        <span #selfDescribingTrigger [kbqTooltip]="'Self'">Self</span>
        <span #manualTrigger [kbqTrigger]="'manual'" [kbqTooltip]="'PINNED'">Trigger</span>
    `
})
class TooltipAccessibility {
    readonly trigger = viewChild.required<ElementRef>('trigger');
    readonly tooltipTrigger = viewChild.required('trigger', { read: KbqTooltipTrigger });
    readonly describedTrigger = viewChild.required<ElementRef>('describedTrigger');
    readonly selfDescribingTrigger = viewChild.required<ElementRef>('selfDescribingTrigger');
    readonly manualTooltip = viewChild.required('manualTrigger', { read: KbqTooltipTrigger });
}

@Component({
    selector: 'tooltip-focus-trigger',
    imports: [KbqToolTipModule],
    template: `
        <span #trigger tabindex="0" [kbqTrigger]="'focus, keydown'" [kbqTooltip]="'FOCUS'">Show</span>
    `
})
class TooltipFocusTrigger {
    readonly trigger = viewChild.required<ElementRef>('trigger');
    readonly tooltipTrigger = viewChild.required('trigger', { read: KbqTooltipTrigger });
}

@Component({
    selector: 'tooltip-pair',
    imports: [KbqToolTipModule],
    template: `
        <span #first [kbqTooltip]="'FIRST'">First</span>
        <span #second [kbqTooltip]="'SECOND'">Second</span>
    `
})
class TooltipPair {
    readonly first = viewChild.required<ElementRef>('first');
    readonly firstTrigger = viewChild.required('first', { read: KbqTooltipTrigger });
    readonly second = viewChild.required<ElementRef>('second');
    readonly secondTrigger = viewChild.required('second', { read: KbqTooltipTrigger });
}

@Component({
    selector: 'tooltip-hide-with-timeout',
    imports: [KbqToolTipModule],
    template: `
        <span #trigger [kbqTooltip]="'TIMED'" [kbqTrigger]="'hover'" [kbqLeaveDelay]="1000" [hideWithTimeout]="true">
            Show
        </span>
    `
})
class TooltipHideWithTimeout {
    readonly trigger = viewChild.required<ElementRef>('trigger');
    readonly tooltipTrigger = viewChild.required('trigger', { read: KbqTooltipTrigger });
}

@Component({
    selector: 'tooltip-leave-delay',
    imports: [KbqToolTipModule],
    template: `
        <span #trigger tabindex="0" [kbqTooltip]="'DELAYED'" [kbqLeaveDelay]="1000">Show</span>
    `
})
class TooltipLeaveDelay {
    readonly trigger = viewChild.required<ElementRef>('trigger');
    readonly tooltipTrigger = viewChild.required('trigger', { read: KbqTooltipTrigger });
}

@Component({
    selector: 'tooltip-arrow-and-offset',
    imports: [KbqToolTipModule],
    template: `
        <span #trigger [kbqTooltip]="'ARROW'" [kbqTooltipArrow]="arrow" [kbqTooltipOffset]="offset">Show</span>
    `
})
class TooltipArrowAndOffset {
    readonly trigger = viewChild.required<ElementRef>('trigger');

    arrow = false;
    offset: number | null = null;
}

@Component({
    selector: 'tooltip-color',
    imports: [KbqToolTipModule],
    template: `
        <span #trigger [kbqTooltip]="'COLORED'" [kbqTooltipColor]="color">Show</span>
    `
})
class TooltipColor {
    readonly trigger = viewChild.required<ElementRef>('trigger');
    readonly tooltipTrigger = viewChild.required('trigger', { read: KbqTooltipTrigger });

    color = '';
}

@Component({
    selector: 'tooltip-falsy-context',
    imports: [KbqToolTipModule],
    template: `
        <ng-template #content let-value>{{ value }}</ng-template>
        <span #trigger [kbqTooltip]="content" [kbqTooltipContext]="0">Show</span>
    `
})
class TooltipFalsyContext {
    readonly trigger = viewChild.required<ElementRef>('trigger');
}

@Component({
    selector: 'tooltip-relative-to-pointer',
    imports: [KbqToolTipModule],
    template: `
        <span
            #trigger
            [kbqTooltip]="'POINTER'"
            [kbqRelativeToPointer]="true"
            [kbqPlacementPriority]="['top', 'bottom']"
        >
            Show
        </span>
    `
})
class TooltipRelativeToPointer {
    readonly trigger = viewChild.required<ElementRef>('trigger');
    readonly tooltipTrigger = viewChild.required('trigger', { read: KbqTooltipTrigger });
}

@Component({
    selector: 'tooltip-relative-to-caret',
    imports: [KbqToolTipModule],
    template: `
        <input
            #field
            [kbqRelativeToCaret]="true"
            [kbqRelativeToCaretVertical]="fieldVertical"
            [kbqRelativeToPointer]="true"
            [kbqTooltip]="'CARET'"
            [kbqTrigger]="'manual'"
        />
        <div
            #wrapper
            [kbqRelativeToCaret]="true"
            [kbqRelativeToCaretVertical]="wrapperVertical"
            [kbqTooltip]="'WRAPPED'"
            [kbqTrigger]="'manual'"
        >
            <textarea #textarea></textarea>
        </div>
        <span #plain [kbqTooltip]="'PLAIN'" [kbqRelativeToCaret]="true" [kbqTrigger]="'manual'">Show</span>
    `
})
class TooltipRelativeToCaret {
    fieldVertical: KbqCaretVerticalAnchor = 'auto';
    wrapperVertical: KbqCaretVerticalAnchor = 'auto';

    readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
    readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');
    readonly plain = viewChild.required<ElementRef>('plain');
    readonly fieldTooltip = viewChild.required('field', { read: KbqTooltipTrigger });
    readonly wrapperTooltip = viewChild.required('wrapper', { read: KbqTooltipTrigger });
    readonly plainTooltip = viewChild.required('plain', { read: KbqTooltipTrigger });
}

@Component({
    selector: 'tooltip-imperative',
    imports: [KbqToolTipModule],
    template: `
        <span #emptyTrigger [kbqTooltip]="content">Show</span>
        <span #disabledTrigger [kbqTooltip]="'DISABLED'" [kbqTooltipDisabled]="true">Show</span>
        <span #enabledTrigger [kbqTrigger]="'manual'" [kbqTooltip]="'ENABLED'">Show</span>
    `
})
class TooltipImperative {
    readonly emptyTrigger = viewChild.required<ElementRef>('emptyTrigger');
    readonly emptyTooltip = viewChild.required('emptyTrigger', { read: KbqTooltipTrigger });
    readonly disabledTooltip = viewChild.required('disabledTrigger', { read: KbqTooltipTrigger });
    readonly enabledTooltip = viewChild.required('enabledTrigger', { read: KbqTooltipTrigger });

    content = '';
}

/** One tooltip shared by several elements, the way a virtualized table anchors a hint to the hovered cell. */
@Component({
    selector: 'tooltip-shared-by-cells',
    imports: [KbqToolTipModule],
    template: `
        <span #owner [kbqTrigger]="'manual'" [kbqTooltip]="'SHARED'">Owner</span>
        <span #cellA>A</span>
        <span #cellB>B</span>
    `
})
class TooltipSharedByCells {
    readonly tooltip = viewChild.required('owner', { read: KbqTooltipTrigger });
    readonly cellA = viewChild.required<ElementRef>('cellA');
    readonly cellB = viewChild.required<ElementRef>('cellB');
}

/** Content of the overlay a tooltip is opened on top of. */
@Component({
    selector: 'overlay-panel',
    template: `
        <div>PANEL</div>
    `
})
class OverlayPanel {}

/** Stand-in for the select/tree-select panel that hosts a tooltip and announces its own closing. */
@Directive({
    selector: '[parentPopup]',
    providers: [{ provide: KBQ_PARENT_POPUP, useExisting: ParentPopup }]
})
class ParentPopup implements KbqParentPopup {
    readonly closedStream = new Subject<boolean>();
}

@Component({
    selector: 'tooltip-inside-parent-popup',
    imports: [KbqToolTipModule, ParentPopup],
    template: `
        <div parentPopup>
            <span #trigger [kbqTooltip]="'CHILD'">Show</span>
        </div>
    `
})
class TooltipInsideParentPopup {
    readonly trigger = viewChild.required<ElementRef>('trigger');
    readonly tooltipTrigger = viewChild.required('trigger', { read: KbqTooltipTrigger });
    readonly parentPopup = viewChild.required(ParentPopup);
}

@Component({
    selector: 'tooltip-pointer-events',
    imports: [KbqToolTipModule],
    template: `
        <span #hoverable [kbqTooltip]="'HOVERABLE'">Show</span>
        <span #clickThrough [kbqTooltip]="'CLICK-THROUGH'" [ignoreTooltipPointerEvents]="true">Show</span>
        <span #manual [kbqTooltip]="'MANUAL'" [kbqTrigger]="'manual'">Show</span>
    `
})
class TooltipPointerEvents {
    readonly hoverable = viewChild.required<ElementRef>('hoverable');
    readonly hoverableTooltip = viewChild.required('hoverable', { read: KbqTooltipTrigger });
    readonly clickThrough = viewChild.required<ElementRef>('clickThrough');
    readonly clickThroughTooltip = viewChild.required('clickThrough', { read: KbqTooltipTrigger });
    readonly manualTooltip = viewChild.required('manual', { read: KbqTooltipTrigger });
}

@Component({
    selector: 'tooltip-for-disabled-with-explicit-state',
    imports: [KbqToolTipModule, KbqButtonModule],
    template: `
        <div
            #explicitTooltip="kbqTooltip"
            kbqTooltip="EXPLICIT"
            [forDisabledComponent]="explicitButton"
            [kbqTooltipDisabled]="true"
        >
            <button #explicitButton kbq-button [disabled]="controlDisabled">Explicit</button>
        </div>

        <div #derivedTooltip="kbqTooltip" kbqTooltip="DERIVED" [forDisabledComponent]="derivedButton">
            <button #derivedButton kbq-button [disabled]="controlDisabled">Derived</button>
        </div>

        <div
            #enabledTooltip="kbqTooltip"
            kbqTooltip="ENABLED"
            [forDisabledComponent]="enabledButton"
            [kbqTooltipDisabled]="false"
        >
            <button #enabledButton kbq-button [disabled]="controlDisabled">Enabled</button>
        </div>
    `
})
class TooltipForDisabledWithExplicitState {
    readonly explicitTooltip = viewChild.required<KbqTooltipTrigger>('explicitTooltip');
    readonly derivedTooltip = viewChild.required<KbqTooltipTrigger>('derivedTooltip');
    readonly enabledTooltip = viewChild.required<KbqTooltipTrigger>('enabledTooltip');

    controlDisabled = false;
}
