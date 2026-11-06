import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { A, createKeyboardEvent, dispatchEvent, F, ONE, PAGE_DOWN, PAGE_UP, R, Y } from '@koobiq/components/core';
import { KbqInputModule, KbqNumberInput } from '@koobiq/components/input';

@Component({
    imports: [ReactiveFormsModule, KbqInputModule],
    template: `
        <input kbqNumberInput [formControl]="control" />
    `
})
class TestApp {
    readonly control = new FormControl<number | null>(null);
}

type Modifier = 'shiftKey' | 'ctrlKey' | 'metaKey';

function keydown(element: HTMLElement, keyCode: number, key: string, modifier?: Modifier): KeyboardEvent {
    const event = createKeyboardEvent('keydown', keyCode, undefined, key);

    if (modifier) Object.defineProperty(event, modifier, { get: () => true });

    return dispatchEvent(element, event) as KeyboardEvent;
}

describe('triage: the number input keyboard filter', () => {
    it('DEFECT: blocks Shift with a digit key, browser shortcuts other than A/C/V/X/Z, and Page Up/Down', () => {
        TestBed.configureTestingModule({ imports: [TestApp] });

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const input: HTMLInputElement = fixture.debugElement.query(By.directive(KbqNumberInput)).nativeElement;

        // Controls: a plain digit and Ctrl+A pass.
        expect(keydown(input, ONE, '1').defaultPrevented).toBe(false);
        expect(keydown(input, A, 'a', 'ctrlKey').defaultPrevented).toBe(false);

        // A layout that types digits with Shift (AZERTY) reports the digit key code with shiftKey.
        expect(keydown(input, ONE, '1', 'shiftKey').defaultPrevented).toBe(true);

        expect(keydown(input, Y, 'y', 'ctrlKey').defaultPrevented).toBe(true);
        expect(keydown(input, F, 'f', 'ctrlKey').defaultPrevented).toBe(true);
        expect(keydown(input, R, 'r', 'metaKey').defaultPrevented).toBe(true);
        expect(keydown(input, PAGE_UP, 'PageUp').defaultPrevented).toBe(true);
        expect(keydown(input, PAGE_DOWN, 'PageDown').defaultPrevented).toBe(true);
    });
});
