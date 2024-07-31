import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, inject, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TAB } from '@koobiq/cdk/keycodes';
import { dispatchKeyboardEvent, dispatchMouseEvent } from '@koobiq/cdk/testing';
import { KbqTooltipTrigger } from './tooltip.component';
import { KbqToolTipModule } from './tooltip.module';

const tooltipDefaultEnterDelayWithDefer = 410;
const tickTime = 100;
const defaultOffsetForTooltip = 8;
const defaultOffsetForTooltipWithoutArrow = 4;

describe('KbqTooltip', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqToolTipModule, NoopAnimationsModule],
            declarations: [
                KbqTooltipTestWrapperComponent,
                KbqTooltipTestNewComponent,
                KbqTooltipDisabledComponent,
                KbqTooltipWithTemplateRefContent
            ]
        });
        TestBed.compileComponents();
    }));
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
        fixture.detectChanges();
        tick(tooltipDefaultEnterDelayWithDefer);

        const tooltip = overlayContainer.getContainerElement().querySelector(selector);
        const styles = tooltip && window.getComputedStyle(tooltip);

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

        it('should show/hide most simple tooltip with moving through all around', fakeAsync(() => {
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

        it('should show/hide normal tooltip', fakeAsync(() => {
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

        it('should kbqTitle support string', fakeAsync(() => {
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

        it('should hide arrow', fakeAsync(() => {
            let [tooltip] = getTooltipAndStyles(component.dynamicArrowAndOffsetTrigger, '.kbq-tooltip_arrowless');

            expect(tooltip).toBeFalsy();

            // hide tooltip
            dispatchMouseEvent(component.dynamicArrowAndOffsetTrigger.nativeElement, 'mouseleave');
            fixture.detectChanges();
            tick(tickTime);

            (component as KbqTooltipTestWrapperComponent).arrow = false;
            fixture.detectChanges();

            [tooltip] = getTooltipAndStyles(component.dynamicArrowAndOffsetTrigger, '.kbq-tooltip_arrowless');

            expect(tooltip).toBeTruthy();
            expect(tooltip?.querySelector('.kbq-tooltip__arrow')).toBeFalsy();
        }));

        it('should change offset for arrowless tooltip', fakeAsync(() => {
            let [tooltip, styles] = getTooltipAndStyles(component.dynamicArrowAndOffsetTrigger);

            expect(tooltip).toBeTruthy();
            expect(styles?.marginTop).toEqual(`${defaultOffsetForTooltip}px`);

            // hide tooltip
            dispatchMouseEvent(component.dynamicArrowAndOffsetTrigger.nativeElement, 'mouseleave');
            fixture.detectChanges();
            tick(tickTime);

            (component as KbqTooltipTestWrapperComponent).arrow = false;
            fixture.detectChanges();

            [tooltip, styles] = getTooltipAndStyles(component.dynamicArrowAndOffsetTrigger, '.kbq-tooltip_arrowless');

            expect(tooltip).toBeTruthy();
            expect(styles?.marginTop).toEqual(`${defaultOffsetForTooltipWithoutArrow}px`);
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
        beforeEach(() => {
            fixture = TestBed.createComponent(KbqTooltipWithTemplateRefContent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should provide info with context', fakeAsync(() => {
            const trigger = (component as KbqTooltipWithTemplateRefContent).trigger.nativeElement;

            trigger.click();
            dispatchMouseEvent(trigger, 'focus');
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();
            tick(tooltipDefaultEnterDelayWithDefer);
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toEqual(component.tooltipContext.content);
        }));
    });
});

@Component({
    selector: 'kbq-tooltip-test-new',
    template: `
        <ng-template #template>title-template</ng-template>

        <a
            #titleString
            [kbqTooltip]="'title-string'"
            [kbqTrigger]="'hover'"
            [kbqPlacement]="'top'"
        >
            Show
        </a>
        <a
            #titleTemplate
            [kbqTooltip]="template"
        >
            Show
        </a>
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
        <a
            #mostSimpleTrigger
            [kbqTooltip]="'MOST-SIMPLE'"
        >
            Show
        </a>

        <span
            #normalTrigger
            [kbqTooltip]="'NORMAL'"
            [kbqTrigger]="'hover'"
            [kbqPlacement]="'right'"
        >
            Show
        </span>

        <span
            #focusTrigger
            [kbqTooltip]="'FOCUS'"
            [kbqTrigger]="'focus'"
        >
            Show
        </span>
        <span
            #visibleTrigger
            [kbqTooltip]="'VISIBLE'"
            [kbqVisible]="visible"
        >
            Show
        </span>
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
        <span
            #disabledAttribute
            [kbqTooltip]="'DISABLED'"
            [kbqTrigger]="'manual'"
            [kbqTooltipDisabled]="true"
        >
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
        <ng-template
            #tooltipContent
            let-ctx
        >
            <div>{{ ctx.content }}</div>
        </ng-template>
        <button
            #trigger
            [kbqTooltip]="tooltipContent"
            [kbqTooltipContext]="tooltipContext"
            kbqTrigger="click"
        >
            Button
        </button>
    `
})
class KbqTooltipWithTemplateRefContent {
    @ViewChild('trigger', { static: false }) trigger: ElementRef;
    tooltipContext = { content: 'TestContent' };
}
