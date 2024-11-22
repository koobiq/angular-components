import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchMouseEvent } from '@koobiq/cdk/testing';
import { KbqTooltipTrigger } from './tooltip.component';
import { KbqToolTipModule } from './tooltip.module';

const tooltipDefaultEnterDelayWithDefer = 410;
const tickTime = 100;
const defaultOffsetForTooltip = 8;
const defaultOffsetForTooltipWithoutArrow = 4;

describe('KbqTooltip', () => {
    let overlayContainer: OverlayContainer;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqToolTipModule,
                NoopAnimationsModule
            ],
            declarations: [
                KbqTooltipTestWrapperComponent
            ]
        }).compileComponents();
    }));

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
        overlayContainer = oc;
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

        it('should change offset for arrowless tooltip', fakeAsync(() => {
            let [tooltip, styles] = getTooltipAndStyles(component.dynamicArrowAndOffsetTrigger);

            expect(tooltip).toBeTruthy();
            expect(styles?.marginTop).toEqual(`${defaultOffsetForTooltip}px`);

            // hide tooltip
            dispatchMouseEvent(component.dynamicArrowAndOffsetTrigger.nativeElement, 'mouseleave');
            fixture.detectChanges();
            tick(tickTime);

            component.arrow = false;
            fixture.detectChanges();

            [tooltip, styles] = getTooltipAndStyles(component.dynamicArrowAndOffsetTrigger, '.kbq-tooltip_arrowless');

            expect(tooltip).toBeTruthy();
            expect(styles?.marginTop).toEqual(`${defaultOffsetForTooltipWithoutArrow}px`);
        }));
    });
});

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
