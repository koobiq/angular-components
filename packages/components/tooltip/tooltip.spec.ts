import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceElement } from '@angular/cdk/coercion';
import { FlexibleConnectedPositionStrategy, OverlayContainer } from '@angular/cdk/overlay';
import { Component, Directive, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
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
import { KBQ_TOOLTIP_INSTANT_SHOW_WINDOW, KbqTooltipTrigger } from './tooltip.component';
import { KbqToolTipModule } from './tooltip.module';

// KbqPopUpTrigger default enter delay (400ms) plus a buffer for the deferred show.
const tooltipDefaultEnterDelayWithDefer = 410;
const defaultLeaveDelay = 100;

function openAndAssertTooltip<T>(componentFixture: ComponentFixture<T>, triggerElement: ElementRef) {
    dispatchMouseEvent(coerceElement(triggerElement), 'mouseenter');
    tick();
    componentFixture.detectChanges();

    const tooltip = componentFixture.debugElement.query(By.css('.kbq-tooltip'));

    expect(tooltip).toBeTruthy();

    return tooltip;
}

/** Opens a tooltip by hover and settles the deferred show, the reposition timeout and change detection. */
function showByHover<T>(componentFixture: ComponentFixture<T>, element: HTMLElement) {
    dispatchMouseEvent(element, 'mouseenter');
    componentFixture.detectChanges();
    tick(tooltipDefaultEnterDelayWithDefer);
    componentFixture.detectChanges();
    tick();
    componentFixture.detectChanges();
}

/** Opens a tooltip by keyboard focus — a non-keyboard focus origin is ignored by the trigger. */
function showByKeyboardFocus<T>(componentFixture: ComponentFixture<T>, element: HTMLElement) {
    dispatchKeyboardEvent(document, 'keydown', TAB);
    dispatchFakeEvent(element, 'focus');
    componentFixture.detectChanges();
    flush();
    componentFixture.detectChanges();
}

describe('KbqTooltip', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqToolTipModule,
                NoopAnimationsModule,
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
    });

    const getTooltip = (trigger: ElementRef, selector = '.kbq-tooltip'): Element | null => {
        dispatchMouseEvent(trigger.nativeElement, 'mouseenter');
        tick(tooltipDefaultEnterDelayWithDefer);

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

        it('should remove the tooltip only once the hide scheduled on mouseleave has run', fakeAsync(() => {
            const featureKey = 'MOST-SIMPLE';
            const triggerElement = component.mostSimpleTrigger().nativeElement;

            expect(overlayContainerElement.textContent).not.toContain(featureKey);

            showByHover(fixture, triggerElement);

            expect(overlayContainerElement.textContent).toContain(featureKey);

            // The default `kbqLeaveDelay` is 0, so what keeps the tooltip on screen for one more task is the
            // hide being scheduled rather than any delay. Retention under a pointer that moves onto the
            // tooltip is a `hideWithTimeout` feature and is covered by its own describe.
            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain(featureKey);

            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));

        it('should show/hide normal tooltip', fakeAsync(() => {
            const featureKey = 'NORMAL';
            const triggerElement = component.normalTrigger().nativeElement;

            expect(overlayContainerElement.textContent).not.toContain(featureKey);

            dispatchMouseEvent(triggerElement, 'mouseenter');
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            tick(defaultLeaveDelay);
            fixture.detectChanges();
            tick();
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));

        it('should show/hide tooltip by focus', fakeAsync(() => {
            const featureKey = 'FOCUS';
            const triggerElement = component.focusTrigger().nativeElement;

            dispatchKeyboardEvent(document, 'keydown', TAB);
            dispatchFakeEvent(triggerElement, 'focus');
            fixture.detectChanges();
            flush();
            expect(overlayContainerElement.textContent).toContain(featureKey);

            dispatchFakeEvent(triggerElement, 'blur');
            tick(defaultLeaveDelay);
            fixture.detectChanges();
            tick();
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));

        it('should not render arrow when kbqTooltipArrow is false', fakeAsync(() => {
            let tooltip = getTooltip(component.dynamicArrowAndOffsetTrigger(), '.kbq-tooltip_arrowless');

            expect(tooltip).toBeFalsy();

            const dynamicArrowAndOffsetTrigger = component.dynamicArrowAndOffsetTrigger();

            dispatchMouseEvent(dynamicArrowAndOffsetTrigger.nativeElement, 'mouseleave');
            fixture.detectChanges();
            tick(defaultLeaveDelay);

            component.arrow = false;
            fixture.detectChanges();

            tooltip = getTooltip(dynamicArrowAndOffsetTrigger, '.kbq-tooltip_arrowless');

            expect(tooltip).toBeTruthy();
            expect(tooltip?.querySelector('.kbq-tooltip__arrow')).toBeFalsy();
        }));
    });

    describe('kbqTooltipDisabled', () => {
        let fixture: ComponentFixture<KbqTooltipDisabledComponent>;
        let component: KbqTooltipDisabledComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(KbqTooltipDisabledComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should not show tooltip when disabled', fakeAsync(() => {
            const featureKey = 'DISABLED';
            const tooltipDirective = component.disabledDirective();

            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            tooltipDirective.show();
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));

        it('should show tooltip after kbqTooltipDisabled is set to false', fakeAsync(() => {
            const featureKey = 'DISABLED';
            const tooltipDirective = component.disabledDirective();

            tooltipDirective.disabled = false;
            tooltipDirective.show();
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
        }));
    });

    describe('with TemplateRef', () => {
        let fixture: ComponentFixture<KbqTooltipWithTemplateRefContent>;
        let component: KbqTooltipWithTemplateRefContent;

        beforeEach(() => {
            fixture = TestBed.createComponent(KbqTooltipWithTemplateRefContent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should pass kbqTooltipContext into TemplateRef content', fakeAsync(() => {
            const trigger = component.trigger().nativeElement;

            trigger.click();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toEqual(component.tooltipContext.content);
        }));
    });

    describe('Overlay offset', () => {
        let fixture: ComponentFixture<TooltipSimple>;
        let componentInstance: TooltipSimple;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipSimple);
            componentInstance = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should add offset for position config if element is less than arrow margin', fakeAsync(() => {
            const rect = ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT * 2 - 1;

            componentInstance.triggerElementRef().nativeElement.getBoundingClientRect = () => ({
                width: rect,
                height: rect
            });
            fixture.detectChanges();

            openAndAssertTooltip(fixture, componentInstance.triggerElementRef());

            const strategy: FlexibleConnectedPositionStrategy = componentInstance
                .tooltipTrigger()
                .createOverlay()
                .getConfig().positionStrategy! as FlexibleConnectedPositionStrategy;

            expect(strategy.positions.some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeTruthy();
        }));

        it('should not add offset to tooltip position config if element is large', fakeAsync(() => {
            componentInstance.triggerElementRef().nativeElement.getBoundingClientRect = () => ({
                width: 100,
                height: 100
            });
            fixture.detectChanges();

            openAndAssertTooltip(fixture, componentInstance.triggerElementRef());

            const strategy: FlexibleConnectedPositionStrategy = componentInstance
                .tooltipTrigger()
                .createOverlay()
                .getConfig().positionStrategy! as FlexibleConnectedPositionStrategy;

            expect(strategy.positions.some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeFalsy();
        }));

        it('should not apply adjusted positions if tooltip initialized without arrow', fakeAsync(() => {
            componentInstance.tooltipTrigger().arrow = false;
            fixture.detectChanges();

            openAndAssertTooltip(fixture, componentInstance.triggerElementRef());

            const strategy: FlexibleConnectedPositionStrategy = componentInstance
                .tooltipTrigger()
                .createOverlay()
                .getConfig().positionStrategy! as FlexibleConnectedPositionStrategy;

            expect(strategy.positions.some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeFalsy();
        }));
    });

    describe('forDisabledComponent input', () => {
        let fixture: ComponentFixture<KbqTooltipForDisabledComponent>;
        let component: KbqTooltipForDisabledComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(KbqTooltipForDisabledComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should set attributes for kbqButton', fakeAsync(() => {
            const triggerElement = component.buttonTooltip().getNativeElement();

            expect(triggerElement.getAttribute('tabindex')).toBe('-1');
            expect(component.buttonTooltip().disabled).toBe(true);

            component.disableState = true;
            fixture.detectChanges();

            expect(triggerElement.getAttribute('tabindex')).toBe('0');
            expect(component.buttonTooltip().disabled).toBe(false);
        }));

        it('should set attributes for kbqIconButton', fakeAsync(() => {
            const triggerElement = component.iconButtonTooltip().getNativeElement();

            expect(triggerElement.getAttribute('tabindex')).toBe('-1');
            expect(component.iconButtonTooltip().disabled).toBe(true);

            component.disableState = true;
            fixture.detectChanges();

            expect(triggerElement.getAttribute('tabindex')).toBe('0');
            expect(component.iconButtonTooltip().disabled).toBe(false);
        }));

        it('should set attributes for kbqLink', fakeAsync(() => {
            const triggerElement = component.linkTooltip().getNativeElement();

            expect(triggerElement.getAttribute('tabindex')).toBe('-1');
            expect(component.linkTooltip().disabled).toBe(true);

            component.disableState = true;
            fixture.detectChanges();

            expect(triggerElement.getAttribute('tabindex')).toBe('0');
            expect(component.linkTooltip().disabled).toBe(false);
        }));
    });

    describe('reactive modifier and header inputs', () => {
        let fixture: ComponentFixture<KbqTooltipReactiveInputsComponent>;
        let component: KbqTooltipReactiveInputsComponent;

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [KbqToolTipModule, NoopAnimationsModule, KbqTooltipReactiveInputsComponent]
            });
            inject([OverlayContainer], (oc: OverlayContainer) => {
                overlayContainer = oc;
                overlayContainerElement = oc.getContainerElement();
            })();

            fixture = TestBed.createComponent(KbqTooltipReactiveInputsComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should refresh the tooltip class map when [kbqTooltipModifier] changes while open', fakeAsync(() => {
            openAndAssertTooltip(fixture, component.triggerElementRef());

            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-tooltip_warning')).toBeFalsy();

            component.modifier = 'warning';
            fixture.detectChanges();
            tick();

            expect(overlayContainerElement.querySelector('.kbq-tooltip_warning')).toBeTruthy();

            // Cleanup the open overlay so trailing timers don't leak into other tests.
            component.tooltipTrigger().hide();
            tick(defaultLeaveDelay);
            flush();
        }));

        it('should refresh the rendered header when [kbqTooltipHeader] changes while open', fakeAsync(() => {
            component.modifier = 'extended';
            component.header = 'initial header';
            fixture.detectChanges();

            openAndAssertTooltip(fixture, component.triggerElementRef());

            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            const headerEl = () => overlayContainerElement.querySelector<HTMLElement>('.kbq-tooltip__header');

            expect(headerEl()?.textContent?.trim()).toBe('initial header');

            component.header = 'updated header';
            fixture.detectChanges();
            tick();

            expect(headerEl()?.textContent?.trim()).toBe('updated header');

            component.tooltipTrigger().hide();
            tick(defaultLeaveDelay);
            flush();
        }));
    });

    describe('single visible tooltip', () => {
        let fixture: ComponentFixture<KbqTooltipSingleInstanceComponent>;
        let component: KbqTooltipSingleInstanceComponent;
        let registry: KbqTooltipRegistry;

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [KbqToolTipModule, NoopAnimationsModule, KbqTooltipSingleInstanceComponent]
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

        it('should hide the previously visible tooltip when another one is shown', fakeAsync(() => {
            showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(overlayContainerElement.textContent).toContain('HOVER-A');

            showByKeyboardFocus(fixture, component.focusTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('FOCUS-B');
            expect(overlayContainerElement.textContent).not.toContain('HOVER-A');
        }));

        it('should hide the previously visible tooltip opened by click', fakeAsync(() => {
            dispatchMouseEvent(component.clickTrigger().nativeElement, 'click');
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('CLICK-E');

            showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(overlayContainerElement.textContent).toContain('HOVER-A');
            expect(overlayContainerElement.textContent).not.toContain('CLICK-E');
        }));

        it('should close the previous tooltip when shown via showForMouseEvent', fakeAsync(() => {
            showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(overlayContainerElement.textContent).toContain('HOVER-A');

            // `showForMouseEvent` calls `KbqPopUpTrigger.show` directly, bypassing `KbqTooltipTrigger.show`.
            const element: HTMLElement = component.clickTrigger().nativeElement;
            const clickDirective = component.clickDirective();

            element.addEventListener('mouseover', (event) => clickDirective.showForMouseEvent(event as MouseEvent));
            dispatchMouseEvent(element, 'mouseover');
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('CLICK-E');
            expect(overlayContainerElement.textContent).not.toContain('HOVER-A');
        }));

        it('should force-close a tooltip via hideAsInactive even while its own overlay is hovered', fakeAsync(() => {
            showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(overlayContainerElement.textContent).toContain('HOVER-A');

            const hoverDirective = component.hoverDirective()!;

            // Reproduce the exact state `hide()` silently no-ops on: the last recorded trigger event is
            // `mouseleave`, and the pop-up itself reports being hovered (mouse moved onto its own panel).
            hoverDirective['instance'].hovered.next(true);
            hoverDirective.triggerName = 'mouseleave';
            hoverDirective.hide(0);
            tick(defaultLeaveDelay);
            fixture.detectChanges();

            // Confirms the guard: an ordinary hide() attempt in this state is indeed a no-op.
            expect(overlayContainerElement.textContent).toContain('HOVER-A');

            // hideAsInactive() (triggered by the registry below) is documented to bypass that guard.
            showByKeyboardFocus(fixture, component.focusTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('FOCUS-B');
            expect(overlayContainerElement.textContent).not.toContain('HOVER-A');
        }));

        it('should keep both tooltips visible when kbqTooltipSingleInstance is false', fakeAsync(() => {
            showByHover(fixture, component.hoverTrigger()!.nativeElement);
            showByHover(fixture, component.independentTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('INDEPENDENT-D');
            expect(overlayContainerElement.textContent).toContain('HOVER-A');
        }));

        it('should not close a manually controlled tooltip', fakeAsync(() => {
            component.manualDirective().show(0);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('MANUAL-C');

            showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(overlayContainerElement.textContent).toContain('HOVER-A');
            expect(overlayContainerElement.textContent).toContain('MANUAL-C');
        }));

        it('should not be closed by a manually controlled tooltip', fakeAsync(() => {
            showByHover(fixture, component.hoverTrigger()!.nativeElement);

            component.manualDirective().show(0);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('MANUAL-C');
            expect(overlayContainerElement.textContent).toContain('HOVER-A');
        }));

        it('should emit kbqVisibleChange(false) for the automatically closed tooltip', fakeAsync(() => {
            const visibleChangeSpy = jest.fn();

            component.hoverDirective()!.visibleChange.subscribe(visibleChangeSpy);

            showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(visibleChangeSpy).toHaveBeenLastCalledWith(true);

            showByKeyboardFocus(fixture, component.focusTrigger().nativeElement);

            expect(visibleChangeSpy).toHaveBeenLastCalledWith(false);
            expect(component.hoverDirective()!.isOpen).toBe(false);
        }));

        it('should release the destroyed trigger so it is not retained as the visible one', fakeAsync(() => {
            showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(registry['visibleTooltip']).toBe(component.hoverDirective());

            component.hoverTriggerRendered = false;
            fixture.detectChanges();
            flush();

            expect(registry['visibleTooltip']).toBeNull();
        }));

        it('should not retroactively exempt a tooltip that is toggled out of the group while still open', fakeAsync(() => {
            showByHover(fixture, component.toggleableTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('TOGGLE-F');

            component.toggleableSingleInstance = false;
            fixture.detectChanges();

            showByKeyboardFocus(fixture, component.focusTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('FOCUS-B');
            // Characterizes current behavior: `participatesInSingleInstance` is only read once, inside the
            // `visibleChange` subscription set up in the constructor — flipping `kbqTooltipSingleInstance`
            // while the tooltip is already open does not retroactively free its registry slot.
            expect(overlayContainerElement.textContent).not.toContain('TOGGLE-F');
        }));
    });

    describe('single visible tooltip / app-wide default disabled via DI', () => {
        let fixture: ComponentFixture<KbqTooltipSingleInstanceComponent>;
        let component: KbqTooltipSingleInstanceComponent;

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [KbqToolTipModule, NoopAnimationsModule, KbqTooltipSingleInstanceComponent],
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

        it('should keep both tooltips visible when the app-wide default is provided as false', fakeAsync(() => {
            showByHover(fixture, component.hoverTrigger()!.nativeElement);

            expect(overlayContainerElement.textContent).toContain('HOVER-A');

            showByKeyboardFocus(fixture, component.focusTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('FOCUS-B');
            expect(overlayContainerElement.textContent).toContain('HOVER-A');
        }));
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

        it('should hide a visible tooltip when the pop-up opens', fakeAsync(() => {
            showByHover(fixture, trigger);

            expect(overlayContainerElement.textContent).toContain('SIBLING');

            component.popup().open();
            flush();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).not.toContain('SIBLING');
        }));

        it('should cancel a pending show when the pop-up opens', fakeAsync(() => {
            dispatchMouseEvent(trigger, 'mouseenter');
            fixture.detectChanges();

            component.popup().open();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).not.toContain('SIBLING');
            flush();
        }));

        it('should not show the tooltip while a sibling is attached, even before it announces opening', fakeAsync(() => {
            // Models the gap between a sibling's overlay attaching and its `openedChange` actually firing —
            // e.g. select/tree-select only emit it once their open CSS animation finishes.
            component.popup().isAttached = true;

            dispatchMouseEvent(trigger, 'mouseenter');
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).not.toContain('SIBLING');
        }));

        it('should not show the tooltip on hover while the pop-up is open', fakeAsync(() => {
            component.popup().open();
            flush();

            showByHover(fixture, trigger);

            expect(overlayContainerElement.textContent).not.toContain('SIBLING');
        }));

        it('should not show the tooltip when the closing pop-up restores focus to the trigger', fakeAsync(() => {
            component.popup().open();
            flush();

            // How `KbqPopoverComponent.onEscape` closes: it restores focus to the trigger with a `keyboard`
            // origin (passing the tooltip's own focus-origin gate) before the overlay is actually detached —
            // `isAttached` is still `true` at this point, which is what must keep the tooltip suppressed.
            showByKeyboardFocus(fixture, trigger);

            expect(overlayContainerElement.textContent).not.toContain('SIBLING');
        }));

        it('should not show the tooltip on the mouseenter replayed when the pop-up overlay is removed', fakeAsync(() => {
            showByHover(fixture, trigger);

            component.popup().open();
            flush();
            // Inserting a backdrop over the trigger makes the browser fire `mouseleave` without the pointer
            // having moved; removing it fires the matching `mouseenter`.
            dispatchMouseEvent(trigger, 'mouseleave');
            component.popup().close();
            component.popup().detach();

            showByHover(fixture, trigger);

            expect(overlayContainerElement.textContent).not.toContain('SIBLING');
        }));

        it('should show the tooltip again after the pointer leaves the trigger', fakeAsync(() => {
            component.popup().open();
            flush();
            component.popup().close();
            component.popup().detach();

            dispatchMouseEvent(trigger, 'mouseleave');
            flush();

            showByHover(fixture, trigger);

            expect(overlayContainerElement.textContent).toContain('SIBLING');
        }));

        it('should show the tooltip again after the focus leaves the trigger', fakeAsync(() => {
            component.popup().open();
            flush();
            component.popup().close();
            component.popup().detach();

            dispatchFakeEvent(trigger, 'blur');
            flush();

            showByKeyboardFocus(fixture, trigger);

            expect(overlayContainerElement.textContent).toContain('SIBLING');
        }));

        it('should not mute a tooltip that is driven imperatively', fakeAsync(() => {
            component.manualPopup().open();
            flush();

            component.manualTooltip().show();
            flush();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('MANUAL');
        }));
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

        it('should render the tooltip as role="tooltip" with an id', fakeAsync(() => {
            showByHover(fixture, component.trigger().nativeElement);

            expect(tooltipElement()?.getAttribute('role')).toBe('tooltip');
            expect(tooltipElement()?.id).toBeTruthy();

            flush();
        }));

        it('should mark the arrow as decorative', fakeAsync(() => {
            showByHover(fixture, component.trigger().nativeElement);

            expect(tooltipElement()?.querySelector('.kbq-tooltip__arrow')?.getAttribute('aria-hidden')).toBe('true');

            flush();
        }));

        it('should describe the trigger by the open tooltip and stop describing it once hidden', fakeAsync(() => {
            const triggerElement = component.trigger().nativeElement;

            expect(triggerElement.hasAttribute('aria-describedby')).toBe(false);

            showByHover(fixture, triggerElement);

            expect(triggerElement.getAttribute('aria-describedby')).toBe(tooltipElement()?.id);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            tick();
            fixture.detectChanges();

            expect(triggerElement.hasAttribute('aria-describedby')).toBe(false);

            flush();
        }));

        it('should keep the ids the consumer already put on the trigger', fakeAsync(() => {
            const triggerElement = component.describedTrigger().nativeElement;

            showByHover(fixture, triggerElement);

            expect(triggerElement.getAttribute('aria-describedby')).toBe(`external-hint ${tooltipElement()?.id}`);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            tick();
            fixture.detectChanges();

            expect(triggerElement.getAttribute('aria-describedby')).toBe('external-hint');

            flush();
        }));

        it('should not describe a trigger whose tooltip only repeats its own text', fakeAsync(() => {
            const triggerElement = component.selfDescribingTrigger().nativeElement;

            showByHover(fixture, triggerElement);

            expect(triggerElement.hasAttribute('aria-describedby')).toBe(false);

            flush();
        }));

        it('should drop the description when the trigger is destroyed while the tooltip is open', fakeAsync(() => {
            const triggerElement = component.trigger().nativeElement;

            showByHover(fixture, triggerElement);

            expect(triggerElement.hasAttribute('aria-describedby')).toBe(true);

            fixture.destroy();

            expect(triggerElement.hasAttribute('aria-describedby')).toBe(false);

            flush();
        }));

        it('should close a hover tooltip on Escape even though the trigger has no focus', fakeAsync(() => {
            showByHover(fixture, component.trigger().nativeElement);

            expect(component.tooltipTrigger().isOpen).toBe(true);

            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            tick();
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(false);

            flush();
        }));

        it('should not close an imperatively driven tooltip on Escape', fakeAsync(() => {
            component.manualTooltip().show(0);
            tick();
            fixture.detectChanges();

            expect(component.manualTooltip().isOpen).toBe(true);

            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            tick();
            fixture.detectChanges();

            expect(component.manualTooltip().isOpen).toBe(true);

            component.manualTooltip().hide(0);
            flush();
        }));

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
        it('should not show the tooltip on the focus that follows a pointer interaction', fakeAsync(() => {
            TestBed.inject(FocusMonitor).focusVia(triggerElement, 'mouse');
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(false);

            flush();
        }));

        it('should show the tooltip on keyboard focus', fakeAsync(() => {
            showByKeyboardFocus(fixture, triggerElement);

            expect(component.tooltipTrigger().isOpen).toBe(true);

            flush();
        }));

        it('should not show the tooltip on an unattributed focus', fakeAsync(() => {
            // CDK reports `program` both for focus the application moved and for any focus it could not
            // attribute, so the gate cannot admit it. Deliberate programmatic focus goes through
            // `focusVia(element, 'keyboard')`, which the case above covers.
            dispatchFakeEvent(triggerElement, 'focus');
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(false);

            flush();
        }));

        it('should open on Enter for a keydown trigger even after a pointer-originated focus', fakeAsync(() => {
            TestBed.inject(FocusMonitor).focusVia(triggerElement, 'mouse');
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);

            expect(component.tooltipTrigger().isOpen).toBe(false);

            dispatchKeyboardEvent(triggerElement, 'keydown', ENTER);
            tick();
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(true);

            flush();
        }));
    });

    describe('enter delay', () => {
        let fixture: ComponentFixture<TooltipPair>;
        let component: TooltipPair;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipPair);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should apply the full enter delay to the first tooltip', fakeAsync(() => {
            dispatchMouseEvent(component.first().nativeElement, 'mouseenter');
            fixture.detectChanges();
            tick(399);

            expect(component.firstTrigger().isOpen).toBe(false);

            tick(2);

            expect(component.firstTrigger().isOpen).toBe(true);

            flush();
        }));

        it('should show a following tooltip without the enter delay', fakeAsync(() => {
            showByHover(fixture, component.first().nativeElement);
            dispatchMouseEvent(component.first().nativeElement, 'mouseleave');
            tick();
            fixture.detectChanges();

            dispatchMouseEvent(component.second().nativeElement, 'mouseenter');
            fixture.detectChanges();
            tick(1);

            expect(component.secondTrigger().isOpen).toBe(true);

            flush();
        }));
    });

    describe('enter delay / instant-show window disabled via DI', () => {
        let fixture: ComponentFixture<TooltipPair>;
        let component: TooltipPair;

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [KbqToolTipModule, NoopAnimationsModule, TooltipPair],
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

        it('should apply the enter delay to every tooltip when the window is zero', fakeAsync(() => {
            showByHover(fixture, component.first().nativeElement);
            dispatchMouseEvent(component.first().nativeElement, 'mouseleave');
            tick();
            fixture.detectChanges();

            dispatchMouseEvent(component.second().nativeElement, 'mouseenter');
            fixture.detectChanges();
            tick(1);

            expect(component.secondTrigger().isOpen).toBe(false);

            tick(tooltipDefaultEnterDelayWithDefer);

            expect(component.secondTrigger().isOpen).toBe(true);

            flush();
        }));
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

        it('should hide exactly one leave delay after the pointer leaves', fakeAsync(() => {
            showByHover(fixture, triggerElement);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            tick(999);

            expect(component.tooltipTrigger().isOpen).toBe(true);

            tick(2);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(false);

            flush();
        }));

        it('should cancel the pending hide when the pointer comes back', fakeAsync(() => {
            showByHover(fixture, triggerElement);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            tick(500);

            dispatchMouseEvent(triggerElement, 'mouseenter');
            fixture.detectChanges();
            tick(1500);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(true);

            component.tooltipTrigger().hide(0);
            flush();
        }));

        it('should cancel the pending hide while the pointer rests on the tooltip', fakeAsync(() => {
            showByHover(fixture, triggerElement);

            const popUpElement = overlayContainerElement.querySelector<HTMLElement>('kbq-tooltip-component')!;

            dispatchMouseEvent(triggerElement, 'mouseleave');
            dispatchMouseEvent(popUpElement, 'mouseenter');
            fixture.detectChanges();
            tick(1500);
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(true);

            component.tooltipTrigger().hideAsInactive();
            flush();
        }));

        it('should leave no pending hide behind when the trigger is destroyed during the leave delay', fakeAsync(() => {
            showByHover(fixture, triggerElement);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            tick(500);

            fixture.destroy();
            flush();

            expect(overlayContainerElement.querySelector('.kbq-tooltip')).toBeNull();
        }));
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

        it('should render the arrow when [kbqTooltipArrow] is set while the tooltip is open', fakeAsync(() => {
            showByHover(fixture, component.trigger().nativeElement);

            expect(tooltipElement()?.querySelector('.kbq-tooltip__arrow')).toBeFalsy();

            component.arrow = true;
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(tooltipElement()?.querySelector('.kbq-tooltip__arrow')).toBeTruthy();

            flush();
        }));

        it('should re-apply the margins when [kbqTooltipOffset] changes while the tooltip is open', fakeAsync(() => {
            showByHover(fixture, component.trigger().nativeElement);

            expect(tooltipElement()?.style.marginBottom).toBe('');

            component.offset = 24;
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(tooltipElement()?.style.marginBottom).toBe('24px');

            flush();
        }));
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

        it('should default to the contrast color class', fakeAsync(() => {
            showByHover(fixture, component.trigger().nativeElement);

            expect(tooltipClasses()).toContain('kbq-contrast');

            flush();
        }));

        for (const color of ['contrast-fade', 'theme', 'warning', 'error']) {
            it(`should apply the ${color} color class`, fakeAsync(() => {
                component.color = color;
                fixture.detectChanges();

                showByHover(fixture, component.trigger().nativeElement);

                expect(tooltipClasses()).toContain(`kbq-${color}`);

                flush();
            }));
        }

        it('should read back the assigned color rather than its CSS class', fakeAsync(() => {
            const trigger = component.tooltipTrigger();

            trigger.color = 'error';

            // A consumer reading the input and writing it straight back must not end up with `kbq-kbq-error`.
            const readBack = trigger.color;

            trigger.color = readBack;
            fixture.detectChanges();

            expect(trigger.color).toBe('error');

            showByHover(fixture, component.trigger().nativeElement);

            expect(tooltipClasses()).toContain('kbq-error');

            flush();
        }));
    });

    describe('kbqTooltipContext', () => {
        let fixture: ComponentFixture<TooltipFalsyContext>;
        let component: TooltipFalsyContext;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipFalsyContext);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should pass a falsy context into the template', fakeAsync(() => {
            showByHover(fixture, component.trigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('0');

            flush();
        }));
    });

    describe('kbqRelativeToPointer', () => {
        let fixture: ComponentFixture<TooltipRelativeToPointer>;
        let component: TooltipRelativeToPointer;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipRelativeToPointer);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should anchor the tooltip to the cursor instead of the host element', fakeAsync(() => {
            const trigger = component.tooltipTrigger();

            trigger.createOverlay();

            const setOrigin = jest.spyOn(trigger['strategy'], 'setOrigin');

            showByHover(fixture, component.trigger().nativeElement);

            expect(setOrigin).toHaveBeenCalledWith(expect.objectContaining({ y: expect.any(Number) }));

            flush();
        }));

        it('should keep [kbqPlacementPriority] intact across a cursor-relative show', fakeAsync(() => {
            const trigger = component.tooltipTrigger();

            expect(trigger['placementPriority']).toEqual(['top', 'bottom']);

            showByHover(fixture, component.trigger().nativeElement);

            expect(trigger['placementPriority']).toEqual(['top', 'bottom']);

            flush();
        }));
    });

    describe('imperative show', () => {
        let fixture: ComponentFixture<TooltipImperative>;
        let component: TooltipImperative;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipImperative);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should not attach an overlay while the content is empty', fakeAsync(() => {
            showByHover(fixture, component.emptyTrigger().nativeElement);

            expect(component.emptyTooltip().isAttached).toBe(false);

            component.content = 'FILLED';
            fixture.detectChanges();

            showByHover(fixture, component.emptyTrigger().nativeElement);

            expect(overlayContainerElement.textContent).toContain('FILLED');

            flush();
        }));

        it('should no-op instead of throwing when showForElement runs on a disabled trigger', fakeAsync(() => {
            const host = component.emptyTrigger().nativeElement;

            expect(() => component.disabledTooltip().showForElement(host)).not.toThrow();
            expect(component.disabledTooltip().isAttached).toBe(false);

            flush();
        }));

        it('should anchor showForElement to the passed element', fakeAsync(() => {
            const host = component.emptyTrigger().nativeElement;
            const trigger = component.enabledTooltip();

            trigger.createOverlay();

            const setOrigin = jest.spyOn(trigger['strategy'], 'setOrigin');

            trigger.showForElement(host);
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(setOrigin).toHaveBeenCalledWith(host);

            trigger.hide(0);
            flush();
        }));
    });

    describe('parent pop-up', () => {
        let fixture: ComponentFixture<TooltipInsideParentPopup>;
        let component: TooltipInsideParentPopup;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipInsideParentPopup);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should hide the tooltip when the parent pop-up closes', fakeAsync(() => {
            showByHover(fixture, component.trigger().nativeElement);

            expect(component.tooltipTrigger().isOpen).toBe(true);

            component.parentPopup().closedStream.next(false);
            tick();
            fixture.detectChanges();

            expect(component.tooltipTrigger().isOpen).toBe(false);

            flush();
        }));
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

        it('should keep the pane hoverable by default', fakeAsync(() => {
            showByHover(fixture, component.hoverable().nativeElement);

            expect(paneClasses(component.hoverableTooltip())).not.toContain('cdk-overlay-pane_ignore-pointer-events');

            flush();
        }));

        it('should make the pane click-through when the input is set', fakeAsync(() => {
            showByHover(fixture, component.clickThrough().nativeElement);

            expect(paneClasses(component.clickThroughTooltip())).toContain('cdk-overlay-pane_ignore-pointer-events');

            flush();
        }));
    });

    describe('lifecycle', () => {
        let fixture: ComponentFixture<TooltipSimple>;
        let component: TooltipSimple;

        beforeEach(() => {
            fixture = TestBed.createComponent(TooltipSimple);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should complete the pop-up visibility stream when the tooltip is torn down', fakeAsync(() => {
            const trigger = component.tooltipTrigger();

            showByHover(fixture, component.triggerElementRef().nativeElement);

            let completed = false;

            trigger['instance'].visibleChange.subscribe({ complete: () => (completed = true) });

            trigger.hide(0);
            flush();
            fixture.detectChanges();

            expect(completed).toBe(true);
        }));

        it('should complete the hover stream when the trigger is destroyed', fakeAsync(() => {
            const trigger = component.tooltipTrigger();

            let completed = false;

            trigger.hovered.subscribe({ complete: () => (completed = true) });

            fixture.destroy();

            expect(completed).toBe(true);
        }));

        it('should subscribe to the closing actions once per open', fakeAsync(() => {
            const trigger = component.tooltipTrigger();
            const closingActions = jest.spyOn(trigger, 'closingActions');

            showByHover(fixture, component.triggerElementRef().nativeElement);

            expect(closingActions).toHaveBeenCalledTimes(1);

            flush();
        }));
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
            <button #button kbq-button [disabled]="disableState">
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
    `
})
class TooltipPointerEvents {
    readonly hoverable = viewChild.required<ElementRef>('hoverable');
    readonly hoverableTooltip = viewChild.required('hoverable', { read: KbqTooltipTrigger });
    readonly clickThrough = viewChild.required<ElementRef>('clickThrough');
    readonly clickThroughTooltip = viewChild.required('clickThrough', { read: KbqTooltipTrigger });
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
    `
})
class TooltipForDisabledWithExplicitState {
    readonly explicitTooltip = viewChild.required<KbqTooltipTrigger>('explicitTooltip');
    readonly derivedTooltip = viewChild.required<KbqTooltipTrigger>('derivedTooltip');

    controlDisabled = false;
}
