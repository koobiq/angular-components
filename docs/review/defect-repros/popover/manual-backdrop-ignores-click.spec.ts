import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dispatchMouseEvent } from '@koobiq/components/core';
import { KbqPopoverModule } from '@koobiq/components/popover';

@Component({
    selector: 'test-app',
    imports: [KbqPopoverModule],
    template: `
        <button
            #manual
            kbqPopover
            kbqTrigger="manual"
            kbqPopoverHasBackdrop
            kbqPopoverContent="MANUAL"
            [kbqPopoverVisible]="visible"
        >
            Manual
        </button>
        <button #click kbqPopover kbqPopoverHasBackdrop kbqPopoverContent="CLICK">Click</button>
    `
})
class TestApp {
    visible = false;

    readonly manual = viewChild.required<ElementRef<HTMLElement>>('manual');
    readonly click = viewChild.required<ElementRef<HTMLElement>>('click');
}

/** Fires the due timers and the zero-delay ones they schedule, which the fake clock puts 1 ms later. */
const runDueTimers = (): Promise<unknown> => vi.advanceTimersByTimeAsync(1);

describe('triage: the backdrop of a popover that does not open on click', () => {
    let fixture: ComponentFixture<TestApp>;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    const isOpen = () => !!overlayContainerElement.querySelector('.kbq-popover');
    const backdrop = () => overlayContainerElement.querySelector<HTMLElement>('.cdk-overlay-backdrop');

    /** The delayed closing action, the hide timeout and the detach. */
    const settleClose = async () => {
        await runDueTimers();
        fixture.detectChanges();
        await runDueTimers();
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

    it('control: a click popover closes on a backdrop click', async () => {
        vi.useFakeTimers();

        dispatchMouseEvent(fixture.componentInstance.click().nativeElement, 'click');
        await runDueTimers();
        fixture.detectChanges();
        expect(isOpen()).toBe(true);

        backdrop()!.click();
        await settleClose();

        expect(isOpen()).toBe(false);
    });

    it('DEFECT: a manual popover with kbqPopoverHasBackdrop ignores backdrop clicks', async () => {
        vi.useFakeTimers();

        fixture.componentInstance.visible = true;
        fixture.detectChanges();
        await runDueTimers();
        fixture.detectChanges();

        expect(isOpen()).toBe(true);
        expect(backdrop()).toBeTruthy();

        backdrop()!.click();
        await settleClose();
        backdrop()!.click();
        await settleClose();

        expect(isOpen()).toBe(true);
        expect(backdrop()).toBeTruthy();
    });
});
