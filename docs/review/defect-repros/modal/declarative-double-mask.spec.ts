import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqModalModule, MODAL_ANIMATE_DURATION } from '@koobiq/components/modal';

const ANIMATION = MODAL_ANIMATE_DURATION * 2;

@Component({
    selector: 'test-app',
    imports: [KbqModalModule],
    template: `
        <kbq-modal kbqWrapClassName="first" [kbqTitle]="'First'" [(kbqVisible)]="first">First</kbq-modal>
        <kbq-modal kbqWrapClassName="second" [kbqTitle]="'Second'" [(kbqVisible)]="second">Second</kbq-modal>
    `
})
class TestApp {
    first = false;
    second = false;
}

describe('triage modal: dim-layer hand-over on the declarative path', () => {
    let fixture: ComponentFixture<TestApp>;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [TestApp] });
        fixture = TestBed.createComponent(TestApp);
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

    const paintedMasks = () =>
        Array.from(overlayContainer.getContainerElement().querySelectorAll('.kbq-modal-mask')).filter(
            (mask) => !mask.classList.contains('kbq-modal-mask-hidden')
        );

    it('DEFECT: a declarative dialog opened over another shown dialog keeps both dim layers', async () => {
        await settle();

        fixture.componentInstance.first = true;
        await settle();
        expect(paintedMasks().length).toBe(1);

        fixture.componentInstance.second = true;
        await settle();

        // The docs: "only one dim overlay should remain".
        expect(paintedMasks().length).toBe(2);

        fixture.componentInstance.second = false;
        fixture.componentInstance.first = false;
        await settle();
    });
});
