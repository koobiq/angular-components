import { Component, DebugElement, Inject, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, NgModel, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DOWN_ARROW, ONE, SPACE, TWO, UP_ARROW } from '@koobiq/cdk/keycodes';
import { createKeyboardEvent, dispatchEvent, dispatchFakeEvent } from '@koobiq/cdk/testing';
import { DateAdapter, KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { DateTime } from 'luxon';
import {
    DEFAULT_TIME_FORMAT,
    KbqTimepicker,
    KbqTimepickerModule,
    TIMEFORMAT_PLACEHOLDERS,
    TimeFormatToLocaleKeys,
    TimeFormats
} from './index';

@Component({
    selector: 'test-app',
    template: `
        <kbq-form-field>
            <i kbqPrefix kbq-icon="kbq-clock_16"></i>
            <input
                #ngModel="ngModel"
                [(ngModel)]="timeValue"
                [format]="timeFormat"
                [min]="minTime"
                [max]="maxTime"
                [disabled]="isDisabled"
                kbqTimepicker
            />
        </kbq-form-field>
    `
})
class TestApp {
    @ViewChild('ngModel') ngModel: NgModel;

    timeFormat: string;
    minTime: string;
    maxTime: string;
    timeValue: DateTime;
    isDisabled: boolean;

    constructor(public adapter: DateAdapter<DateTime>) {
        this.timeValue = adapter.createDateTime(1970, 1, 1, 12, 18, 28, 100);
    }
}

describe('KbqTimepicker', () => {
    let fixture: ComponentFixture<TestApp>;
    let testComponent: TestApp;
    let inputElementDebug;
    let adapter;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                KbqFormFieldModule,
                KbqTimepickerModule,
                KbqIconModule,
                KbqLuxonDateModule
            ],
            declarations: [TestApp]
        }).compileComponents();

        fixture = TestBed.createComponent(TestApp);
        testComponent = fixture.debugElement.componentInstance;
        inputElementDebug = fixture.debugElement.query(By.directive(KbqTimepicker));
        adapter = testComponent.adapter;

        fixture.detectChanges();
    });

    describe('Core attributes support', () => {
        it('Timepicker disabled state switching on/off', () => {
            testComponent.isDisabled = true;
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.disabled).toBe(true);

            testComponent.isDisabled = false;
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.disabled).toBe(false);
        });

        it('Placeholder set on default timeFormat', () => {
            fixture.detectChanges();
            expect(inputElementDebug.nativeElement.placeholder).toBe('чч:мм');
        });

        it('Correct placeholder set for non-default time format', () => {
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.placeholder).toBe('чч:мм:сс');
        });

        it('should save date part of model when time is changed', () => {
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();

            const originDateTime = testComponent.timeValue;

            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '10:10:10'
                }
            });

            fixture.detectChanges();

            expect(testComponent.adapter.getYear(testComponent.timeValue as DateTime)).toEqual(
                testComponent.adapter.getYear(originDateTime)
            );

            expect(testComponent.adapter.getMonth(testComponent.timeValue as DateTime)).toEqual(
                testComponent.adapter.getMonth(originDateTime)
            );

            expect(testComponent.adapter.getDate(testComponent.timeValue as DateTime)).toEqual(
                testComponent.adapter.getDate(originDateTime)
            );

            expect(testComponent.adapter.getHours(testComponent.timeValue as DateTime)).toEqual(10);

            expect(testComponent.adapter.getMinutes(testComponent.timeValue as DateTime)).toEqual(10);

            expect(testComponent.adapter.getSeconds(testComponent.timeValue as DateTime)).toEqual(10);
        });
    });

    describe('Timerange validation', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            testComponent = fixture.debugElement.componentInstance;
            inputElementDebug = fixture.debugElement.query(By.directive(KbqTimepicker));

            testComponent.timeValue = adapter.createDateTime(1970, 1, 11, 12, 18, 28);
            fixture.detectChanges();
        });

        it('Should accept simple time set', () => {
            expect(inputElementDebug.nativeElement.classList.contains('ng-valid')).toBe(true);
        });

        it('Should invalidate time lower then min-time', fakeAsync(() => {
            testComponent.minTime = adapter.createDateTime(1970, 1, 11, 13, 59, 0);
            fixture.detectChanges();
            tick(1);
            expect(inputElementDebug.nativeElement.classList.contains('ng-invalid')).toBe(true);
        }));

        it('Should invalidate time higher then max-time', () => {
            testComponent.maxTime = adapter.createDateTime(1970, 1, 11, 11, 0, 0);
            fixture.detectChanges();
            expect(inputElementDebug.nativeElement.classList.contains('ng-invalid')).toBe(true);
        });
    });

    describe('Display time corresponding to timeformat', () => {
        it('Using HH:mm:ss', () => {
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('12:18:28');
        });

        it('Using HH:mm', () => {
            testComponent.timeFormat = 'HH:mm';
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('12:18');
        });

        it('Using default format', () => {
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('12:18');
        });

        it('Using unknown/error/unsupported format', () => {
            testComponent.timeFormat = 'Hourglass';
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('12:18');
        });

        it('When the format updates', fakeAsync(() => {
            testComponent.timeValue = adapter.createDateTime(1970, 1, 11, 0, 0, 0);
            fixture.detectChanges();
            tick();

            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();
            expect(inputElementDebug.nativeElement.value).toBe('00:00:00');

            testComponent.timeFormat = 'HH:mm';
            fixture.detectChanges();
            expect(inputElementDebug.nativeElement.value).toBe('00:00');
        }));
    });

    describe('Convert user input', () => {
        it('Convert input, format HH:mm:ss', fakeAsync(() => {
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('12:18:28');

            inputElementDebug.nativeElement.value = '18:08:08';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(testComponent.timeValue.toString()).toContain('18:08:08');
        }));

        it('Convert input as direct input (onInput), format HH:mm', fakeAsync(() => {
            testComponent.timeFormat = 'HH:mm';
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('12:18');

            inputElementDebug.nativeElement.value = '18:09';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(testComponent.timeValue.toString()).toContain('18:09');
        }));

        it('Should run validation on blur', () => {
            expect(testComponent.ngModel.valid).toBeTruthy();
            expect(inputElementDebug.nativeElement.value).toBe('12:18');

            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => 'string'
                }
            });

            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('string');

            inputElementDebug.triggerEventHandler('blur', { target: inputElementDebug.nativeElement });

            expect(testComponent.ngModel.valid).toBeFalsy();
        });

        it('Should not change model on blur', () => {
            const date = testComponent.adapter.toIso8601(testComponent.timeValue);

            expect(testComponent.adapter.toIso8601(testComponent.ngModel.value)).toBe(date);

            inputElementDebug.triggerEventHandler('blur', { target: inputElementDebug.nativeElement });

            fixture.detectChanges();

            expect(testComponent.adapter.toIso8601(testComponent.ngModel.value)).toBe(date);
        });

        it('Add lead zeros on blur', () => {
            expect(testComponent.ngModel.valid).toBeTruthy();
            inputElementDebug.nativeElement.value = '1';

            inputElementDebug.triggerEventHandler('blur', { target: inputElementDebug.nativeElement });

            expect(inputElementDebug.nativeElement.value).toBe('01:00');
        });

        it('Convert user input (add lead zero)', fakeAsync(() => {
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();

            inputElementDebug.nativeElement.value = '1*';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toEqual('01:00:00');

            inputElementDebug.nativeElement.value = '01:1*';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toEqual('01:01:00');

            inputElementDebug.nativeElement.value = '01:01:1*';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toEqual('01:01:01');

            inputElementDebug.nativeElement.value = '01:1*:10';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toEqual('01:01:10');

            inputElementDebug.nativeElement.value = '1*:10:10';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toEqual('01:10:10');
        }));
    });

    describe('Paste value from clipboard', () => {
        it('Paste value from clipboard', () => {
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();

            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '19:01:08'
                }
            });
            fixture.detectChanges();
            expect(testComponent.timeValue.toString()).toContain('19:01:08');
        });

        it('Paste 12h value from clipboard', () => {
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '07:15 pm'
                }
            });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('19:15:00');
        });

        it('Paste am/pm from clipboard: 1:3 am', () => {
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '1:3 am'
                }
            });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('01:03:00');
        });

        it('Paste am/pm from clipboard: 01:3 am', () => {
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '01:3 am'
                }
            });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('01:03:00');
        });

        it('Paste am/pm from clipboard: 1:30 am', () => {
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '1:30 am'
                }
            });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('01:30:00');
        });

        it('Paste am/pm from clipboard: 01:30 am', () => {
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '01:30 am'
                }
            });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('01:30:00');
        });

        it('Paste am/pm from clipboard: 10:3 am', () => {
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '10:3 am'
                }
            });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('10:03:00');
        });

        it('Paste am/pm from clipboard: 10:30 am', () => {
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '10:30 am'
                }
            });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('10:30:00');
        });

        it('Paste am/pm from clipboard: 10:30 Pm', () => {
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '10:30 pm'
                }
            });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('22:30:00');
        });

        it('Paste am/pm from clipboard: 12:3 aM', () => {
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '12:3 aM'
                }
            });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('00:03:00');
        });

        it('Paste am/pm from clipboard: 11:3 PM', () => {
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '11:3 PM'
                }
            });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('23:03:00');
        });

        it('Paste am/pm from clipboard: 11:3 a', () => {
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '11:3 a'
                }
            });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('11:03:00');
        });

        it('Paste am/pm from clipboard: 11:3 p', () => {
            inputElementDebug.triggerEventHandler('paste', {
                preventDefault: () => null,
                clipboardData: {
                    getData: () => '11:3 p'
                }
            });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('23:03:00');
        });
    });

    describe('Keyboard value control', () => {
        beforeEach(fakeAsync(() => {
            testComponent.timeValue = adapter.createDateTime(1970, 1, 11, 23, 0, 0);
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();
        }));

        it('Should ignore SPACE keyDown', fakeAsync(() => {
            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');

            const spaceEvent: KeyboardEvent = createKeyboardEvent('keydown', SPACE);
            dispatchEvent(inputElementDebug.nativeElement, spaceEvent);
            tick(1);

            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');
        }));

        it('Input hours above max', fakeAsync(() => {
            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');

            inputElementDebug.nativeElement.value = '24';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');
        }));

        it('Input minutes above max', fakeAsync(() => {
            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');

            inputElementDebug.nativeElement.value = '23:99';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toBe('23:59:00');
        }));

        it('Input seconds above max', fakeAsync(() => {
            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');

            inputElementDebug.nativeElement.value = '23:00:99';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toBe('23:00:59');
        }));

        it('Increase hours by ArrowUp key and cycle from max to min', fakeAsync(() => {
            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');

            inputElementDebug.nativeElement.selectionStart = 1;
            inputElementDebug.triggerEventHandler('keydown', { preventDefault: () => null, keyCode: UP_ARROW });

            tick(1);
            fixture.detectChanges();
            expect(inputElementDebug.nativeElement.value).toBe('00:00:00');
        }));

        it('Decrease minutes by ArrowDown key and cycle from min to max', fakeAsync(() => {
            inputElementDebug.nativeElement.selectionStart = 3;
            inputElementDebug.triggerEventHandler('keydown', { preventDefault: () => null, keyCode: DOWN_ARROW });
            tick(1);
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('23:59:00');
        }));

        it('Manual keyboard input digit-by-digit', () => {
            const inputNativeElement = inputElementDebug.nativeElement;
            inputNativeElement.selectionStart = 0;
            inputNativeElement.selectionEnd = 2;

            const key1PressEvent: KeyboardEvent = createKeyboardEvent('keydown', ONE);
            dispatchEvent(inputNativeElement, key1PressEvent);
            inputNativeElement.value = `1${inputNativeElement.value.substring(2)}`;
            inputNativeElement.selectionStart = 1;
            inputNativeElement.selectionEnd = 1;
            dispatchFakeEvent(inputNativeElement, 'input');
            fixture.detectChanges();

            expect(inputNativeElement.value).toBe('1:00:00');

            const key2PressEvent: KeyboardEvent = createKeyboardEvent('keydown', TWO);
            dispatchEvent(inputNativeElement, key2PressEvent);
            const inputStringBeforeInsertion = inputNativeElement.value.substring(0, 1);
            const inputStringAfterInsertion = inputNativeElement.value.substring(1);
            inputNativeElement.value = `${inputStringBeforeInsertion}2${inputStringAfterInsertion}`;
            inputNativeElement.selectionStart = 2;
            inputNativeElement.selectionEnd = 2;
            dispatchFakeEvent(inputNativeElement, 'input');
            fixture.detectChanges();

            expect(inputNativeElement.value).toBe('12:00:00');
        });
    });
});

