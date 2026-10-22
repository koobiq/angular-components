import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dispatchMouseEvent } from '@koobiq/components/core';
import { KbqPopoverModule, defaultHoverLeaveDelay } from '@koobiq/components/popover';

@Component({
    selector: 'test-app',
    imports: [KbqPopoverModule],
    template: `
        <button #hover kbqPopover kbqTrigger="hover" kbqPopoverContent="HOVER">Hover</button>
        <button #pinned kbqPopover kbqTrigger="hover" kbqPopoverPreventClose kbqPopoverContent="PINNED">Pinned</button>
    `
})
class TestApp {
    readonly hover = viewChild.required<ElementRef<HTMLElement>>('hover');
    readonly pinned = viewChild.required<ElementRef<HTMLElement>>('pinned');
}

/** Fires the due timers and the zero-delay ones they schedule, which the fake clock puts 1 ms later. */
const runDueTimers = (): Promise<unknown> => vi.advanceTimersByTimeAsync(1);

describe('triage: leaving the panel of a hover popover', () => {
    let fixture: ComponentFixture<TestApp>;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    const isOpen = () => !!overlayContainerElement.querySelector('.kbq-popover');

    const openByHover = async (trigger: HTMLElement) => {
        dispatchMouseEvent(trigger, 'mouseenter');
        await runDueTimers();
        fixture.detectChanges();
    };

    const movePointerOntoPanel = (trigger: HTMLElement) => {
        dispatchMouseEvent(trigger, 'mouseleave');
        fixture.detectChanges();
        dispatchMouseEvent(overlayContainerElement.querySelector('kbq-popover-component')!, 'mouseenter');
        fixture.detectChanges();
    };

    /** A browser dispatches `mouseleave` on every element the pointer leaves: the panel and the host around it. */
    const movePointerOffPanel = () => {
        dispatchMouseEvent(overlayContainerElement.querySelector('.kbq-popover')!, 'mouseleave');
        dispatchMouseEvent(overlayContainerElement.querySelector('kbq-popover-component')!, 'mouseleave');
        fixture.detectChanges();
    };

    beforeEach(() => {
        fixture = TestBed.createComponent(TestApp);
        fixture.autoDetectChanges();

        overlayContainer = TestBed.inject(OverlayContainer);
        overlayContainerElement = overlayContainer.getContainerElement();
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: closes 1 ms after the pointer leaves the panel instead of after kbqLeaveDelay', async () => {
        vi.useFakeTimers();

        const trigger = fixture.componentInstance.hover().nativeElement;

        await openByHover(trigger);
        movePointerOntoPanel(trigger);

        // Control: resting on the panel keeps it open well past the leave delay.
        await vi.advanceTimersByTimeAsync(defaultHoverLeaveDelay * 2);
        fixture.detectChanges();
        expect(isOpen()).toBe(true);

        movePointerOffPanel();
        await runDueTimers();
        await runDueTimers();
        fixture.detectChanges();

        // 2 ms after leaving, against a 500 ms leave delay.
        expect(isOpen()).toBe(false);
    });

    it('DEFECT: leaving the panel closes a hover popover despite kbqPopoverPreventClose', async () => {
        vi.useFakeTimers();

        const trigger = fixture.componentInstance.pinned().nativeElement;

        await openByHover(trigger);

        // Control: kbqPopoverPreventClose holds against the hover hide that follows leaving the trigger.
        dispatchMouseEvent(trigger, 'mouseleave');
        await vi.advanceTimersByTimeAsync(defaultHoverLeaveDelay * 2);
        fixture.detectChanges();
        expect(isOpen()).toBe(true);

        dispatchMouseEvent(overlayContainerElement.querySelector('kbq-popover-component')!, 'mouseenter');
        fixture.detectChanges();

        movePointerOffPanel();
        await runDueTimers();
        await runDueTimers();
        fixture.detectChanges();

        expect(isOpen()).toBe(false);
    });
});
