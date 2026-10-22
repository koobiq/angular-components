import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchKeyboardEvent, RIGHT_ARROW } from '@koobiq/components/core';
import { KbqNavbarBrand, KbqNavbarFocusableItem, KbqNavbarModule } from '@koobiq/components/navbar';

/** A primary-button click. CDK reads a `mousedown` with `buttons` or `detail` of 0 as a screen reader's. */
const clickWithMouse = (element: HTMLElement): void => {
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, buttons: 1, detail: 1 }));
    element.focus();
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, detail: 1 }));
    element.click();
};

@Component({
    selector: 'test-button-brand-app',
    imports: [KbqNavbarModule],
    template: `
        <kbq-navbar>
            <kbq-navbar-container>
                <kbq-navbar-item>
                    <kbq-navbar-title>First</kbq-navbar-title>
                </kbq-navbar-item>
                <button kbq-navbar-brand type="button" (click)="clicks = clicks + 1">
                    <kbq-navbar-title>Home</kbq-navbar-title>
                </button>
                <kbq-navbar-item>
                    <kbq-navbar-title>Last</kbq-navbar-title>
                </kbq-navbar-item>
            </kbq-navbar-container>
        </kbq-navbar>
    `
})
class TestButtonBrandApp {
    clicks = 0;
}

describe('triage: a brand on a <button>', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [TestButtonBrandApp] });
    });

    afterEach(() => vi.useRealTimers());

    it('DEFECT: <button kbq-navbar-brand> is treated as decorative and skipped by the arrow keys', async () => {
        const fixture = TestBed.createComponent(TestButtonBrandApp);

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        const brandDebugEl = fixture.debugElement.query(By.directive(KbqNavbarBrand));
        const brand = brandDebugEl.nativeElement as HTMLButtonElement;
        const [first, , last] = fixture.debugElement
            .queryAll(By.directive(KbqNavbarFocusableItem))
            .map(({ nativeElement }) => nativeElement as HTMLElement);

        expect(brand.tagName).toBe('BUTTON');
        expect(brand.getAttribute('tabindex')).toBe('-1');
        expect(brandDebugEl.injector.get(KbqNavbarFocusableItem).disabled).toBe(true);

        clickWithMouse(first);
        fixture.detectChanges();

        dispatchKeyboardEvent(first, 'keydown', RIGHT_ARROW);
        fixture.detectChanges();

        // The brand between the two items is never reached.
        expect(document.activeElement).toBe(last);
    });
});
