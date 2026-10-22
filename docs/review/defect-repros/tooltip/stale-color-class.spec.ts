import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dispatchMouseEvent } from '@koobiq/components/core';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

@Component({
    selector: 'tooltip-styled',
    imports: [KbqToolTipModule],
    template: `
        <span #trigger kbqTooltip="STYLED" [kbqTooltipColor]="color" [kbqTooltipClass]="customClass">Show</span>
    `
})
class TooltipStyled {
    readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
    readonly tooltipTrigger = viewChild.required('trigger', { read: KbqTooltipTrigger });

    color = '';
    customClass = '';
}

async function showByHover(fixture: ComponentFixture<unknown>, element: HTMLElement) {
    dispatchMouseEvent(element, 'mouseenter');
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(410);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
}

describe('triage: color and class of an open tooltip', () => {
    let fixture: ComponentFixture<TooltipStyled>;
    let component: TooltipStyled;
    let overlayContainerElement: HTMLElement;

    const tooltipClasses = () => overlayContainerElement.querySelector('.kbq-tooltip')!.classList;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TooltipStyled] });
        overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
        fixture = TestBed.createComponent(TooltipStyled);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        TestBed.inject(OverlayContainer).ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: changing kbqTooltipColor while the tooltip is open keeps the old color until it is reopened', async () => {
        vi.useFakeTimers();
        fixture.detectChanges();

        await showByHover(fixture, component.trigger().nativeElement);

        expect(tooltipClasses()).toContain('kbq-contrast');

        component.color = 'error';
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(component.tooltipTrigger().isOpen).toBe(true);
        expect(tooltipClasses()).toContain('kbq-contrast');
        expect(tooltipClasses()).not.toContain('kbq-error');

        // Reopened, the same input does apply.
        dispatchMouseEvent(component.trigger().nativeElement, 'mouseleave');
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();
        await showByHover(fixture, component.trigger().nativeElement);

        expect(tooltipClasses()).toContain('kbq-error');

        await vi.runOnlyPendingTimersAsync();
    });

    it('DEFECT: clearing kbqTooltipClass while the tooltip is open leaves the class on it', async () => {
        vi.useFakeTimers();
        component.customClass = 'custom-hint';
        fixture.detectChanges();

        await showByHover(fixture, component.trigger().nativeElement);

        expect(tooltipClasses()).toContain('custom-hint');

        component.customClass = '';
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(component.tooltipTrigger().isOpen).toBe(true);
        expect(tooltipClasses()).toContain('custom-hint');

        await vi.runOnlyPendingTimersAsync();
    });
});
