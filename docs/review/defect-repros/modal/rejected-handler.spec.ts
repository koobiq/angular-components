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

describe('triage modal: a rejected promise from an OK or Cancel handler', () => {
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

    const settle = async () => {
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(ANIMATION);
        fixture.detectChanges();
    };

    it('DEFECT: a rejected kbqOkClick promise closes the dialog with the rejection reason as the result', async () => {
        const reason = new Error('save failed');
        const closed = vi.fn();
        const modalRef = modalService.create({
            kbqTitle: 'Async OK',
            kbqOkText: 'Save',
            kbqOkClick: () => Promise.reject(reason)
        });

        modalRef.afterClose.subscribe(closed);
        await settle();

        modalRef.triggerOk();
        await vi.advanceTimersByTimeAsync(0);

        expect(modalRef.getInstance().kbqVisible()).toBe(false);

        await settle();

        expect(closed).toHaveBeenCalledWith(reason);
    });

    it('DEFECT: a rejected kbqCancelClick promise closes the dialog with the rejection reason as the result', async () => {
        const reason = 'cancel failed';
        const closed = vi.fn();
        const modalRef = modalService.create({
            kbqTitle: 'Async Cancel',
            kbqCancelText: 'Cancel',
            kbqCancelClick: () => Promise.reject(reason)
        });

        modalRef.afterClose.subscribe(closed);
        await settle();

        modalRef.triggerCancel();
        await vi.advanceTimersByTimeAsync(0);

        expect(modalRef.getInstance().kbqVisible()).toBe(false);

        await settle();

        expect(closed).toHaveBeenCalledWith(reason);
    });
});
