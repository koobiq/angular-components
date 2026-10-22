import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqModalComponent, KbqModalModule, KbqModalService, MODAL_ANIMATE_DURATION } from '@koobiq/components/modal';

const ANIMATION = MODAL_ANIMATE_DURATION * 2;

@Component({
    selector: 'test-app',
    imports: [KbqModalModule],
    template: `
        <kbq-modal [kbqTitle]="'Declarative'" [(kbqVisible)]="visible">Body</kbq-modal>
    `
})
class TestApp {
    readonly modal = viewChild.required(KbqModalComponent);

    visible = false;
}

describe('triage modal: a declarative dialog is registered only once', () => {
    let fixture: ComponentFixture<TestApp>;
    let modalService: KbqModalService;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [TestApp] });
        fixture = TestBed.createComponent(TestApp);
        modalService = TestBed.inject(KbqModalService);
        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    const setVisible = async (visible: boolean) => {
        fixture.componentInstance.visible = visible;
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(ANIMATION);
        fixture.detectChanges();
    };

    it('DEFECT: a reopened declarative dialog is missing from openModals, closeAll() and afterAllClose', async () => {
        const allClosed = vi.fn();

        modalService.afterAllClose.subscribe(allClosed);
        fixture.detectChanges();

        // Control: the first opening and closing are tracked.
        await setVisible(true);
        expect(modalService.openModals.length).toBe(1);

        await setVisible(false);
        expect(modalService.openModals.length).toBe(0);
        expect(allClosed).toHaveBeenCalledTimes(1);

        // Second opening: shown, but no longer tracked.
        await setVisible(true);
        expect(fixture.componentInstance.modal().kbqVisible()).toBe(true);
        expect(modalService.openModals.length).toBe(0);

        modalService.closeAll();
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(ANIMATION);
        fixture.detectChanges();

        expect(fixture.componentInstance.modal().kbqVisible()).toBe(true);
        expect(fixture.componentInstance.visible).toBe(true);

        // Closing it by the binding does not report the end of the last dialog either.
        await setVisible(false);
        expect(allClosed).toHaveBeenCalledTimes(1);
    });
});
