import { coerceElement } from '@angular/cdk/coercion';
import { FlexibleConnectedPositionStrategy, OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, viewChild, ViewChild } from '@angular/core';
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
            const triggerElement = component.mostSimpleTrigger.nativeElement;

            expect(overlayContainerElement.textContent).not.toContain(featureKey);

            dispatchMouseEvent(triggerElement, 'mouseenter');
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);

            const overlayElement = component.mostSimpleDirective['overlayRef']!.overlayElement;

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
            const triggerElement = component.normalTrigger.nativeElement;

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
            const triggerElement = component.focusTrigger.nativeElement;

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
            let tooltip = getTooltip(component.dynamicArrowAndOffsetTrigger, '.kbq-tooltip_arrowless');

            expect(tooltip).toBeFalsy();

            dispatchMouseEvent(component.dynamicArrowAndOffsetTrigger.nativeElement, 'mouseleave');
            fixture.detectChanges();
            tick(defaultLeaveDelay);

            component.arrow = false;
            fixture.detectChanges();

            tooltip = getTooltip(component.dynamicArrowAndOffsetTrigger, '.kbq-tooltip_arrowless');

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
            const tooltipDirective = component.disabledDirective;

            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            tooltipDirective.show();
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));

        it('should show tooltip after kbqTooltipDisabled is set to false', fakeAsync(() => {
            const featureKey = 'DISABLED';
            const tooltipDirective = component.disabledDirective;

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
            const trigger = component.trigger.nativeElement;

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

            componentInstance.triggerElementRef.nativeElement.getBoundingClientRect = () => ({
                width: rect,
                height: rect
            });
            fixture.detectChanges();

            openAndAssertTooltip(fixture, componentInstance.triggerElementRef);

            const strategy: FlexibleConnectedPositionStrategy = componentInstance.tooltipTrigger
                .createOverlay()
                .getConfig().positionStrategy! as FlexibleConnectedPositionStrategy;

            expect(strategy.positions.some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeTruthy();
        }));

        it('should not add offset to tooltip position config if element is large', fakeAsync(() => {
            componentInstance.triggerElementRef.nativeElement.getBoundingClientRect = () => ({
                width: 100,
                height: 100
            });
            fixture.detectChanges();

            openAndAssertTooltip(fixture, componentInstance.triggerElementRef);

            const strategy: FlexibleConnectedPositionStrategy = componentInstance.tooltipTrigger
                .createOverlay()
                .getConfig().positionStrategy! as FlexibleConnectedPositionStrategy;

            expect(strategy.positions.some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeFalsy();
        }));

        it('should not apply adjusted positions if tooltip initialized without arrow', fakeAsync(() => {
            componentInstance.tooltipTrigger.arrow = false;
            fixture.detectChanges();

            openAndAssertTooltip(fixture, componentInstance.triggerElementRef);

            const strategy: FlexibleConnectedPositionStrategy = componentInstance.tooltipTrigger
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
            openAndAssertTooltip(fixture, component.triggerElementRef);

            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.kbq-tooltip_warning')).toBeFalsy();

            component.modifier = 'warning';
            fixture.detectChanges();
            tick();

            expect(overlayContainerElement.querySelector('.kbq-tooltip_warning')).toBeTruthy();

            // Cleanup the open overlay so trailing timers don't leak into other tests.
            component.tooltipTrigger.hide();
            tick(defaultLeaveDelay);
            flush();
        }));

        it('should refresh the rendered header when [kbqTooltipHeader] changes while open', fakeAsync(() => {
            component.modifier = 'extended';
            component.header = 'initial header';
            fixture.detectChanges();

            openAndAssertTooltip(fixture, component.triggerElementRef);

            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            const headerEl = () => overlayContainerElement.querySelector<HTMLElement>('.kbq-tooltip__header');

            expect(headerEl()?.textContent?.trim()).toBe('initial header');

            component.header = 'updated header';
            fixture.detectChanges();
            tick();

            expect(headerEl()?.textContent?.trim()).toBe('updated header');

            component.tooltipTrigger.hide();
            tick(defaultLeaveDelay);
            flush();
        }));
    });
});

@Component({
    selector: 'kbq-tooltip-reactive-inputs',
    imports: [KbqToolTipModule],
    template: `
        <span #trigger [kbqTooltip]="'CONTENT'" [kbqTooltipModifier]="modifier" [kbqTooltipHeader]="header">Show</span>
    `
})
export class KbqTooltipReactiveInputsComponent {
    @ViewChild('trigger', { static: false }) triggerElementRef: ElementRef;
    @ViewChild('trigger', { read: KbqTooltipTrigger, static: false }) tooltipTrigger: KbqTooltipTrigger;

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
    @ViewChild(KbqTooltipTrigger) tooltipTrigger: KbqTooltipTrigger;
    @ViewChild(KbqTooltipTrigger, { read: ElementRef }) triggerElementRef: ElementRef;
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
    @ViewChild('normalTrigger', { static: false }) normalTrigger: ElementRef;
    @ViewChild('focusTrigger', { static: false }) focusTrigger: ElementRef;
    @ViewChild('mostSimpleTrigger', { static: false }) mostSimpleTrigger: ElementRef;
    @ViewChild('mostSimpleTrigger', { read: KbqTooltipTrigger, static: false }) mostSimpleDirective: KbqTooltipTrigger;
    @ViewChild('dynamicArrowAndOffsetTrigger', { static: false })
    dynamicArrowAndOffsetTrigger: ElementRef;

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
    @ViewChild('disabledAttribute', { read: KbqTooltipTrigger, static: false }) disabledDirective: KbqTooltipTrigger;
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
    @ViewChild('trigger', { static: false }) trigger: ElementRef;
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
