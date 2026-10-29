import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dispatchKeyboardEvent, ESCAPE } from '@koobiq/components/core';
import { KbqModalService, MODAL_ANIMATE_DURATION } from '@koobiq/components/modal';

const ANIMATION = MODAL_ANIMATE_DURATION * 2;

@Component({
    selector: 'test-app',
    template: ``
})
class TestApp {}

describe('triage modal: OK and Cancel on a dialog that is already closing', () => {
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

    it('DEFECT: the predefined buttons and triggerOk() run the handlers again while the dialog closes', async () => {
        const ok = vi.fn();
        const cancel = vi.fn();
        const modalRef = modalService.create({
            kbqTitle: 'Double',
            kbqOkText: 'OK',
            kbqCancelText: 'Cancel',
            kbqOkClick: ok,
            kbqCancelClick: cancel
        });

        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(ANIMATION);
        fixture.detectChanges();

        const element = modalRef.getElement();
        const [okButton, cancelButton] = Array.from(
            element.querySelectorAll<HTMLButtonElement>('.kbq-modal-footer button')
        );
        const closeButton = element.querySelector<HTMLButtonElement>('.kbq-modal-close')!;

        okButton.click();
        fixture.detectChanges();

        expect(ok).toHaveBeenCalledTimes(1);
        expect(modalRef.getInstance().kbqVisible()).toBe(false);

        // Still in the leave animation: the predefined buttons are not guarded.
        okButton.click();
        cancelButton.click();
        modalRef.triggerOk();
        modalRef.triggerCancel();

        expect(ok).toHaveBeenCalledTimes(3);
        expect(cancel).toHaveBeenCalledTimes(2);

        // Control: the close button and Escape check that the dialog is shown.
        closeButton.click();
        dispatchKeyboardEvent(element.querySelector('.kbq-modal-container')!, 'keydown', ESCAPE);

        expect(cancel).toHaveBeenCalledTimes(2);

        await vi.advanceTimersByTimeAsync(ANIMATION);

        // And after the dialog is gone.
        modalRef.triggerOk();

        expect(ok).toHaveBeenCalledTimes(4);
    });
});
