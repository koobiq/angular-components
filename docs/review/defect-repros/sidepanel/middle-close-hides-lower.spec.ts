import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqSidepanelModule, KbqSidepanelService } from '@koobiq/components/sidepanel';

@Component({
    template: '<div>Simple Sidepanel</div>'
})
class SimpleSidepanel {}

@Component({
    selector: 'triage-root',
    template: '<div></div>'
})
class TriageRoot {}

describe('triage: closing the middle panel of a same-position stack', () => {
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

    const settle = async () => {
        rootFixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        rootFixture.detectChanges();
    };

    const host = (id: string) => document.getElementById(id)!;

    it('DEFECT: the bottom panel stays invisible under the top panel indent strip until the top one closes', async () => {
        vi.useFakeTimers();

        const bottom = sidepanelService.open(SimpleSidepanel, { hasBackdrop: false });
        const middle = sidepanelService.open(SimpleSidepanel, { hasBackdrop: false });
        const top = sidepanelService.open(SimpleSidepanel, { hasBackdrop: false });

        await settle();

        // Before: the bottom panel is pushed back two levels and transparent.
        expect(host(bottom.id).style.opacity).toBe('0');

        middle.close();
        await settle();

        expect(sidepanelService.openedSidepanels).toEqual([bottom, top]);
        // The top panel still exposes an indent strip of the panel underneath...
        expect(host(top.id).querySelector('.kbq-sidepanel-indent')).not.toBeNull();
        // ...but that panel is still transparent: it was never promoted to the "one level down" state.
        expect(host(bottom.id).style.opacity).toBe('0');

        top.close();
        await settle();

        // It reappears only once the top panel closes.
        expect(sidepanelService.openedSidepanels).toEqual([bottom]);
        expect(host(bottom.id).style.opacity).toBe('1');
    });
});
