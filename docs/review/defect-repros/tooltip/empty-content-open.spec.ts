import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchMouseEvent } from '@koobiq/components/core';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

@Component({
    selector: 'tooltip-dynamic-content',
    imports: [KbqToolTipModule],
    template: `
        <span #trigger [kbqTooltip]="content">Show</span>
    `
})
class TooltipDynamicContent {
    readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
    readonly tooltipTrigger = viewChild.required('trigger', { read: KbqTooltipTrigger });

    content = 'HINT';
}

describe('triage: content cleared while open', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TooltipDynamicContent] });
    });

    afterEach(() => {
        TestBed.inject(OverlayContainer).ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: clearing the content of an open tooltip leaves an empty tooltip on screen', async () => {
        vi.useFakeTimers();

        const overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
        const fixture = TestBed.createComponent(TooltipDynamicContent);
        const component = fixture.componentInstance;

        fixture.detectChanges();

        dispatchMouseEvent(component.trigger().nativeElement, 'mouseenter');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(410);
        fixture.detectChanges();

        expect(overlayContainerElement.textContent).toContain('HINT');

        component.content = '';
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(1000);
        fixture.detectChanges();

        const tooltip = overlayContainerElement.querySelector('.kbq-tooltip');

        expect(component.tooltipTrigger().isOpen).toBe(true);
        expect(tooltip).not.toBeNull();
        expect(tooltip!.classList).toContain('kbq-tooltip_visible');
        expect(tooltip!.textContent!.trim()).toBe('');

        await vi.runOnlyPendingTimersAsync();
    });
});
