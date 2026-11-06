import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchKeyboardEvent, ESCAPE } from '@koobiq/components/core';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

// The modal's own animation timeout, internal to its entry point.
const MODAL_ANIMATE_DURATION = 300;

/** A pinned hint on a wrapper around its field, the way the validation tooltip sits on `kbq-form-field`. */
@Component({
    selector: 'pinned-hint-host',
    imports: [KbqToolTipModule],
    template: `
        <div #host kbqTooltip="PINNED" kbqTrigger="manual">
            <input #field aria-label="Field" />
        </div>
    `
})
class PinnedHintHost {
    readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
    readonly tooltip = viewChild.required('host', { read: KbqTooltipTrigger });
}

describe('triage: Escape and a pinned tooltip', () => {
    afterEach(() => {
        TestBed.inject(OverlayContainer).ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: Escape inside the host of a pinned (manual) tooltip closes it and spends the key', async () => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [PinnedHintHost] });

        const fixture = TestBed.createComponent(PinnedHintHost);

        fixture.detectChanges();

        const tooltip = fixture.componentInstance.tooltip();

        tooltip.show(0);
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(tooltip.isOpen).toBe(true);

        // Outside the host the document-level handler deliberately leaves the pinned tooltip alone.
        const outside = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE, undefined, 'Escape');

        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(outside.defaultPrevented).toBe(false);
        expect(tooltip.isOpen).toBe(true);

        // Inside the host the trigger's own `keydown` handler closes it and marks the key as handled.
        const inside = dispatchKeyboardEvent(
            fixture.componentInstance.field().nativeElement,
            'keydown',
            ESCAPE,
            undefined,
            'Escape'
        );

        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(inside.defaultPrevented).toBe(true);
        expect(tooltip.isOpen).toBe(false);
    });

    it('DEFECT: Escape in the field a pinned hint wraps closes the hint instead of the enclosing modal', async () => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [PinnedHintHost] });

        const modalRef = TestBed.inject(KbqModalService).open({ kbqComponent: PinnedHintHost });
        const modalClosing = vi.fn();

        modalRef.beforeClose.subscribe(modalClosing);
        await vi.advanceTimersByTimeAsync(MODAL_ANIMATE_DURATION);

        const content = modalRef.getContentComponent();
        const overlayContainer = TestBed.inject(OverlayContainer);
        const isOpen = () => !!overlayContainer.getContainerElement().querySelector('.kbq-tooltip');
        const field = content.field().nativeElement;

        field.focus();
        content.tooltip().show(0);
        await vi.advanceTimersByTimeAsync(0);

        expect(isOpen()).toBe(true);

        dispatchKeyboardEvent(field, 'keydown', ESCAPE, undefined, 'Escape');
        await vi.advanceTimersByTimeAsync(100);

        expect(isOpen()).toBe(false);
        expect(modalClosing).not.toHaveBeenCalled();

        dispatchKeyboardEvent(field, 'keydown', ESCAPE, undefined, 'Escape');
        await vi.advanceTimersByTimeAsync(100);

        expect(modalClosing).toHaveBeenCalledTimes(1);

        await vi.runOnlyPendingTimersAsync();
    });
});