@Component({
    selector: 'test-app',
    template: `
        <kbq-form-field>
            <i kbqPrefix kbq-icon="kbq-clock_16"></i>
            <input [format]="timeFormat" [formControl]="formControl" kbqTimepicker />
        </kbq-form-field>
    `
})
class TimePickerWithNullFormControlValue {
    formControl: UntypedFormControl = new UntypedFormControl();
    timeFormat: string;
}

describe('KbqTimepicker with null formControl value', () => {
    let fixture: ComponentFixture<TimePickerWithNullFormControlValue>;
    let testComponent: TimePickerWithNullFormControlValue;
    let inputElementDebug;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
                KbqFormFieldModule,
                KbqTimepickerModule,
                KbqIconModule,
                KbqLuxonDateModule
            ],
            declarations: [TimePickerWithNullFormControlValue]
        }).compileComponents();

        const mockedAdapter: DateAdapter<any> = TestBed.inject(DateAdapter);
        jest.spyOn(mockedAdapter, 'today').mockImplementation(() =>
            mockedAdapter.createDateTime(2020, 0, 1, 2, 3, 4, 5)
        );

        fixture = TestBed.createComponent(TimePickerWithNullFormControlValue);
        testComponent = fixture.debugElement.componentInstance;
        inputElementDebug = fixture.debugElement.query(By.directive(KbqTimepicker));

        fixture.detectChanges();
    });

    it('Paste value from clipboard when formControl value is null', () => {
        testComponent.timeFormat = 'HH:mm:ss';
        fixture.detectChanges();

        expect(testComponent.formControl.value).toBeNull();

        inputElementDebug.triggerEventHandler('paste', {
            preventDefault: () => null,
            clipboardData: {
                getData: () => '19:01:02'
            }
        });
        fixture.detectChanges();

        expect(testComponent.formControl.value.toString()).toContain('2020-01-01T19:01:02');
    });

    it('Create time from input when formControl value is null', fakeAsync(() => {
        testComponent.timeFormat = 'HH:mm';
        fixture.detectChanges();

        expect(testComponent.formControl.value).toBeNull();

        inputElementDebug.nativeElement.value = '18:09';
        dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
        tick(1);

        fixture.detectChanges();

        expect(testComponent.formControl.value.toString()).toContain('2020-01-01T18:09');
    }));
});

