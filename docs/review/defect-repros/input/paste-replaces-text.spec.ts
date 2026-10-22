import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent, KBQ_LOCALE_SERVICE, KbqLocaleServiceModule } from '@koobiq/components/core';
import { KbqInputModule, KbqNumberInput } from '@koobiq/components/input';

@Component({
    imports: [ReactiveFormsModule, KbqInputModule],
    template: `
        <input kbqNumberInput [formControl]="control" />
    `
})
class TestApp {
    readonly control = new FormControl<number | null>(12);
}

/** A paste event as the browser fires it, carrying the clipboard text. */
function paste(element: HTMLElement, text: string): Event {
    const event = new Event('paste', { bubbles: true, cancelable: true });

    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    element.dispatchEvent(event);

    return event;
}

/** The input event the browser fires once it has inserted the pasted text at the caret. */
function insertFromPaste(element: HTMLInputElement, newText: string): void {
    const event = new Event('input', { bubbles: true });

    Object.defineProperty(event, 'inputType', { value: 'insertFromPaste' });
    element.value = newText;
    element.dispatchEvent(event);
}

describe('triage: paste into the number input', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: pasting 3 after 12 replaces the whole text with 3 instead of giving 123', async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({ imports: [KbqLocaleServiceModule, TestApp] });
        TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('ru-RU');

        const fixture = TestBed.createComponent(TestApp);
        const settle = async () => {
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();
        };

        await settle();

        const input: HTMLInputElement = fixture.debugElement.query(By.directive(KbqNumberInput)).nativeElement;

        expect(input.value).toBe('12');

        // The paste is not cancelled, so the browser inserts it at the caret, after `12`.
        expect(paste(input, '3').defaultPrevented).toBe(false);
        insertFromPaste(input, '123');
        await settle();

        expect(input.value).toBe('3');
        expect(fixture.componentInstance.control.value).toBe(3);

        // Typing the same digit at the same place keeps the rest of the text.
        input.value = '34';
        dispatchFakeEvent(input, 'input');
        await settle();

        expect(input.value).toBe('34');
    });
});
