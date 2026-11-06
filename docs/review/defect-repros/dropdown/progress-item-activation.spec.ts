import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ENTER, dispatchKeyboardEvent } from '@koobiq/components/core';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';

@Component({
    imports: [KbqDropdownModule],
    template: `
        <button [kbqDropdownTriggerFor]="dropdown">Open</button>
        <kbq-dropdown #dropdown="kbqDropdown">
            <button kbq-dropdown-item progress (click)="activated = activated + 1">Export</button>
        </kbq-dropdown>
    `
})
class TestApp {
    readonly trigger = viewChild.required(KbqDropdownTrigger);
    activated = 0;
}

// jsdom does no hit-testing and does not turn Enter on a button into a click, so each test dispatches the event
// where a browser delivers it: a pointer click on the full-size `.kbq-dropdown-item-overlay` that covers the item,
// the click produced by Enter/Space on the `<button>` host itself.
describe('triage: activating an item in progress', () => {
    function setup() {
        TestBed.configureTestingModule({ imports: [TestApp] });

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        fixture.componentInstance.trigger().open();
        fixture.detectChanges();

        const item = document.querySelector<HTMLElement>('.kbq-dropdown-item.kbq-progress')!;

        return { fixture, item };
    }

    it('DEFECT: a pointer click, which lands on the item overlay, is swallowed: no handler runs, the panel stays open', () => {
        const { fixture, item } = setup();
        const overlay = item.querySelector<HTMLElement>('.kbq-dropdown-item-overlay')!;
        const click = new MouseEvent('click', { bubbles: true, cancelable: true });

        overlay.dispatchEvent(click);
        fixture.detectChanges();

        expect(click.defaultPrevented).toBe(true);
        expect(fixture.componentInstance.activated).toBe(0);
        expect(fixture.componentInstance.trigger().opened).toBe(true);
    });

    it('DEFECT: Enter on the button host is not intercepted, and the click it produces activates the item and closes the panel', () => {
        const { fixture, item } = setup();

        const enter = dispatchKeyboardEvent(item, 'keydown', ENTER);

        expect(enter.defaultPrevented).toBe(false);

        item.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.activated).toBe(1);
        expect(fixture.componentInstance.trigger().opened).toBe(false);
    });
});
