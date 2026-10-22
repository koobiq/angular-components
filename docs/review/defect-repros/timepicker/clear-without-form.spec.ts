import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { BACKSPACE, UP_ARROW, dispatchFakeEvent, dispatchKeyboardEvent } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTimepicker, KbqTimepickerModule } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';

@Component({
    imports: [KbqFormFieldModule, KbqTimepickerModule, KbqLuxonDateModule],
    template: `
        <kbq-form-field>
            <input kbqTimepicker [value]="value" />
        </kbq-form-field>
    `
})
class TestApp {
    readonly timepicker = viewChild.required(KbqTimepicker);
    value: DateTime | null = DateTime.fromISO('2020-01-10T10:30:00');
}

describe('triage: clearing a timepicker without a form control', () => {
    let fixture: ComponentFixture<TestApp>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
    });

    it('DEFECT: value() keeps the previous time after the text is cleared and the field is left', () => {
        const { timepicker } = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        expect(input.value).toBe('10:30');

        dispatchFakeEvent(input, 'focus');
        input.select();
        dispatchKeyboardEvent(input, 'keydown', BACKSPACE);
        input.value = '';
        dispatchFakeEvent(input, 'blur');
        fixture.detectChanges();

        expect(input.value).toBe('');
        expect(timepicker().empty()).toBe(true);
        expect(timepicker().value()?.toISO()).toContain('2020-01-10T10:30:00');

        // The stale value comes back on the next arrow key.
        input.setSelectionRange(0, 0);
        dispatchKeyboardEvent(input, 'keydown', UP_ARROW);
        fixture.detectChanges();

        expect(input.value).toBe('11:30');
    });
});
