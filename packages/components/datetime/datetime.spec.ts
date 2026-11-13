import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    BACKSPACE,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    KBQ_LOCALE_SERVICE,
    LEFT_ARROW,
    RIGHT_ARROW,
    UP_ARROW
} from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { TimeFormats } from '@koobiq/components/timepicker';
import { DateTime } from 'luxon';
import { KbqDatetime, KbqDatetimeModule } from './index';

const ISO = "yyyy-MM-dd'T'HH:mm:ss.SSS";

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });

    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

const getHost = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.nativeElement.querySelector('kbq-datetime');

const getDateInput = (fixture: ComponentFixture<unknown>): HTMLInputElement =>
    fixture.nativeElement.querySelector('.kbq-datetime__date');

const getTimeInput = (fixture: ComponentFixture<unknown>): HTMLInputElement =>
    fixture.nativeElement.querySelector('.kbq-datetime__time');

const getFormField = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.nativeElement.querySelector('kbq-form-field');

const settle = async (fixture: ComponentFixture<unknown>): Promise<void> => {
    await vi.advanceTimersByTimeAsync(10);
    fixture.detectChanges();
};

/** A key the way a browser delivers it: unless the keydown is prevented, a printable key replaces the selection. */
const press = async (fixture: ComponentFixture<unknown>, key: string, keyCode: number = key.charCodeAt(0)) => {
    const input = fixture.nativeElement.ownerDocument.activeElement as HTMLInputElement;
    const printable = key.length === 1;

    if (!dispatchKeyboardEvent(input, 'keydown', keyCode, undefined, key).defaultPrevented && printable) {
        input.setRangeText(key, input.selectionStart!, input.selectionEnd!, 'end');
        dispatchFakeEvent(input, 'input');
    }

    await settle(fixture);
};

const type = async (fixture: ComponentFixture<unknown>, text: string): Promise<void> => {
    for (const key of text) await press(fixture, key);
};

/** Moves the focus out of the datetime, as a click elsewhere on the page does. */
const leave = async (fixture: ComponentFixture<unknown>): Promise<void> => {
    const input = fixture.nativeElement.ownerDocument.activeElement as HTMLInputElement;

    input.blur();
    await settle(fixture);
};

const paste = async (fixture: ComponentFixture<unknown>, input: HTMLInputElement, text: string): Promise<Event> => {
    const event = new Event('paste', { bubbles: true, cancelable: true });

    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    input.dispatchEvent(event);
    await settle(fixture);

    return event;
};

const drop = async (fixture: ComponentFixture<unknown>, input: HTMLInputElement, text: string): Promise<Event> => {
    const event = new Event('drop', { bubbles: true, cancelable: true });

    Object.defineProperty(event, 'dataTransfer', { value: { getData: () => text } });
    input.dispatchEvent(event);
    await settle(fixture);

    return event;
};

