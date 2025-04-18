import { coerceElement } from '@angular/cdk/coercion';
import { FlexibleConnectedPositionStrategy, OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TAB } from '@koobiq/cdk/keycodes';
import { dispatchKeyboardEvent, dispatchMouseEvent } from '@koobiq/cdk/testing';
import { ARROW_BOTTOM_MARGIN_AND_HALF_HEIGHT } from '@koobiq/components/core';
import { KbqTooltipTrigger } from './tooltip.component';
import { KbqToolTipModule } from './tooltip.module';

const tooltipDefaultEnterDelayWithDefer = 410;
const tickTime = 100;

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
                NoopAnimationsModule
            ],
            declarations: [
                KbqTooltipTestWrapperComponent,
                KbqTooltipTestNewComponent,
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

    const getTooltipAndStyles = (
        trigger: ElementRef,
        selector = '.kbq-tooltip'
    ): [Element | null, CSSStyleDeclaration | null] => {
        dispatchMouseEvent(trigger.nativeElement, 'mouseenter');
        tick(tooltipDefaultEnterDelayWithDefer);

        const tooltip = overlayContainer.getContainerElement().querySelector(selector);
        const styles = tooltip && getComputedStyle(tooltip);

        return [
            tooltip,
            styles
        ];
    };

    describe('should bring no break change', () => {
        let fixture: ComponentFixture<KbqTooltipTestWrapperComponent>;
        let component: KbqTooltipTestWrapperComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(KbqTooltipTestWrapperComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        xit('should show/hide most simple tooltip with moving through all around', fakeAsync(() => {
            const featureKey = 'MOST-SIMPLE';
            const triggerElement = component.mostSimpleTrigger.nativeElement;
            const tooltipDirective = component.mostSimpleDirective;

            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            // Move inside to trigger tooltip shown up
            dispatchMouseEvent(triggerElement, 'mouseenter');
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // NOTE: the overlayElement is only available after tooltip shown up
            const overlayElement = component.mostSimpleDirective['overlayRef']!.overlayElement;

            tooltipDirective.updatePosition(); // This line is temporarily for coverage
            // Move out from the trigger element, then move into the tooltip element
            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            dispatchMouseEvent(overlayElement, 'mouseenter');
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // Move out from the tooltip element to hide it
            dispatchMouseEvent(overlayElement, 'mouseleave');
            tick(tickTime);
            fixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));

        xit('should show/hide normal tooltip', fakeAsync(() => {
            const featureKey = 'NORMAL';
            const triggerElement = component.normalTrigger.nativeElement;

            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            fixture.detectChanges();
            // Move inside to trigger tooltip shown up
            dispatchMouseEvent(triggerElement, 'mouseenter');
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // Move out from the trigger element to hide it
            dispatchMouseEvent(triggerElement, 'mouseleave');
            tick(tickTime);
            fixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));

        it('should show/hide tooltip by focus', fakeAsync(() => {
            const featureKey = 'FOCUS';
            const triggerElement = component.focusTrigger.nativeElement;

            dispatchKeyboardEvent(document, 'keydown', TAB);
            dispatchMouseEvent(triggerElement, 'focus');
            fixture.detectChanges();
            flush();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            dispatchMouseEvent(triggerElement, 'blur');
            tick(tickTime);
            fixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));

        xit('should kbqTitle support string', fakeAsync(() => {
            const featureKey = 'NORMAL';
            const triggerElement = component.normalTrigger.nativeElement;
            const tooltipDirective = component.normalDirective;

            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            // Move inside to trigger tooltip shown up
            dispatchMouseEvent(triggerElement, 'mouseenter');
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // NOTE: the overlayElement is only available after tooltip shown up
            const overlayElement = component.normalDirective['overlayRef']!.overlayElement;

            tooltipDirective.updatePosition(); // This line is temporarily for coverage
            // Move out from the trigger element, then move into the tooltip element
            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            dispatchMouseEvent(overlayElement, 'mouseenter');
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // Move out from the tooltip element to hide it
            dispatchMouseEvent(overlayElement, 'mouseleave');
            tick(tickTime);
            fixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));

        xit('should hide arrow', fakeAsync(() => {
            let [tooltip] = getTooltipAndStyles(component.dynamicArrowAndOffsetTrigger, '.kbq-tooltip_arrowless');

            expect(tooltip).toBeFalsy();

            // hide tooltip
            dispatchMouseEvent(component.dynamicArrowAndOffsetTrigger.nativeElement, 'mouseleave');
            fixture.detectChanges();
            tick(tickTime);

            component.arrow = false;
            fixture.detectChanges();

            [tooltip] = getTooltipAndStyles(component.dynamicArrowAndOffsetTrigger, '.kbq-tooltip_arrowless');

            expect(tooltip).toBeTruthy();
            expect(tooltip?.querySelector('.kbq-tooltip__arrow')).toBeFalsy();
        }));
    });

    describe('should support kbqTooltipDisabled attribute', () => {
        let fixture: ComponentFixture<KbqTooltipDisabledComponent>;
        let component: KbqTooltipDisabledComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(KbqTooltipDisabledComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should not show tooltip', fakeAsync(() => {
            const featureKey = 'DISABLED';
            const tooltipDirective = component.disabledDirective;

            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            tooltipDirective.show();
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            tooltipDirective.disabled = false;
            tooltipDirective.show();
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
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

        it('should provide info with context', fakeAsync(() => {
            const trigger = component.trigger.nativeElement;

            trigger.click();
            dispatchMouseEvent(trigger, 'focus');
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
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

        xit('should add offset for position config if element is less than arrow margin', fakeAsync(() => {
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

        xit('should not add offset to tooltip position config if element is large', fakeAsync(() => {
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

        xit('should not apply adjusted positions if tooltip initialized without arrow', fakeAsync(() => {
            componentInstance.tooltipTrigger.arrow = false;
            fixture.detectChanges();

            openAndAssertTooltip(fixture, componentInstance.triggerElementRef);

            const strategy: FlexibleConnectedPositionStrategy = componentInstance.tooltipTrigger
                .createOverlay()
                .getConfig().positionStrategy! as FlexibleConnectedPositionStrategy;

            expect(strategy.positions.some((pos) => 'offsetX' in pos || 'offsetY' in pos)).toBeFalsy();
        }));
    });
});

@Component({
    standalone: true,
    selector: 'tooltip-simple',
    imports: [KbqToolTipModule],
    template: `
        <button [kbqTooltip]="'MOST-SIMPLE'">Show</button>
    `
})
export class TooltipSimple {
    @ViewChild(KbqTooltipTrigger) tooltipTrigger: KbqTooltipTrigger;
    @ViewChild(KbqTooltipTrigger, { read: ElementRef }) triggerElementRef: ElementRef;
}

@Component({
    selector: 'kbq-tooltip-test-new',
    template: `
        <ng-template #template>title-template</ng-template>

        <a #titleString [kbqTooltip]="'title-string'" [kbqTrigger]="'hover'" [kbqPlacement]="'top'">Show</a>
        <a #titleTemplate [kbqTooltip]="template">Show</a>
    `
})
class KbqTooltipTestNewComponent {
    @ViewChild('titleString', { static: false }) titleString: ElementRef;
    @ViewChild('titleString', {
        read: KbqTooltipTrigger,
        static: false
    })
    titleStringKbqTooltipDirective: KbqTooltipTrigger;
    @ViewChild('titleTemplate', { static: false }) titleTemplate: ElementRef;
    @ViewChild('titleTemplate', {
        read: KbqTooltipTrigger,
        static: false
    })
    titleTemplateKbqTooltipDirective: KbqTooltipTrigger;
}

@Component({
    selector: 'kbq-tooltip-test-wrapper',
    template: `
        <a #mostSimpleTrigger [kbqTooltip]="'MOST-SIMPLE'">Show</a>

        <span #normalTrigger [kbqTooltip]="'NORMAL'" [kbqTrigger]="'hover'" [kbqPlacement]="'right'">Show</span>

        <span #focusTrigger [kbqTooltip]="'FOCUS'" [kbqTrigger]="'focus'">Show</span>
        <span #visibleTrigger [kbqTooltip]="'VISIBLE'" [kbqVisible]="visible">Show</span>
        <span
            #dynamicArrowAndOffsetTrigger
            [kbqTooltip]="'ArrowAndOffset'"
            [kbqTooltipArrow]="arrow"
            [kbqTooltipOffset]="offset"
        >
            Show
        </span>
    `
})
class KbqTooltipTestWrapperComponent {
    @ViewChild('normalTrigger', { static: false }) normalTrigger: ElementRef;
    @ViewChild('normalTrigger', { read: KbqTooltipTrigger, static: false }) normalDirective: KbqTooltipTrigger;
    @ViewChild('focusTrigger', { static: false }) focusTrigger: ElementRef;
    @ViewChild('visibleTrigger', { static: false }) visibleTrigger: ElementRef;
    @ViewChild('mostSimpleTrigger', { static: false }) mostSimpleTrigger: ElementRef;
    @ViewChild('mostSimpleTrigger', { read: KbqTooltipTrigger, static: false }) mostSimpleDirective: KbqTooltipTrigger;
    @ViewChild('dynamicArrowAndOffsetTrigger', { static: false })
    dynamicArrowAndOffsetTrigger: ElementRef;

    visible: boolean;
    arrow: boolean = true;
    offset: number | null = null;
}

@Component({
    selector: 'kbq-tooltip-disabled-wrapper',
    template: `
        <span #disabledAttribute [kbqTooltip]="'DISABLED'" [kbqTrigger]="'manual'" [kbqTooltipDisabled]="true">
            Disabled
        </span>
    `
})
class KbqTooltipDisabledComponent {
    @ViewChild('disabledAttribute', { static: false }) disabledTrigger: ElementRef;
    @ViewChild('disabledAttribute', { read: KbqTooltipTrigger, static: false }) disabledDirective: KbqTooltipTrigger;
}

@Component({
    selector: 'kbq-tooltip-wih-template-ref-content',
    template: `
        <ng-template #tooltipContent let-ctx>
            <div>{{ ctx.content }}</div>
        </ng-template>
        <button #trigger [kbqTooltip]="tooltipContent" [kbqTooltipContext]="tooltipContext" kbqTrigger="click">
            Button
        </button>
    `
})
class KbqTooltipWithTemplateRefContent {
    @ViewChild('trigger', { static: false }) trigger: ElementRef;
    tooltipContext = { content: 'TestContent' };
}
