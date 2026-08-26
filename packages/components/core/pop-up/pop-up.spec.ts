import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { dispatchMouseEvent } from '../testing';
import { PopUpVisibility } from './constants';
import { KbqPopUp } from './pop-up';
import { KbqPopUpTrigger } from './pop-up-trigger';

@Component({
    selector: 'test-pop-up',
    template: `
        <div class="test-pop-up">Content</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestPopUp extends KbqPopUp {
    protected prefix = 'test-pop-up';
}

describe('KbqPopUp', () => {
    let fixture: ComponentFixture<TestPopUp>;
    let popUp: TestPopUp;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestPopUp] });

        fixture = TestBed.createComponent(TestPopUp);
        fixture.detectChanges();

        popUp = fixture.componentInstance;
        // Normally assigned by `KbqPopUpTrigger.show()` right after the portal is attached; `show()` reads the
        // trigger to decide whether the pop-up hides itself when the pointer leaves it.
        popUp.trigger = { triggerName: 'mouseenter' } as unknown as KbqPopUpTrigger<unknown>;
    });

    it('should replace a pending show instead of queueing a second one', fakeAsync(() => {
        popUp.show(100);
        tick(50);
        // What `KbqPopUpTrigger.show()` does on every re-hover while the pop-up stays attached.
        popUp.show(100);

        popUp.hide(0);
        flush();

        // A stacked show task outlives the `hide()` meant to cancel it and puts the pop-up back on screen.
        expect(popUp.isVisible()).toBe(false);
    }));

    it('should cancel a re-entered show when the pop-up is destroyed', fakeAsync(() => {
        popUp.show(100);
        tick(50);
        popUp.show(100);

        fixture.destroy();
        flush();

        expect(popUp.visibility).toBe(PopUpVisibility.Initial);
    }));

    it('should bind the mouseleave hide listener once and remove it on destroy', fakeAsync(() => {
        const element: HTMLElement = popUp['elementRef'].nativeElement;
        const addEventListener = jest.spyOn(element, 'addEventListener');

        popUp.show(0);
        tick();
        popUp.show(0);
        tick();

        expect(addEventListener.mock.calls.filter(([type]) => type === 'mouseleave')).toHaveLength(1);

        const hide = jest.spyOn(popUp, 'hide');

        fixture.destroy();
        dispatchMouseEvent(element, 'mouseleave');

        expect(hide).not.toHaveBeenCalled();
    }));
});
