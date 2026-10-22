import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchMouseEvent } from '@koobiq/components/core';
import { KbqTitleDirective } from '@koobiq/components/title';

@Component({
    imports: [KbqTitleDirective],
    template: `
        <div #title kbq-title>{{ text() }}</div>
    `
})
class LiveTextTitle {
    readonly text = signal('Alpha');
    readonly titleElement = viewChild.required<ElementRef<HTMLElement>>('title');
    readonly title = viewChild.required('title', { read: KbqTitleDirective });
}

const getTooltipElement = (): Element | null =>
    TestBed.inject(OverlayContainer).getContainerElement().querySelector('.kbq-tooltip');

describe('KbqTitleDirective triage: throttled mutations', () => {
    afterEach(() => vi.useRealTimers());

    it('DEFECT: a second content change within 100 ms is dropped and the open tooltip keeps the earlier text', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(LiveTextTitle);

        fixture.detectChanges();
        const { titleElement, title, text } = fixture.componentInstance;
        const host = titleElement().nativeElement;

        // Overflown by whole pixels, so the measurement never appends its probe element to the host.
        vi.spyOn(host, 'offsetWidth', 'get').mockReturnValue(100);
        vi.spyOn(host, 'scrollWidth', 'get').mockReturnValue(200);

        dispatchMouseEvent(host, 'mouseenter');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(500);
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(title().isOpen).toBe(true);
        expect(getTooltipElement()?.textContent).toContain('Alpha');

        // Real ContentObserver (MutationObserver): the first change is handled on the leading edge.
        text.set('Beta');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(title().content).toBe('Beta');

        await vi.advanceTimersByTimeAsync(50);
        text.set('Gamma');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(1000);
        fixture.detectChanges();

        expect(host.textContent).toBe('Gamma');
        expect(title().isOpen).toBe(true);
        expect(title().content).toBe('Beta');
        expect(getTooltipElement()?.textContent).toContain('Beta');
        expect(getTooltipElement()?.textContent).not.toContain('Gamma');

        await vi.runOnlyPendingTimersAsync();
    });
});
