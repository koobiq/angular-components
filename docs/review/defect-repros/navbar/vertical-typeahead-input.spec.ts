import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchKeyboardEvent, S } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqNavbarFocusableItem, KbqNavbarModule } from '@koobiq/components/navbar';

@Component({
    selector: 'test-vertical-field-app',
    imports: [KbqNavbarModule, KbqIconModule, KbqFormFieldModule, KbqInputModule],
    template: `
        <kbq-vertical-navbar>
            <kbq-navbar-container>
                <kbq-navbar-item>
                    <kbq-form-field>
                        <input aria-label="Search" kbqInput />
                    </kbq-form-field>
                </kbq-navbar-item>
                <kbq-navbar-item>
                    <i kbq-icon="kbq-gear_16"></i>
                    <kbq-navbar-title>Settings</kbq-navbar-title>
                </kbq-navbar-item>
            </kbq-navbar-container>
        </kbq-vertical-navbar>
    `
})
class TestVerticalFieldApp {}

describe('triage: vertical navbar typeahead', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [TestVerticalFieldApp] });
    });

    afterEach(() => vi.useRealTimers());

    it('DEFECT: a letter typed into a kbqInput field inside a vertical navbar moves focus to the item whose title starts with it', async () => {
        const fixture = TestBed.createComponent(TestVerticalFieldApp);

        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        const settings = fixture.debugElement.queryAll(By.directive(KbqNavbarFocusableItem))[1]
            .nativeElement as HTMLElement;

        input.focus();
        fixture.detectChanges();

        expect(document.activeElement).toBe(input);

        const event = dispatchKeyboardEvent(input, 'keydown', S, undefined, 's');

        // The character itself is not swallowed: it would land in the field.
        expect(event.defaultPrevented).toBe(false);

        // The typeahead debounce of the key manager.
        await vi.advanceTimersByTimeAsync(200);
        fixture.detectChanges();

        expect(document.activeElement).toBe(settings);
    });
});