@Component({
    selector: 'test-app',
    template: `
        <kbq-form-field>
            <i kbqPrefix kbq-icon="kbq-clock_16"></i>
            <input [(ngModel)]="model" [format]="timeFormat" kbqTimepicker />
        </kbq-form-field>
    `
})
class TimePickerWithNullModelValue {
    timeFormat: string;
    model: any = null;
}

describe('KbqTimepicker with null model value', () => {
    let fixture: ComponentFixture<TimePickerWithNullModelValue>;
    let testComponent: TimePickerWithNullModelValue;
    let inputElementDebug;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                KbqFormFieldModule,
                KbqTimepickerModule,
                KbqIconModule,
                KbqLuxonDateModule
            ],
            declarations: [TimePickerWithNullModelValue]
        }).compileComponents();

        const mockedAdapter: DateAdapter<any> = TestBed.inject(DateAdapter);
        jest.spyOn(mockedAdapter, 'today').mockImplementation(() =>
            mockedAdapter.createDateTime(2020, 0, 1, 2, 3, 4, 5)
        );

        fixture = TestBed.createComponent(TimePickerWithNullModelValue);
        testComponent = fixture.debugElement.componentInstance;
        inputElementDebug = fixture.debugElement.query(By.directive(KbqTimepicker));

        fixture.detectChanges();
    });

    it('Paste value from clipboard when model value is null', () => {
        testComponent.timeFormat = 'HH:mm:ss';
        fixture.detectChanges();

        expect(testComponent.model).toBeNull();

        inputElementDebug.triggerEventHandler('paste', {
            preventDefault: () => null,
            clipboardData: {
                getData: () => '19:01:02'
            }
        });
        fixture.detectChanges();

        expect(testComponent.model.toString()).toContain('2020-01-01T19:01:02');
    });

    it('Create time from input when model value is null', fakeAsync(() => {
        testComponent.timeFormat = 'HH:mm';
        fixture.detectChanges();

        expect(testComponent.model).toBeNull();

        inputElementDebug.nativeElement.value = '18:09';
        dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
        tick(1);

        fixture.detectChanges();

        expect(testComponent.model.toString()).toContain('2020-01-01T18:09');
    }));
});

