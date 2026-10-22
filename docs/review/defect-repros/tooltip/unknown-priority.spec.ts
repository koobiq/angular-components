import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

@Component({
    selector: 'tooltip-unknown-priority',
    imports: [KbqToolTipModule],
    template: `
        <span #trigger kbqTooltip="PRIORITY" kbqTrigger="manual" [kbqPlacementPriority]="priority">Show</span>
    `
})
class TooltipUnknownPriority {
    readonly tooltipTrigger = viewChild.required('trigger', { read: KbqTooltipTrigger });

    priority = ['nowhere', 'top-start'];
}

describe('triage: kbqPlacementPriority of unknown names', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TooltipUnknownPriority] });
    });

    afterEach(() => {
        TestBed.inject(OverlayContainer).ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: a priority list made only of unknown names makes show() throw and leaves the pane latched', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(TooltipUnknownPriority);

        fixture.detectChanges();

        const trigger = fixture.componentInstance.tooltipTrigger();

        expect(() => trigger.show(0)).toThrow(/At least one position is required/);

        // Attached but never shown: `KbqPopUpTrigger.show` returns early while an instance exists.
        expect(trigger.isAttached).toBe(true);
        expect(trigger.isOpen).toBe(false);

        // Detached by hand so the after-render reposition of CDK does not run against the empty list.
        trigger.overlayRef!.detach();
        await vi.runOnlyPendingTimersAsync();
    });
});
