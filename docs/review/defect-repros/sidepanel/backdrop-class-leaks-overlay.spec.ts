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

describe('triage: backdropClass that classList.add rejects', () => {
    let sidepanelService: KbqSidepanelService;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let rootFixture: ComponentFixture<TriageRoot>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqSidepanelModule, SimpleSidepanel, TriageRoot] });
        rootFixture = TestBed.createComponent(TriageRoot);
        rootFixture.detectChanges();
        sidepanelService = TestBed.inject(KbqSidepanelService);
        overlayContainer = TestBed.inject(OverlayContainer);
        overlayContainerElement = overlayContainer.getContainerElement();
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    for (const backdropClass of ['custom-backdrop kbq-overlay-dark-backdrop', '']) {
        it(`DEFECT: open() with backdropClass "${backdropClass}" throws and leaves an orphaned overlay and backdrop`, async () => {
            vi.useFakeTimers();

            expect(() => sidepanelService.open(SimpleSidepanel, { backdropClass })).toThrow();

            // The overlay, its container and its backdrop are already attached...
            expect(overlayContainerElement.querySelectorAll('kbq-sidepanel-container').length).toBe(1);
            expect(overlayContainerElement.querySelectorAll('.cdk-overlay-backdrop').length).toBe(1);
            // ...but the panel is not tracked, so nothing can close it.
            expect(sidepanelService.openedSidepanels.length).toBe(0);

            sidepanelService.closeAll();
            rootFixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(overlayContainerElement.querySelectorAll('kbq-sidepanel-container').length).toBe(1);
            expect(overlayContainerElement.querySelectorAll('.cdk-overlay-backdrop').length).toBe(1);
        });
    }
});
