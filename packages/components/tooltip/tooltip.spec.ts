import { coerceElement } from '@angular/cdk/coercion';
import { FlexibleConnectedPositionStrategy, OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButton, KbqButtonModule } from '@koobiq/components/button';
import {
    ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    TAB
} from '@koobiq/components/core';
import { KbqIconButton, KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkModule } from '@koobiq/components/link';
import { KBQ_TOOLTIP_SINGLE_INSTANCE_DEFAULT, KbqTooltipRegistry } from './tooltip-registry';
import { KbqTooltipTrigger } from './tooltip.component';
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
                KbqTooltipWithTemplateRefContent
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

        it('should show/hide most simple tooltip with moving through all around', fakeAsync(() => {
            const featureKey = 'MOST-SIMPLE';
            const triggerElement = component.mostSimpleTrigger().nativeElement;

            expect(overlayContainerElement.textContent).not.toContain(featureKey);

            dispatchMouseEvent(triggerElement, 'mouseenter');
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);

            const overlayElement = component.mostSimpleDirective()['overlayRef']!.overlayElement;

            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            dispatchMouseEvent(overlayElement, 'mouseenter');
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);

            dispatchMouseEvent(overlayElement, 'mouseleave');
            tick(defaultLeaveDelay);
            fixture.detectChanges();
            tick();
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
});

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
    readonly mostSimpleDirective = viewChild.required('mostSimpleTrigger', { read: KbqTooltipTrigger });
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
