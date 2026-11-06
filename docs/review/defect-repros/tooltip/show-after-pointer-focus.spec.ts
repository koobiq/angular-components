import { FocusMonitor } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchFakeEvent } from '@koobiq/components/core';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

/** A "Copied" hint the application opens itself after the button was clicked. */
@Component({
    selector: 'tooltip-copy-button',
    imports: [KbqToolTipModule],
    template: `
        <button #trigger kbqTooltip="COPIED" [kbqVisible]="visible">Copy</button>
    `
})
class TooltipCopyButton {
    readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
    readonly tooltipTrigger = viewChild.required('trigger', { read: KbqTooltipTrigger });

    visible = false;
}

describe('triage: programmatic show after a pointer focus', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TooltipCopyButton] });
    });

    afterEach(() => {
        TestBed.inject(OverlayContainer).ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: kbqVisible set right after a pointer-originated focus does not open the tooltip', async () => {
        vi.useFakeTimers();

        const overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
        const fixture = TestBed.createComponent(TooltipCopyButton);
        const component = fixture.componentInstance;

        fixture.detectChanges();

        TestBed.inject(FocusMonitor).focusVia(component.trigger().nativeElement, 'mouse');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);

        component.visible = true;
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(1000);
        fixture.detectChanges();

        expect(component.tooltipTrigger().isOpen).toBe(false);
        expect(overlayContainerElement.querySelector('.kbq-tooltip')).toBeNull();
        // The requested state is latched anyway, so binding `true` again changes nothing.
        expect(component.tooltipTrigger().tooltipVisible).toBe(true);

        await vi.runOnlyPendingTimersAsync();
    });

    it('DEFECT: show() called right after a pointer-originated focus is swallowed by the keyboard-focus gate', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(TooltipCopyButton);
        const component = fixture.componentInstance;
        const trigger = component.tooltipTrigger();

        fixture.detectChanges();

        TestBed.inject(FocusMonitor).focusVia(component.trigger().nativeElement, 'mouse');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);

        trigger.show(0);
        await vi.advanceTimersByTimeAsync(1000);
        fixture.detectChanges();

        expect(trigger.isOpen).toBe(false);

        // Once the last trigger event is no longer `focus`, the very same call opens it.
        dispatchFakeEvent(component.trigger().nativeElement, 'blur');
        trigger.show(0);
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(trigger.isOpen).toBe(true);

        trigger.hide(0);
        await vi.runOnlyPendingTimersAsync();
    });
});
