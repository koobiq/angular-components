import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchMouseEvent } from '@koobiq/components/core';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

@Component({
    selector: 'tooltip-trio',
    imports: [KbqToolTipModule],
    template: `
        <span #first kbqTooltip="FIRST">First</span>
        <span #second kbqTooltip="SECOND">Second</span>
        <span #pinned kbqTooltip="PINNED" kbqTrigger="manual">Pinned</span>
    `
})
class TooltipTrio {
    readonly first = viewChild.required<ElementRef<HTMLElement>>('first');
    readonly firstTrigger = viewChild.required('first', { read: KbqTooltipTrigger });
    readonly second = viewChild.required<ElementRef<HTMLElement>>('second');
    readonly secondTrigger = viewChild.required('second', { read: KbqTooltipTrigger });
    readonly pinnedTrigger = viewChild.required('pinned', { read: KbqTooltipTrigger });
}

describe('triage: instant-show window', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TooltipTrio] });
    });

    afterEach(() => {
        TestBed.inject(OverlayContainer).ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: a show cancelled before its enter delay opens the instant-show window for the next tooltip', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(TooltipTrio);

        fixture.detectChanges();

        const component = fixture.componentInstance;
        const firstVisibility: boolean[] = [];

        component.firstTrigger().visibleChange.subscribe((value) => firstVisibility.push(value));

        // The pointer crosses the first trigger in less than the 400 ms enter delay.
        dispatchMouseEvent(component.first().nativeElement, 'mouseenter');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(100);
        dispatchMouseEvent(component.first().nativeElement, 'mouseleave');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(firstVisibility).not.toContain(true);
        expect(component.firstTrigger().isOpen).toBe(false);

        dispatchMouseEvent(component.second().nativeElement, 'mouseenter');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(1);

        // Nothing has been shown, yet the second tooltip skips its 400 ms enter delay.
        expect(component.secondTrigger().isOpen).toBe(true);

        await vi.runOnlyPendingTimersAsync();
    });

    it('DEFECT (secondary): a pinned tooltip shown from code opens the instant-show window too', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(TooltipTrio);

        fixture.detectChanges();

        const component = fixture.componentInstance;

        component.pinnedTrigger().show(0);
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();
        component.pinnedTrigger().hide(0);
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        dispatchMouseEvent(component.second().nativeElement, 'mouseenter');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(1);

        expect(component.secondTrigger().isOpen).toBe(true);

        await vi.runOnlyPendingTimersAsync();
    });
});
