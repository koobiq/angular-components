import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, provideCheckNoChangesConfig } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqModalService, MODAL_ANIMATE_DURATION } from '@koobiq/components/modal';

const ANIMATION = MODAL_ANIMATE_DURATION * 2;

@Component({
    selector: 'test-app',
    template: ``
})
class TestApp {}

describe('triage modal: progress state of an array footer button', () => {
    let fixture: ComponentFixture<TestApp>;
    let modalService: KbqModalService;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({
            imports: [TestApp],
            // With the suite's exhaustive check, the first unrelated render after the promise settles fails
            // with NG0100 on `kbq-progress` (true -> false): the binding changed and nothing notified change
            // detection. Off here, so the spec sees what an application sees.
            // eslint-disable-next-line @angular-eslint/no-developer-preview -- tools/vitest/setup-angular.ts uses it too
            providers: [provideCheckNoChangesConfig({ exhaustive: false })]
        });
        fixture = TestBed.createComponent(TestApp);
        modalService = TestBed.inject(KbqModalService);
        overlayContainer = TestBed.inject(OverlayContainer);
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

    it('DEFECT: the spinner stays on a footer button after its onClick promise settles', async () => {
        let resolveClick!: () => void;
        const modalRef = modalService.create({
            kbqTitle: 'Footer',
            kbqFooter: [
                {
                    label: 'Save',
                    type: 'contrast',
                    onClick: () => new Promise<void>((resolve) => (resolveClick = resolve))
                }
            ]
        });

        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(ANIMATION);
        fixture.detectChanges();

        const button = modalRef.getElement().querySelector<HTMLButtonElement>('.kbq-modal-footer button')!;

        button.click();
        // The listener schedules a render on its own.
        await vi.advanceTimersByTimeAsync(50);

        expect(button.classList).toContain('kbq-progress');

        resolveClick();
        await vi.advanceTimersByTimeAsync(1000);
        // An application-wide render that has nothing to do with the dialog.
        TestBed.inject(ApplicationRef).tick();

        expect(button.classList).toContain('kbq-progress');

        // Control: the state already says "not loading"; only a check of the dialog renders it.
        modalRef.markForCheck();
        TestBed.inject(ApplicationRef).tick();

        expect(button.classList).not.toContain('kbq-progress');

        modalRef.close();
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(ANIMATION);
    });
});