@Component({
    selector: 'test-app',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqDatepickerModule, KbqDatetime, KbqLuxonDateModule],
    template: `
        <kbq-form-field>
            <kbq-label>Start</kbq-label>
            <kbq-datetime #datetime [formControl]="control" [min]="min()" [max]="max()" [format]="format()" />
            <kbq-datepicker-toggle-icon kbqSuffix [for]="datetime.datepicker()" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly control = new FormControl<DateTime | null>(null);
    readonly min = signal<DateTime | null>(null);
    readonly max = signal<DateTime | null>(null);
    readonly format = signal(TimeFormats.HHmm);
}

@Component({
    selector: 'test-ng-model',
    // Through the module: its re-exports are what an NgModule consumer builds the form field from.
    imports: [FormsModule, KbqDatetimeModule, KbqLuxonDateModule],
    template: `
        <kbq-form-field>
            <kbq-datetime required aria-label="Start" [(ngModel)]="value" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestNgModel {
    readonly value = signal<DateTime | null>(null);
}

describe('KbqDatetime', () => {
    let fixture: ComponentFixture<TestApp>;
    let control: FormControl<DateTime | null>;

    const value = (): string | null => control.value?.toFormat(ISO) ?? null;
    const datetime = (): KbqDatetime<DateTime> =>
        fixture.debugElement.query(By.directive(KbqDatetime)).componentInstance;

    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

        fixture = createComponent(TestApp);
        control = fixture.componentInstance.control;
    });

    afterEach(() => vi.useRealTimers());

    describe('rendering', () => {
        it('should render a date and a time input named from the locale', () => {
            expect(getDateInput(fixture).getAttribute('aria-label')).toBe('Дата');
            expect(getTimeInput(fixture).getAttribute('aria-label')).toBe('Время');
        });

        it('should be a group named by the label of the form field', () => {
            const host = getHost(fixture);
            const label = getFormField(fixture).querySelector('.kbq-form-field__label')!;

            expect(host.getAttribute('role')).toBe('group');
            expect(host.getAttribute('aria-labelledby')).toBe(label.id);
            expect(label.tagName).toBe('SPAN');
        });

        it('should mark the form field with its control type', () => {
            expect(getFormField(fixture).classList).toContain('kbq-form-field-type-datetime');
        });

        it('should render the value of the form control in both parts', async () => {
            control.setValue(DateTime.fromISO('2026-11-11T20:20:35'));
            await settle(fixture);

            expect(getDateInput(fixture).value).toBe('11.11.2026');
            expect(getTimeInput(fixture).value).toBe('20:20');
            expect(datetime().empty()).toBe(false);
        });

        it('should render seconds in the full time format', async () => {
            fixture.componentInstance.format.set(TimeFormats.HHmmss);
            control.setValue(DateTime.fromISO('2026-11-11T20:20:35'));
            await settle(fixture);

            expect(getTimeInput(fixture).value).toBe('20:20:35');
            expect(getHost(fixture).classList).toContain('kbq-datetime_seconds');
        });

        it('should clear both parts when the form control is reset', async () => {
            control.setValue(DateTime.fromISO('2026-11-11T20:20:35'));
            await settle(fixture);

            control.reset();
            await settle(fixture);

            expect(getDateInput(fixture).value).toBe('');
            expect(getTimeInput(fixture).value).toBe('');
            expect(datetime().empty()).toBe(true);
        });

        it('should disable both parts with the form control', async () => {
            control.disable();
            await settle(fixture);

            expect(getDateInput(fixture).disabled).toBe(true);
            expect(getTimeInput(fixture).disabled).toBe(true);
            expect(getHost(fixture).classList).toContain('kbq-disabled');

            control.enable();
            await settle(fixture);

            expect(getDateInput(fixture).disabled).toBe(false);
            expect(getTimeInput(fixture).disabled).toBe(false);
        });

        it('should hand the calendar of the date part to the toggle', () => {
            const toggle = fixture.nativeElement.querySelector('kbq-datepicker-toggle-icon');

            expect(toggle.getAttribute('aria-expanded')).toBe('false');

            datetime().open();
            fixture.detectChanges();

            expect(toggle.getAttribute('aria-expanded')).toBe('true');

            datetime().close();
        });
    });

    describe('value', () => {
        it('should take midnight for a date typed into an empty field', async () => {
            getDateInput(fixture).focus();
            await type(fixture, '11112026');

            expect(getDateInput(fixture).value).toBe('11.11.2026');
            expect(getTimeInput(fixture).value).toBe('00:00');
            expect(value()).toBe('2026-11-11T00:00:00.000');
        });

        it('should keep the date when the time is typed', async () => {
            getDateInput(fixture).focus();
            await type(fixture, '11112026');
            await type(fixture, '2035');

            expect(getDateInput(fixture).value).toBe('11.11.2026');
            expect(getTimeInput(fixture).value).toBe('20:35');
            expect(value()).toBe('2026-11-11T20:35:00.000');
        });

        it('should keep the time when the date is changed', async () => {
            control.setValue(DateTime.fromISO('2026-11-11T20:20:35.250'));
            await settle(fixture);

            getDateInput(fixture).focus();
            getDateInput(fixture).setSelectionRange(0, 2);
            await press(fixture, 'ArrowUp', UP_ARROW);

            expect(value()).toBe('2026-11-12T20:20:35.250');
            expect(getTimeInput(fixture).value).toBe('20:20');
        });

        it('should keep the date when the time is stepped', async () => {
            control.setValue(DateTime.fromISO('2026-11-11T20:20:35.250'));
            await settle(fixture);

            getTimeInput(fixture).focus();
            getTimeInput(fixture).setSelectionRange(0, 2);
            await press(fixture, 'ArrowUp', UP_ARROW);

            expect(value()).toBe('2026-11-11T21:20:35.250');
            expect(getDateInput(fixture).value).toBe('11.11.2026');
        });

        it('should stay null while only the time is filled in, and take that time once the date is typed', async () => {
            getTimeInput(fixture).focus();
            await type(fixture, '2035');

            expect(getTimeInput(fixture).value).toBe('20:35');
            expect(getDateInput(fixture).value).toBe('');
            expect(control.value).toBeNull();

            getDateInput(fixture).focus();
            await type(fixture, '11112026');

            expect(value()).toBe('2026-11-11T20:35:00.000');
        });

        it('should become null once the field is left with the date erased', async () => {
            control.setValue(DateTime.fromISO('2026-11-11T20:20'));
            await settle(fixture);

            const dateInput = getDateInput(fixture);

            dateInput.focus();
            dateInput.value = '';
            await leave(fixture);

            expect(control.value).toBeNull();
            expect(getTimeInput(fixture).value).toBe('20:20');
            expect(control.errors).toEqual({ kbqDatetimeParse: { text: '20:20' } });
        });

        it('should keep the time when a day is picked in the calendar', async () => {
            control.setValue(DateTime.fromISO('2026-11-11T20:20:35'));
            await settle(fixture);

            datetime().datepicker().select(DateTime.fromISO('2026-11-15'));
            await settle(fixture);

            expect(value()).toBe('2026-11-15T20:20:35.000');
            expect(getDateInput(fixture).value).toBe('15.11.2026');
        });

        it('should take midnight for a day picked in the calendar of an empty field', async () => {
            datetime().datepicker().select(DateTime.fromISO('2026-11-15'));
            await settle(fixture);

            expect(value()).toBe('2026-11-15T00:00:00.000');
            expect(getTimeInput(fixture).value).toBe('00:00');
        });

        it('should not report a value the form control wrote', async () => {
            const changes: unknown[] = [];

            control.valueChanges.subscribe((change) => changes.push(change));
            control.setValue(DateTime.fromISO('2026-11-11T20:20'));
            await settle(fixture);

            expect(changes).toHaveLength(1);
        });
    });

    describe('keyboard', () => {
        beforeEach(async () => {
            control.setValue(DateTime.fromISO('2026-11-11T20:20'));
            await settle(fixture);
        });

        it('should move from the last part of the date to the hours on the right arrow', async () => {
            const dateInput = getDateInput(fixture);

            dateInput.focus();
            dateInput.setSelectionRange(6, 10);
            await press(fixture, 'ArrowRight', RIGHT_ARROW);

            const timeInput = getTimeInput(fixture);

            expect(document.activeElement).toBe(timeInput);
            expect([timeInput.selectionStart, timeInput.selectionEnd]).toEqual([0, 2]);
        });

        it('should leave the right arrow to the date input before its last part', async () => {
            const dateInput = getDateInput(fixture);

            dateInput.focus();
            dateInput.setSelectionRange(0, 2);
            await press(fixture, 'ArrowRight', RIGHT_ARROW);

            expect(document.activeElement).toBe(dateInput);
            expect([dateInput.selectionStart, dateInput.selectionEnd]).toEqual([3, 5]);
        });

        it('should move from the hours to the last part of the date on the left arrow', async () => {
            const timeInput = getTimeInput(fixture);

            timeInput.focus();
            timeInput.setSelectionRange(0, 2);
            await press(fixture, 'ArrowLeft', LEFT_ARROW);

            const dateInput = getDateInput(fixture);

            expect(document.activeElement).toBe(dateInput);
            expect([dateInput.selectionStart, dateInput.selectionEnd]).toEqual([6, 10]);
        });

        it('should move to the date on Backspace in an empty time', async () => {
            control.reset();
            await settle(fixture);

            getTimeInput(fixture).focus();
            await press(fixture, 'Backspace', BACKSPACE);

            expect(document.activeElement).toBe(getDateInput(fixture));
        });

        it('should move to the hours once the last part of the date is typed', async () => {
            const focusVia = vi.spyOn(TestBed.inject(FocusMonitor), 'focusVia');
            const dateInput = getDateInput(fixture);

            dateInput.focus();
            dateInput.setSelectionRange(6, 10);
            await type(fixture, '202');

            expect(document.activeElement).toBe(dateInput);

            await press(fixture, '7');

            expect(document.activeElement).toBe(getTimeInput(fixture));
            expect(value()).toBe('2027-11-11T20:20:00.000');
            // The focus moves on a timer, where only `focusVia` keeps it a keyboard one.
            expect(focusVia).toHaveBeenCalledWith(getTimeInput(fixture), expect.anything());
        });

        it('should move to the hours when the year typed is the one already there', async () => {
            const dateInput = getDateInput(fixture);

            dateInput.focus();
            dateInput.setSelectionRange(6, 10);
            await type(fixture, '2026');

            expect(document.activeElement).toBe(getTimeInput(fixture));
        });
    });

    describe('paste', () => {
        it('should split a date and time pasted into the date part', async () => {
            const event = await paste(fixture, getDateInput(fixture), '15.11.2026 14:45');

            expect(event.defaultPrevented).toBe(true);
            expect(getDateInput(fixture).value).toBe('15.11.2026');
            expect(getTimeInput(fixture).value).toBe('14:45');
            expect(value()).toBe('2026-11-15T14:45:00.000');
        });

        it('should split a date and time pasted into the time part, seconds included', async () => {
            fixture.componentInstance.format.set(TimeFormats.HHmmss);
            await settle(fixture);
            await paste(fixture, getTimeInput(fixture), '15.11.2026, 14:45:30');

            expect(getTimeInput(fixture).value).toBe('14:45:30');
            expect(value()).toBe('2026-11-15T14:45:30.000');
        });

        it('should leave a text that is not a date and time to the part it lands in', async () => {
            const event = await paste(fixture, getTimeInput(fixture), '14:45');

            expect(getTimeInput(fixture).value).toBe('14:45');
            expect(getDateInput(fixture).value).toBe('');
            expect(event.defaultPrevented).toBe(true);
            expect(control.value).toBeNull();
        });

        it('should not take a time that does not exist', async () => {
            await paste(fixture, getDateInput(fixture), '15.11.2026 25:00');

            expect(control.value).toBeNull();
        });

        it('should keep a text in another date format out of the field', async () => {
            control.setValue(DateTime.fromISO('2026-11-10T08:30'));
            await settle(fixture);

            const event = await paste(fixture, getDateInput(fixture), '2026-11-15T14:45');

            expect(event.defaultPrevented).toBe(true);
            expect(getDateInput(fixture).value).toBe('10.11.2026');
            expect(getTimeInput(fixture).value).toBe('08:30');
            expect(value()).toBe('2026-11-10T08:30:00.000');
        });

        it('should replace a half edited text with the value it was edited from', async () => {
            control.setValue(DateTime.fromISO('2026-11-10T08:30'));
            await settle(fixture);

            const dateInput = getDateInput(fixture);

            dateInput.focus();
            dateInput.value = '10.11.202';
            await paste(fixture, dateInput, '10.11.2026 08:30');

            expect(dateInput.value).toBe('10.11.2026');
        });

        it('should split a dropped date and time, focus the time part and mark the control touched', async () => {
            const event = await drop(fixture, getDateInput(fixture), '15.11.2026 14:45');

            expect(event.defaultPrevented).toBe(true);
            expect(getDateInput(fixture).value).toBe('15.11.2026');
            expect(getTimeInput(fixture).value).toBe('14:45');
            expect(value()).toBe('2026-11-15T14:45:00.000');
            expect(fixture.nativeElement.ownerDocument.activeElement).toBe(getTimeInput(fixture));
            expect(control.touched).toBe(true);
        });
    });

    describe('validation', () => {
        it('should report a value before the minimum', async () => {
            fixture.componentInstance.min.set(DateTime.fromISO('2026-11-10T09:00'));
            control.setValue(DateTime.fromISO('2026-11-10T08:59'));
            await settle(fixture);

            expect(control.errors?.kbqDatetimeMin.min.toFormat(ISO)).toBe('2026-11-10T09:00:00.000');
            expect(control.errors?.kbqDatetimeMin.actual.toFormat(ISO)).toBe('2026-11-10T08:59:00.000');

            control.setValue(DateTime.fromISO('2026-11-10T09:00'));

            expect(control.errors).toBeNull();
        });

        it('should report a value after the maximum', async () => {
            fixture.componentInstance.max.set(DateTime.fromISO('2026-11-20T18:00'));
            control.setValue(DateTime.fromISO('2026-11-20T18:01'));
            await settle(fixture);

            expect(control.errors?.kbqDatetimeMax.max.toFormat(ISO)).toBe('2026-11-20T18:00:00.000');
            expect(control.errors?.kbqDatetimeMax.actual.toFormat(ISO)).toBe('2026-11-20T18:01:00.000');
        });

        it('should revalidate when the bounds change', async () => {
            control.setValue(DateTime.fromISO('2026-11-10T08:59'));
            await settle(fixture);

            expect(control.errors).toBeNull();

            fixture.componentInstance.min.set(DateTime.fromISO('2026-11-10T09:00'));
            await settle(fixture);

            expect(control.hasError('kbqDatetimeMin')).toBe(true);
        });

        it('should report a half filled field once it is left, and not while it is typed in', async () => {
            getTimeInput(fixture).focus();
            await type(fixture, '2035');

            expect(control.errors).toBeNull();

            await leave(fixture);

            expect(control.errors).toEqual({ kbqDatetimeParse: { text: '20:35' } });

            getDateInput(fixture).focus();
            await settle(fixture);
            await type(fixture, '11112026');
            await leave(fixture);

            expect(control.errors).toBeNull();
        });

        it('should report a date that does not parse once the field is left', async () => {
            const dateInput = getDateInput(fixture);

            dateInput.focus();
            await type(fixture, '1');
            await leave(fixture);

            expect(control.hasError('kbqDatetimeParse')).toBe(true);
        });

        it('should drop the value when a part is left with a text that got there without a key', async () => {
            control.setValue(DateTime.fromISO('2026-11-10T08:30'));
            await settle(fixture);

            const dateInput = getDateInput(fixture);

            dateInput.focus();
            dateInput.value = 'tomorrow';
            await leave(fixture);

            expect(control.value).toBeNull();
            expect(control.errors).toEqual({ kbqDatetimeParse: { text: 'tomorrow 08:30' } });
        });

        it('should report the same incomplete text again after the form control is reset', async () => {
            getDateInput(fixture).focus();
            await type(fixture, '1');
            await leave(fixture);

            expect(control.hasError('kbqDatetimeParse')).toBe(true);

            control.reset();
            await settle(fixture);

            expect(control.errors).toBeNull();

            getDateInput(fixture).focus();
            await settle(fixture);
            await type(fixture, '1');
            await leave(fixture);

            expect(control.hasError('kbqDatetimeParse')).toBe(true);
        });

        it('should paint the form field invalid once the control is touched', async () => {
            control.addValidators(Validators.required);
            control.updateValueAndValidity();
            await settle(fixture);

            expect(getFormField(fixture).classList).not.toContain('kbq-form-field_invalid');

            getDateInput(fixture).focus();
            await leave(fixture);

            expect(control.touched).toBe(true);
            expect(datetime().errorState()).toBe(true);
            expect(getFormField(fixture).classList).toContain('kbq-form-field_invalid');
        });
    });

    describe('focus', () => {
        it('should stay untouched while the focus moves between the parts', async () => {
            getDateInput(fixture).focus();
            await settle(fixture);
            getTimeInput(fixture).focus();
            await settle(fixture);

            expect(datetime().focused()).toBe(true);
            expect(control.touched).toBe(false);

            await leave(fixture);

            expect(datetime().focused()).toBe(false);
            expect(control.touched).toBe(true);
        });

        it('should focus the date part of an empty field and the time part once only the date is there', async () => {
            datetime().focus();

            expect(document.activeElement).toBe(getDateInput(fixture));

            control.setValue(DateTime.fromISO('2026-11-11T20:20'));
            await settle(fixture);

            const timeInput = getTimeInput(fixture);

            timeInput.focus();
            timeInput.value = '';
            dispatchKeyboardEvent(timeInput, 'keydown', BACKSPACE);
            await settle(fixture);
            await leave(fixture);

            datetime().focus();

            expect(document.activeElement).toBe(timeInput);
        });

        it('should take the focus on a click on the label of the form field', () => {
            getFormField(fixture).querySelector<HTMLElement>('.kbq-form-field__label')!.click();

            expect(document.activeElement).toBe(getDateInput(fixture));
        });

        it('should hand the focus to the hours after a day is picked for an empty time', async () => {
            getDateInput(fixture).focus();
            datetime().open();
            await settle(fixture);

            datetime().datepicker().select(DateTime.fromISO('2026-11-15'));
            datetime().close();
            await settle(fixture);

            const timeInput = getTimeInput(fixture);

            expect(document.activeElement).toBe(timeInput);
            expect([timeInput.selectionStart, timeInput.selectionEnd]).toEqual([0, 2]);
        });
    });
});

