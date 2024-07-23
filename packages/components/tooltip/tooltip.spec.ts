import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, flush, inject, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TAB } from '@koobiq/cdk/keycodes';
import { dispatchKeyboardEvent, dispatchMouseEvent } from '@koobiq/cdk/testing';
import { KbqTooltipTrigger } from './tooltip.component';
import { KbqToolTipModule } from './tooltip.module';

describe('KbqTooltip', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let fixture;
    let component;
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqToolTipModule, NoopAnimationsModule],
            declarations: [KbqTooltipTestWrapperComponent, KbqTooltipTestNewComponent, KbqTooltipDisabledComponent]
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
    describe('should bring no break change', () => {
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
            tick(410);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // NOTE: the overlayElement is only available after tooltip shown up
            const overlayElement = component.mostSimpleDirective.overlayRef.overlayElement;
            tooltipDirective.updatePosition(); // This line is temporarily for coverage
            // Move out from the trigger element, then move into the tooltip element
            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            dispatchMouseEvent(overlayElement, 'mouseenter');
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // Move out from the tooltip element to hide it
            dispatchMouseEvent(overlayElement, 'mouseleave');
            tick(100);
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
            tick(410);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // Move out from the trigger element to hide it
            dispatchMouseEvent(triggerElement, 'mouseleave');
            tick(100);
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
            tick(100);
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
            tick(410);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // NOTE: the overlayElement is only available after tooltip shown up
            const overlayElement = component.normalDirective.overlayRef.overlayElement;
            tooltipDirective.updatePosition(); // This line is temporarily for coverage
            // Move out from the trigger element, then move into the tooltip element
            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            dispatchMouseEvent(overlayElement, 'mouseenter');
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // Move out from the tooltip element to hide it
            dispatchMouseEvent(overlayElement, 'mouseleave');
            tick(100);
            fixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));
    });
    xdescribe('should support directive usage', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(KbqTooltipTestNewComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });
    });
    describe('should support kbqTooltipDisabled attribute', () => {
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
            tick(410);
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            tooltipDirective.disabled = false;
            tooltipDirective.show();
            fixture.detectChanges();
            tick(410);
            fixture.detectChanges();
            tick(410);
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
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
    `
})
class KbqTooltipTestWrapperComponent {
    @ViewChild('normalTrigger', { static: false }) normalTrigger: ElementRef;
    @ViewChild('normalTrigger', { read: KbqTooltipTrigger, static: false }) normalDirective: KbqTooltipTrigger;
    @ViewChild('focusTrigger', { static: false }) focusTrigger: ElementRef;
    @ViewChild('visibleTrigger', { static: false }) visibleTrigger: ElementRef;
    @ViewChild('mostSimpleTrigger', { static: false }) mostSimpleTrigger: ElementRef;
    @ViewChild('mostSimpleTrigger', { read: KbqTooltipTrigger, static: false }) mostSimpleDirective: KbqTooltipTrigger;

    visible: boolean;
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
