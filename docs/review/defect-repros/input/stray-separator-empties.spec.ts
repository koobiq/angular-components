import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
    COMMA,
    createKeyboardEvent,
    DASH,
    dispatchEvent,
    dispatchFakeEvent,
    KBQ_LOCALE_SERVICE,
    KbqLocaleServiceModule
} from '@koobiq/components/core';
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

describe('triage: a minus after digits or a leading fraction separator', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: is let through, then empties the field and nulls the value', async () => {
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

        // The minus key is not blocked although the caret is after the digits.
        expect(dispatchEvent(input, createKeyboardEvent('keydown', DASH, undefined, '-')).defaultPrevented).toBe(false);

        input.value = '12-';
        dispatchFakeEvent(input, 'input');
        await settle();

        expect(input.value).toBe('');
        expect(fixture.componentInstance.control.value).toBeNull();

        // The fraction separator is not blocked in an empty field either, and is wiped the same way.
        expect(dispatchEvent(input, createKeyboardEvent('keydown', COMMA, undefined, ',')).defaultPrevented).toBe(
            false
        );

        input.value = ',';
        dispatchFakeEvent(input, 'input');
        await settle();

        expect(input.value).toBe('');
        expect(fixture.componentInstance.control.value).toBeNull();
    });
});
