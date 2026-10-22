import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dispatchMouseEvent } from '@koobiq/components/core';
import { KbqPopoverModule, defaultHoverLeaveDelay } from '@koobiq/components/popover';

@Component({
    selector: 'test-app',
    imports: [KbqPopoverModule],
    template: `
        <button #hover kbqPopoverConfirm kbqTrigger="hover" (confirm)="onConfirm()">Hover</button>
        <button #click kbqPopoverConfirm (confirm)="onConfirm()">Click</button>
    `
})
class TestApp {
    readonly hover = viewChild.required<ElementRef<HTMLElement>>('hover');
    readonly click = viewChild.required<ElementRef<HTMLElement>>('click');

    onConfirm() {
        return;
    }
}

/** Fires the due timers and the zero-delay ones they schedule, which the fake clock puts 1 ms later. */
const runDueTimers = (): Promise<unknown> => vi.advanceTimersByTimeAsync(1);

describe('triage: the confirm button of a hover-opened confirmation popover', () => {
    let fixture: ComponentFixture<TestApp>;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    const panel = () => overlayContainerElement.querySelector('.kbq-popover-confirm');
    const confirmButton = () => overlayContainerElement.querySelector<HTMLElement>('.kbq-popover-confirm button')!;

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

    it('control: a click-opened confirmation popover closes on confirm', async () => {
        vi.useFakeTimers();

        const spy = vi.spyOn(fixture.componentInstance, 'onConfirm');

        dispatchMouseEvent(fixture.componentInstance.click().nativeElement, 'click');
        await runDueTimers();
        fixture.detectChanges();
        expect(panel()).toBeTruthy();

        confirmButton().click();
        await vi.advanceTimersByTimeAsync(defaultHoverLeaveDelay * 2);
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(panel()).toBeFalsy();
    });

    it('DEFECT: emits confirm and leaves the panel open while the pointer rests on it', async () => {
        vi.useFakeTimers();

        const spy = vi.spyOn(fixture.componentInstance, 'onConfirm');
        const trigger = fixture.componentInstance.hover().nativeElement;

        dispatchMouseEvent(trigger, 'mouseenter');
        await runDueTimers();
        fixture.detectChanges();
        expect(panel()).toBeTruthy();

        // Reaching the confirm button: off the trigger and onto the panel.
        dispatchMouseEvent(trigger, 'mouseleave');
        fixture.detectChanges();
        dispatchMouseEvent(overlayContainerElement.querySelector('kbq-popover-confirm-component')!, 'mouseenter');
        fixture.detectChanges();

        confirmButton().click();
        await vi.advanceTimersByTimeAsync(defaultHoverLeaveDelay * 2);
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(panel()).toBeTruthy();

        // Still live: a second press confirms the same action again.
        confirmButton().click();
        await vi.advanceTimersByTimeAsync(defaultHoverLeaveDelay * 2);
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledTimes(2);
        expect(panel()).toBeTruthy();
    });
});