@Component({
    selector: 'test-app',
    template: `
        <kbq-form-field>
            <i kbqPrefix kbq-icon="kbq-clock_16"></i>
            <input [(ngModel)]="model" [format]="timeFormat" kbqTimepicker />
        </kbq-form-field>
    `
})
class TimepickerWithLocaleChange {
    timeFormat: TimeFormats;
    model: any = null;

    constructor(@Inject(KBQ_LOCALE_SERVICE) public localeService: KbqLocaleService) {}
}

describe('with Locale change', () => {
    let fixture: ComponentFixture<TimepickerWithLocaleChange>;
    let testComponent: TimepickerWithLocaleChange;
    let inputElementDebug: DebugElement;

    const getPlaceholderForCurrentLocale = (selectedFormat?: TimeFormats): string =>
        testComponent.localeService.current.timepicker.placeholder[
            TimeFormatToLocaleKeys[selectedFormat || DEFAULT_TIME_FORMAT]
        ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                KbqFormFieldModule,
                KbqTimepickerModule,
                KbqIconModule,
                KbqLuxonDateModule
            ],
            declarations: [TimepickerWithLocaleChange]
        }).compileComponents();

        fixture = TestBed.createComponent(TimepickerWithLocaleChange);
        testComponent = fixture.debugElement.componentInstance;
        inputElementDebug = fixture.debugElement.query(By.directive(KbqTimepicker));

        fixture.detectChanges();
    });

    it('should get placeholder from localeService', () => {
        expect(inputElementDebug.nativeElement.getAttribute('placeholder')).toBe(
            TIMEFORMAT_PLACEHOLDERS[DEFAULT_TIME_FORMAT]
        );
        expect(getPlaceholderForCurrentLocale()).toEqual(TIMEFORMAT_PLACEHOLDERS[DEFAULT_TIME_FORMAT]);
    });

    it('should update placeholder of nativeElement on locale change', () => {
        testComponent.localeService.setLocale('en-US');
        fixture.detectChanges();
        expect(inputElementDebug.nativeElement.getAttribute('placeholder')).toBe(getPlaceholderForCurrentLocale());
    });

    it('should apply localized format on format change', () => {
        const selectedFormat = TimeFormats.HHmmss;
        testComponent.timeFormat = selectedFormat;
        fixture.detectChanges();

        expect(getPlaceholderForCurrentLocale(selectedFormat)).toEqual(TIMEFORMAT_PLACEHOLDERS[selectedFormat]);
        expect(inputElementDebug.nativeElement.getAttribute('placeholder')).toBe(
            getPlaceholderForCurrentLocale(selectedFormat)
        );

        testComponent.localeService.setLocale('en-US');
        fixture.detectChanges();
        expect(inputElementDebug.nativeElement.getAttribute('placeholder')).toBe(
            getPlaceholderForCurrentLocale(selectedFormat)
        );
    });
});
