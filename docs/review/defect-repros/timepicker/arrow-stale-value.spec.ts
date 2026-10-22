import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { UP_ARROW, dispatchKeyboardEvent } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTimepicker, KbqTimepickerModule } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';

@Component({
    imports: [KbqFormFieldModule, KbqTimepickerModule, ReactiveFormsModule, KbqLuxonDateModule],
    template: `
        <kbq-form-field>
            <input kbqTimepicker [formControl]="control" />
        </kbq-form-field>
    `
})
class TestApp {
    readonly timepicker = viewChild.required(KbqTimepicker);
    readonly control = new FormControl<DateTime | null>(DateTime.fromISO('2020-01-10T12:18:28'));
}

describe('triage: arrow keys and partially typed text', () => {
    let fixture: ComponentFixture<TestApp>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
    });

    it('DEFECT: Up over typed "12:3" increments the last parsed 12:18 to 12:19 and drops the typed text', () => {
        const { control, timepicker } = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        expect(input.value).toBe('12:18');

        input.value = '12:3';
        timepicker().onInput();
        fixture.detectChanges();

        expect(input.value).toBe('12:3');
        expect(control.value?.minute).toBe(18);

        input.setSelectionRange(4, 4);
        dispatchKeyboardEvent(input, 'keydown', UP_ARROW);
        fixture.detectChanges();

        expect(input.value).toBe('12:19');
        expect(control.value?.minute).toBe(19);
    });
});
