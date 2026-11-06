import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqModalService, MODAL_ANIMATE_DURATION } from '@koobiq/components/modal';

@Component({
    selector: 'test-app',
    template: ``
})
class TestApp {}

describe('triage modal: closing during the opening animation', () => {
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

    it('DEFECT: afterOpen emits after beforeClose, the dialog enters openModals and the leave animation is cut short', async () => {
        const events: string[] = [];
        const modalRef = modalService.create({ kbqTitle: 'Racing' });

        modalRef.afterOpen.subscribe(() => events.push('afterOpen'));
        modalRef.beforeClose.subscribe(() => events.push('beforeClose'));
        modalRef.afterClose.subscribe(() => events.push('afterClose'));

        // t = 100: closed while the 300 ms opening animation runs, so the leave should end at t = 400.
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(100);

        modalRef.close();
        fixture.detectChanges();

        const wrap = modalRef.getElement().querySelector<HTMLElement>('.kbq-modal-wrap')!;
        const container = modalRef.getElement().querySelector<HTMLElement>('.kbq-modal-container')!;

        expect(events).toEqual(['beforeClose']);
        expect(container.classList).toContain('zoom-leave');
        expect(wrap.style.display).toBe('');

        // t = 300: the timer of the opening animation settles it.
        await vi.advanceTimersByTimeAsync(MODAL_ANIMATE_DURATION - 100);
        fixture.detectChanges();

        expect(events).toEqual(['beforeClose', 'afterOpen']);
        expect(modalService.openModals).toContain(modalRef);
        // The leave animation is 100 ms short of its end, yet the dialog is already hidden.
        expect(container.classList).not.toContain('zoom-leave');
        expect(wrap.style.display).toBe('none');

        // t = 400: the leave settles.
        await vi.advanceTimersByTimeAsync(100);

        expect(events).toEqual(['beforeClose', 'afterOpen', 'afterClose']);
        expect(modalService.openModals).not.toContain(modalRef);

        await vi.runOnlyPendingTimersAsync();
    });
});