describe('KbqDatetime with a date format that ends with the day', () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }));

    afterEach(() => vi.useRealTimers());

    it('should move to the hours once the day is typed', async () => {
        const fixture = createComponent(TestApp);

        // From the component: the date module it imports provides the locale service closer than the test bed.
        fixture.debugElement.query(By.directive(KbqDatetime)).injector.get(KBQ_LOCALE_SERVICE).setLocale('en-US');
        fixture.componentInstance.control.setValue(DateTime.fromISO('2026-11-11T20:20'));
        await settle(fixture);

        const dateInput = getDateInput(fixture);

        expect(dateInput.value).toBe('2026-11-11');

        dateInput.focus();
        dateInput.setSelectionRange(8, 10);
        await press(fixture, '1');

        expect(document.activeElement).toBe(dateInput);

        await press(fixture, '5');

        expect(dateInput.value).toBe('2026-11-15');
        expect(document.activeElement).toBe(getTimeInput(fixture));
    });
});

describe('KbqDatetime with ngModel', () => {
    it('should write the model and report what is typed', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

        const fixture = createComponent(TestNgModel);

        fixture.componentInstance.value.set(DateTime.fromISO('2026-11-11T20:20'));
        fixture.detectChanges();
        await Promise.resolve();
        await settle(fixture);

        expect(getDateInput(fixture).value).toBe('11.11.2026');
        expect(getDateInput(fixture).required).toBe(true);
        expect(getTimeInput(fixture).required).toBe(true);

        const timeInput = getTimeInput(fixture);

        timeInput.focus();
        timeInput.setSelectionRange(0, 2);
        await press(fixture, 'ArrowUp', UP_ARROW);

        expect(fixture.componentInstance.value()?.toFormat(ISO)).toBe('2026-11-11T21:20:00.000');

        vi.useRealTimers();
    });

    it('should have no accessibility violations', async () => {
        const fixture = createComponent(TestApp);

        await fixture.whenStable();

        await expect(fixture.nativeElement).toHaveNoViolations();
    });
});
