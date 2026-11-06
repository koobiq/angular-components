import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqModalService, MODAL_ANIMATE_DURATION } from '@koobiq/components/modal';

const ANIMATION = MODAL_ANIMATE_DURATION * 2;

@Component({
    selector: 'test-app',
    template: ``
})
class TestApp {}

describe('triage modal: closeAll() and a dialog still opening', () => {
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

    it('DEFECT: closeAll() called during the opening animation leaves the dialog open', async () => {
        const modalRef = modalService.create({ kbqTitle: 'Opening' });

        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(MODAL_ANIMATE_DURATION / 3);

        expect(modalService.openModals.length).toBe(0);

        modalService.closeAll();
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(ANIMATION);
        fixture.detectChanges();

        expect(modalRef.getInstance().kbqVisible()).toBe(true);
        expect(modalService.openModals).toContain(modalRef);

        modalRef.close();
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(ANIMATION);
    });
});
