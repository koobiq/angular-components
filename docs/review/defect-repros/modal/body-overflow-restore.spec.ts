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

describe('triage modal: body scroll lock release', () => {
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

    it('DEFECT: closing the last dialog removes an inline overflow the page had set on the body', async () => {
        document.body.style.overflow = 'scroll';

        const modalRef = modalService.create({ kbqTitle: 'Lock' });

        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(ANIMATION);

        expect(document.body.style.overflow).toBe('hidden');

        modalRef.close();
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(ANIMATION);

        expect(document.body.style.overflow).toBe('');
    });
});
