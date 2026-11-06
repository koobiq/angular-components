import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { UP_ARROW, createKeyboardEvent } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTimepicker, KbqTimepickerModule } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';
import { Subject } from 'rxjs';

@Component({
    imports: [KbqFormFieldModule, KbqTimepickerModule, ReactiveFormsModule, KbqLuxonDateModule],
    template: `
        @if (show) {
            <kbq-form-field>
                <input kbqTimepicker [formControl]="control" />
            </kbq-form-field>
        }
    `
})
class TestApp {
    readonly timepicker = viewChild(KbqTimepicker);
    readonly control = new FormControl<any>(null);
    show = true;
}

describe('triage: value() follows the raw valueChanges of the bound control', () => {
    let fixture: ComponentFixture<TestApp>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
    });

    it('DEFECT: a control holding an ISO string leaves value() a string, and Up then throws', () => {
        const { control } = fixture.componentInstance;
        const timepicker = fixture.componentInstance.timepicker()!;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        control.setValue('2024-05-17T10:30:00');
        fixture.detectChanges();

        // `writeValue()` deserializes and renders the text...
        expect(input.value).toBe('10:30');
        // ...but the raw `valueChanges` emission overwrites the value with the string.
        expect(typeof timepicker.value()).toBe('string');

        input.setSelectionRange(0, 0);

        expect(() => timepicker.onKeyDown(createKeyboardEvent('keydown', UP_ARROW))).toThrow();
    });

    it('DEFECT: the valueChanges subscription outlives the timepicker', () => {
        const { control } = fixture.componentInstance;
        const timepicker = fixture.componentInstance.timepicker()!;
        const observers = () => (control.valueChanges as Subject<unknown>).observers.length;

        // The form field and the timepicker.
        const subscribed = observers();

        fixture.componentInstance.show = false;
        fixture.detectChanges();

        expect(fixture.componentInstance.timepicker()).toBeUndefined();

        const leftover = observers();

        // The form field releases its subscription; the timepicker's stays.
        expect(leftover).toBe(subscribed - 1);
        expect(leftover).toBe(1);

        const later = DateTime.fromISO('2024-05-17T11:45:00');

        control.setValue(later);

        // The destroyed directive still receives the control's values.
        expect(timepicker.value()).toBe(later);

        fixture.componentInstance.show = true;
        fixture.detectChanges();
        control.setValue(null);
        fixture.componentInstance.show = false;
        fixture.detectChanges();

        // One more subscription per instance, none of them released.
        expect(observers()).toBe(leftover + 1);
    });
});
