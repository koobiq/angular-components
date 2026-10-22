import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqModalService, MODAL_ANIMATE_DURATION } from '@koobiq/components/modal';

const ANIMATION = MODAL_ANIMATE_DURATION * 2;

@Component({
    selector: 'test-app',
    template: `
        <button type="button">Page control</button>
    `
})
class TestApp {}

describe('triage modal: kbqVisible passed to the service', () => {
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
        document.body.style.removeProperty('overflow');
        vi.useRealTimers();
    });

    const settle = async () => {
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(ANIMATION);
        fixture.detectChanges();
    };

    const pageIsInert = () => !!fixture.nativeElement.closest('[inert]');

    it('DEFECT: kbqVisible: true turns open() into a no-op — no afterOpen, no registry, no scroll lock, no inert page', async () => {
        const opened = vi.fn();
        const modalRef = modalService.create({ kbqTitle: 'Preset visible', kbqVisible: true });

        modalRef.afterOpen.subscribe(opened);
        await settle();

        // Painted and focused all the same.
        expect(modalRef.getElement().querySelector<HTMLElement>('.kbq-modal-wrap')!.style.display).toBe('');
        expect(modalRef.getElement().contains(document.activeElement)).toBe(true);

        expect(opened).not.toHaveBeenCalled();
        expect(modalService.openModals.length).toBe(0);
        expect(document.body.style.overflow).toBe('');
        expect(pageIsInert()).toBe(false);

        modalRef.close();
        await settle();
    });

    it('DEFECT: a kbqVisible: true dialog opened over another shown dialog is made inert itself', async () => {
        const below = modalService.create({ kbqTitle: 'Below' });

        await settle();

        // Control: the normal open flow takes the page out of the accessibility tree.
        expect(pageIsInert()).toBe(true);

        const above = modalService.create({ kbqTitle: 'Above', kbqVisible: true });

        await settle();

        expect(above.getElement().querySelector('.kbq-modal-container')!.closest('[inert]')).not.toBeNull();
        expect(below.getElement().querySelector('.kbq-modal-container')!.closest('[inert]')).toBeNull();

        above.close();
        below.close();
        await settle();
    });
});
