import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMouseEvent, dispatchMouseEvent } from '@koobiq/components/core';
import { KbqSidepanelModule, KbqSidepanelService } from '@koobiq/components/sidepanel';

@Component({
    template: '<div class="triage-content">Simple Sidepanel</div>'
})
class SimpleSidepanel {}

@Component({
    selector: 'triage-root',
    template: '<div></div>'
})
class TriageRoot {}

describe('triage: non-modal stack closes on non-primary clicks', () => {
    let sidepanelService: KbqSidepanelService;
    let overlayContainer: OverlayContainer;
    let rootFixture: ComponentFixture<TriageRoot>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqSidepanelModule, SimpleSidepanel, TriageRoot] });
        rootFixture = TestBed.createComponent(TriageRoot);
        rootFixture.detectChanges();
        sidepanelService = TestBed.inject(KbqSidepanelService);
        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    const openStack = async () => {
        const lower = sidepanelService.open(SimpleSidepanel, { hasBackdrop: false });
        const upper = sidepanelService.open(SimpleSidepanel, { hasBackdrop: false });

        rootFixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        return { lower, upper };
    };

    const settle = async () => {
        rootFixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        rootFixture.detectChanges();
    };

    it('DEFECT: a right click (contextmenu) on the panel underneath closes the panel above it', async () => {
        vi.useFakeTimers();

        const { lower, upper } = await openStack();
        const target = document.getElementById(lower.id)!.querySelector('.triage-content')!;

        dispatchMouseEvent(target, 'contextmenu', 0, 0, createMouseEvent('contextmenu', 0, 0, 2));
        await settle();

        expect(sidepanelService.openedSidepanels).toEqual([lower]);
        expect(document.getElementById(upper.id)).toBeNull();
    });

    it('DEFECT: a middle click (auxclick) on the panel underneath closes the panel above it', async () => {
        vi.useFakeTimers();

        const { lower, upper } = await openStack();
        const target = document.getElementById(lower.id)!.querySelector('.triage-content')!;

        dispatchMouseEvent(target, 'auxclick', 0, 0, createMouseEvent('auxclick', 0, 0, 1));
        await settle();

        expect(sidepanelService.openedSidepanels).toEqual([lower]);
        expect(document.getElementById(upper.id)).toBeNull();
    });
});
