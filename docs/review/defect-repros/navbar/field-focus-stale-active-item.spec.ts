import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchKeyboardEvent, RIGHT_ARROW } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqNavbar, KbqNavbarFocusableItem, KbqNavbarModule } from '@koobiq/components/navbar';

/** A primary-button click. CDK reads a `mousedown` with `buttons` or `detail` of 0 as a screen reader's. */
const clickWithMouse = (element: HTMLElement): void => {
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, buttons: 1, detail: 1 }));
    element.focus();
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, detail: 1 }));
    element.click();
};

@Component({
    selector: 'test-field-item-app',
    imports: [KbqNavbarModule, KbqFormFieldModule, KbqInputModule],
    template: `
        <kbq-navbar>
            <kbq-navbar-container>
                <kbq-navbar-item>
                    <kbq-navbar-title>First</kbq-navbar-title>
                </kbq-navbar-item>
                <kbq-navbar-item>
                    <kbq-navbar-title>Second</kbq-navbar-title>
                </kbq-navbar-item>
                <kbq-navbar-item>
                    <kbq-form-field>
                        <input aria-label="Search" kbqInput />
                    </kbq-form-field>
                </kbq-navbar-item>
                <kbq-navbar-item>
                    <kbq-navbar-title>Last</kbq-navbar-title>
                </kbq-navbar-item>
            </kbq-navbar-container>
        </kbq-navbar>
    `
})
class TestFieldItemApp {}

describe('triage: clicking into a field inside an item', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [TestFieldItemApp] });
    });

    afterEach(() => vi.useRealTimers());

    it('DEFECT: the previous item stays active, so Right at the end of the field moves to the item after it', async () => {
        const fixture = TestBed.createComponent(TestFieldItemApp);

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        const navbar = fixture.debugElement.query(By.directive(KbqNavbar)).componentInstance as KbqNavbar;
        const [first, second] = fixture.debugElement
            .queryAll(By.directive(KbqNavbarFocusableItem))
            .map(({ nativeElement }) => nativeElement as HTMLElement);
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        clickWithMouse(first);
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        expect(navbar.keyManager.activeItemIndex).toBe(0);

        clickWithMouse(input);
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        expect(document.activeElement).toBe(input);
        // The field sits in the third item, yet the first one is still the active item.
        expect(navbar.keyManager.activeItemIndex).toBe(0);

        // An empty field: the cursor is at its end.
        dispatchKeyboardEvent(input, 'keydown', RIGHT_ARROW);
        fixture.detectChanges();

        // Expected: the item after the field ("Last"); actual: the item after the stale active one.
        expect(document.activeElement).toBe(second);
    });
});
