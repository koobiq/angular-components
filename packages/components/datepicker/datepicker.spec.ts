// tslint:disable:no-magic-numbers
// tslint:disable:no-unbound-method
// tslint:disable:no-typeof-undefined
// tslint:disable:no-empty

import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, FactoryProvider, Type, ValueProvider, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, inject } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KBQ_LUXON_DATE_FORMATS, KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DOWN_ARROW, ENTER, ESCAPE, ONE, SPACE, UP_ARROW } from '@koobiq/cdk/keycodes';
import {
    createKeyboardEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent
} from '@koobiq/cdk/testing';
import { DateAdapter, KBQ_DATE_FORMATS, KBQ_DATE_LOCALE } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { DateTime } from 'luxon';
import { KbqInputModule } from '../input/index';
import { KbqDatepickerInput, KbqDatepickerInputEvent } from './datepicker-input.directive';
import { KbqDatepickerToggle } from './datepicker-toggle.component';
import { KbqDatepicker } from './datepicker.component';
import { KbqDatepickerIntl, KbqDatepickerModule } from './index';

describe('KbqDatepicker', () => {
    // Creates a test component fixture.
    function createComponent(
        component: Type<any>,
        imports: Type<any>[] = [],
        providers: (FactoryProvider | ValueProvider)[] = [],
        entryComponents: Type<any>[] = []
    ): ComponentFixture<any> {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                KbqDatepickerModule,
                KbqFormFieldModule,
                KbqInputModule,
                NoopAnimationsModule,
                ReactiveFormsModule,
                ...imports
            ],
            providers: [
                { provide: KBQ_DATE_FORMATS, useValue: KBQ_LUXON_DATE_FORMATS },
                ...providers
            ],
            declarations: [component, ...entryComponents]
        });

        TestBed.overrideModule(BrowserDynamicTestingModule, {}).compileComponents();

        return TestBed.createComponent(component);
    }

    afterEach(inject([OverlayContainer], (container: OverlayContainer) => {
        container.ngOnDestroy();
    }));

    describe('with KbqLuxonDateModule', () => {
        describe('standard datepicker', () => {
            let fixture: ComponentFixture<StandardDatepicker>;
            let testComponent: StandardDatepicker;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(StandardDatepicker, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            }));

            afterEach(fakeAsync(() => {
                testComponent.datepicker.close();
                fixture.detectChanges();
                flush();
            }));

            it('should focus input after close', fakeAsync(() => {
                const input = testComponent.datepicker.datepickerInput.elementRef.nativeElement;
                input.focus();

                testComponent.datepicker.open();
                fixture.detectChanges();

                testComponent.datepicker.close(true);
                fixture.detectChanges();

                flush();

                expect(document.activeElement).toBe(input);
            }));

            it('open non-touch should open popup', () => {
                expect(document.querySelector('.cdk-overlay-pane.kbq-datepicker__popup')).toBeNull();

                testComponent.datepicker.open();
                fixture.detectChanges();

                expect(document.querySelector('.cdk-overlay-pane.kbq-datepicker__popup')).not.toBeNull();
            });

            it('should open datepicker if opened input is set to true', fakeAsync(() => {
                testComponent.opened = true;
                fixture.detectChanges();
                flush();

                expect(document.querySelector('.kbq-datepicker__content')).not.toBeNull();

                testComponent.opened = false;
                fixture.detectChanges();
                flush();

                expect(document.querySelector('.kbq-datepicker__content')).toBeNull();
            }));

            it('open in disabled mode should not open the calendar', () => {
                testComponent.disabled = true;
                fixture.detectChanges();

                expect(document.querySelector('.cdk-overlay-pane')).toBeNull();

                testComponent.datepicker.open();
                fixture.detectChanges();

                expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
            });

            it('disabled datepicker input should open the calendar if datepicker is enabled', () => {
                testComponent.datepicker.disabled = false;
                testComponent.datepickerInput.disabled = true;
                fixture.detectChanges();

                expect(document.querySelector('.cdk-overlay-pane')).toBeNull();

                testComponent.datepicker.open();
                fixture.detectChanges();

                expect(document.querySelector('.cdk-overlay-pane')).not.toBeNull();
            });

            it('close should close popup', fakeAsync(() => {
                testComponent.datepicker.open();
                fixture.detectChanges();
                flush();

                const popup = document.querySelector('.cdk-overlay-pane')!;
                expect(popup).not.toBeNull();
                expect(parseInt(getComputedStyle(popup).height as string)).not.toBe(0);

                testComponent.datepicker.close();
                fixture.detectChanges();
                flush();

                expect(getComputedStyle(popup).height).toBe('');
            }));

            it('should close the popup when pressing ESCAPE', fakeAsync(() => {
                testComponent.datepicker.open();
                fixture.detectChanges();

                expect(testComponent.datepicker.opened).withContext('Expected datepicker to be open.').toBe(true);

                dispatchKeyboardEvent(fixture.nativeElement.querySelector('input'), 'keydown', ESCAPE);
                fixture.detectChanges();
                flush();

                expect(testComponent.datepicker.opened).withContext('Expected datepicker to be closed.').toBe(false);
            }));

            it('clicking the currently selected date should close the calendar without firing selectedChanged', fakeAsync(() => {
                const selectedChangedSpy = spyOn(testComponent.datepicker.selectedChanged, 'next').and.callThrough();

                for (let changeCount = 1; changeCount < 3; changeCount++) {
                    const currentDay = changeCount;
                    testComponent.datepicker.open();
                    fixture.detectChanges();

                    expect(document.querySelector('kbq-datepicker__content')).not.toBeNull();

                    if (currentDay === 1) {
                        expect(testComponent.datepickerInput.value?.toISO()).toEqual(
                            DateTime.local(2020, 1, currentDay).toISO()
                        );
                    }

                    if (currentDay === 2) {
                        expect(testComponent.datepickerInput.value?.toISO()).toEqual(
                            DateTime.local(2020, 1, currentDay).toISO()
                        );
                    }

                    const cells = document.querySelectorAll('.kbq-calendar__body-cell');
                    dispatchMouseEvent(cells[1], 'click');
                    fixture.detectChanges();
                    flush();
                }

                expect(selectedChangedSpy.calls.count()).toEqual(1);

                expect(testComponent.datepickerInput.value?.toISO()).toEqual(DateTime.local(2020, 1, 2).toISO());
            }));

            it('pressing enter on the currently selected date should close the calendar without firing selectedChanged', () => {
                const selectedChangedSpy = spyOn(testComponent.datepicker.selectedChanged, 'next').and.callThrough();

                testComponent.datepicker.open();
                fixture.detectChanges();

                const calendarBodyEl = document.querySelector('.kbq-calendar__body') as HTMLElement;
                expect(calendarBodyEl).not.toBeNull();
                expect(testComponent.datepickerInput.value?.toISO()).toEqual(DateTime.local(2020, 1, 1).toISO());

                dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
                fixture.detectChanges();

                fixture.whenStable().then(() => {
                    expect(selectedChangedSpy.calls.count()).toEqual(0);
                    expect(testComponent.datepickerInput.value?.toISO()).toEqual(DateTime.local(2020, 1, 1).toISO());
                });
            });

            it('startAt should fallback to input value', () => {
                expect(testComponent.datepicker.startAt?.toISO()).toEqual(DateTime.local(2020, 1, 1).toISO());
            });

            it('should not throw when given wrong data type', () => {
                testComponent.date = '1/1/2017' as any;

                expect(() => fixture.detectChanges()).not.toThrow();
            });

            it('should clear out the backdrop subscriptions on close', fakeAsync(() => {
                for (let i = 0; i < 3; i++) {
                    testComponent.datepicker.open();
                    fixture.detectChanges();

                    testComponent.datepicker.close();
                    fixture.detectChanges();
                }

                testComponent.datepicker.open();
                fixture.detectChanges();

                const spy = jasmine.createSpy('close event spy');
                const subscription = testComponent.datepicker.closedStream.subscribe(spy);

                document.body.click();
                fixture.detectChanges();
                flush();

                expect(spy).toHaveBeenCalledTimes(1);
                expect(testComponent.datepicker.opened).toBe(false);
                subscription.unsubscribe();
            }));

            it('should reset the datepicker when it is closed externally', fakeAsync(
                inject([OverlayContainer], (oldOverlayContainer: OverlayContainer) => {
                    // Destroy the old container manually since resetting the testing module won't do it.
                    oldOverlayContainer.ngOnDestroy();
                    TestBed.resetTestingModule();

                    // Stub out a `CloseScrollStrategy` so we can trigger a detachment via the `OverlayRef`.
                    fixture = createComponent(StandardDatepicker, [KbqLuxonDateModule]);

                    fixture.detectChanges();
                    testComponent = fixture.componentInstance;

                    testComponent.datepicker.open();
                    fixture.detectChanges();

                    expect(testComponent.datepicker.opened).toBe(true);

                    document.body.click();
                    flush();
                    fixture.detectChanges();

                    expect(testComponent.datepicker.opened).toBe(false);
                })
            ));

            it('should close the datepicker using ALT + UP_ARROW', fakeAsync(() => {
                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                testComponent.datepicker.open();
                fixture.detectChanges();
                flush();

                expect(testComponent.datepicker.opened).toBe(true);

                const event = createKeyboardEvent('keydown', UP_ARROW);
                Object.defineProperty(event, 'altKey', { get: () => true });

                dispatchEvent(inputEl, event);
                fixture.detectChanges();
                flush();

                expect(testComponent.datepicker.opened).toBe(false);
                expect(event.defaultPrevented).toBe(true);
            }));

            it('should open the datepicker using ALT + DOWN_ARROW', fakeAsync(() => {
                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                expect(testComponent.datepicker.opened).toBe(false);

                const event = createKeyboardEvent('keydown', DOWN_ARROW);
                Object.defineProperty(event, 'altKey', { get: () => true });

                dispatchEvent(inputEl, event);
                fixture.detectChanges();
                flush();

                expect(testComponent.datepicker.opened).toBe(true);
                expect(event.defaultPrevented).toBe(true);
            }));

            it('should not open for ALT + DOWN_ARROW on readonly input', fakeAsync(() => {
                const input = fixture.nativeElement.querySelector('input');

                expect(testComponent.datepicker.opened).toBe(false);

                input.setAttribute('readonly', 'true');

                const event = createKeyboardEvent('keydown', DOWN_ARROW);
                Object.defineProperty(event, 'altKey', { get: () => true });

                dispatchEvent(input, event);
                fixture.detectChanges();
                flush();

                expect(testComponent.datepicker.opened).toBe(false);
                expect(event.defaultPrevented).toBe(false);
            }));
        });

        describe('datepicker with too many inputs', () => {
            it('should throw when multiple inputs registered', fakeAsync(() => {
                const fixture = createComponent(MultiInputDatepicker, [KbqLuxonDateModule]);
                expect(() => fixture.detectChanges()).toThrow();
            }));
        });

        describe('datepicker that is assigned to input at a later point', () => {
            it('should not throw on ALT + DOWN_ARROW for input without datepicker', fakeAsync(() => {
                const fixture = createComponent(DelayedDatepicker, [KbqLuxonDateModule]);
                fixture.detectChanges();

                expect(() => {
                    const event = createKeyboardEvent('keydown', DOWN_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });
                    dispatchEvent(fixture.nativeElement.querySelector('input'), event);
                    fixture.detectChanges();
                    flush();
                }).not.toThrow();
            }));

            it('should handle value changes when a datepicker is assigned after init', fakeAsync(() => {
                const fixture = createComponent(DelayedDatepicker, [KbqLuxonDateModule]);
                const testComponent: DelayedDatepicker = fixture.componentInstance;
                const toSelect = DateTime.local(2017, 1, 1);

                fixture.detectChanges();

                expect(testComponent.datepickerInput.value).toBeNull();
                expect(testComponent.datepicker.selected).toBeNull();

                testComponent.assignedDatepicker = testComponent.datepicker;
                fixture.detectChanges();

                testComponent.assignedDatepicker.select(toSelect);
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(testComponent.datepickerInput.value?.toISO()).toEqual(toSelect.toISO());
                expect(testComponent.datepicker.selected?.toISO()).toEqual(toSelect.toISO());
            }));
        });

        describe('datepicker with no inputs', () => {
            let fixture: ComponentFixture<NoInputDatepicker>;
            let testComponent: NoInputDatepicker;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(NoInputDatepicker, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            }));

            afterEach(fakeAsync(() => {
                testComponent.datepicker.close();
                fixture.detectChanges();
            }));

            it('should not throw when accessing disabled property', () => {
                expect(() => testComponent.datepicker.disabled).not.toThrow();
            });

            it('should throw when opened with no registered inputs', fakeAsync(() => {
                expect(() => testComponent.datepicker.open()).toThrow();
            }));
        });

        describe('datepicker with startAt', () => {
            let fixture: ComponentFixture<DatepickerWithStartAt>;
            let testComponent: DatepickerWithStartAt;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(DatepickerWithStartAt, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            }));

            afterEach(fakeAsync(() => {
                testComponent.datepicker.close();
                fixture.detectChanges();
            }));

            it('explicit startAt should override input value', () => {
                expect(testComponent.datepicker.startAt?.toISO()).toEqual(DateTime.local(2010, 1, 1).toISO());
            });
        });

        describe('datepicker with ngModel', () => {
            let fixture: ComponentFixture<DatepickerWithNgModel>;
            let testComponent: DatepickerWithNgModel;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(DatepickerWithNgModel, [KbqLuxonDateModule]);
                fixture.detectChanges();

                fixture.whenStable().then(() => {
                    fixture.detectChanges();

                    testComponent = fixture.componentInstance;
                });
            }));

            afterEach(fakeAsync(() => {
                testComponent.datepicker.close();
                fixture.detectChanges();
            }));

            it('should update datepicker when model changes', fakeAsync(() => {
                expect(testComponent.datepickerInput.value).toBeNull();
                expect(testComponent.datepicker.selected).toBeNull();

                const selected = DateTime.local(2017, 1, 1);
                testComponent.selected = selected;
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(testComponent.datepickerInput.value?.toISO()).toEqual(selected?.toISO());
                expect(testComponent.datepicker.selected?.toISO()).toEqual(selected?.toISO());
            }));

            it('should update model when date is selected', fakeAsync(() => {
                expect(testComponent.selected).toBeNull();
                expect(testComponent.datepickerInput.value).toBeNull();

                const selected = DateTime.local(2017, 1, 1);
                testComponent.datepicker.select(selected);
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(testComponent.selected).toEqual(selected);
                expect(testComponent.datepickerInput.value).toEqual(selected);
            }));

            it('should mark input dirty after input', fakeAsync(() => {
                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                expect(inputEl.classList).toContain('ng-pristine');

                inputEl.value = '01.01.2001';
                dispatchKeyboardEvent(inputEl, 'keydown', SPACE);
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(inputEl.classList).toContain('ng-dirty');
            }));

            it('should mark input dirty after date selected', fakeAsync(() => {
                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                expect(inputEl.classList).toContain('ng-pristine');

                testComponent.datepicker.select(DateTime.local(2017, 1, 1));
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(inputEl.classList).toContain('ng-dirty');
            }));

            it('should not mark dirty after model change', fakeAsync(() => {
                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                expect(inputEl.classList).toContain('ng-pristine');

                testComponent.selected = DateTime.local(2017, 1, 1);
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(inputEl.classList).toContain('ng-pristine');
            }));

            it('should mark input touched on focus', () => {
                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                expect(inputEl.classList).toContain('ng-untouched');
                expect(inputEl.classList).not.toContain('ng-touched');

                dispatchFakeEvent(inputEl, 'focus');
                fixture.detectChanges();

                expect(inputEl.classList).not.toContain('ng-untouched');
                expect(inputEl.classList).toContain('ng-touched');
            });

            it('should not reformat invalid dates on blur', () => {
                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                inputEl.value = 'very-valid-date';
                dispatchFakeEvent(inputEl, 'input');
                fixture.detectChanges();

                dispatchFakeEvent(inputEl, 'blur');
                fixture.detectChanges();

                expect(inputEl.value).toBe('very-valid-date');
            });

            it('should mark input touched on calendar selection', fakeAsync(() => {
                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                expect(inputEl.classList).toContain('ng-untouched');

                testComponent.datepicker.select(DateTime.local(2017, 1, 1));
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(inputEl.classList).toContain('ng-touched');
            }));

            it('should save time part of model when date is selected', fakeAsync(() => {
                const originDateTime = testComponent.adapter.createDateTime(2017, 1, 1, 1, 1, 10, 100);

                testComponent.datepicker.select(originDateTime);

                expect(testComponent.adapter.toIso8601(testComponent.selected as DateTime)).toEqual(
                    testComponent.adapter.toIso8601(originDateTime as DateTime)
                );

                const newDate = testComponent.adapter.createDate(2018, 1, 1);

                testComponent.datepicker.select(newDate);

                expect(testComponent.adapter.getYear(testComponent.selected as DateTime)).toEqual(
                    testComponent.adapter.getYear(newDate)
                );

                expect(testComponent.adapter.getMonth(testComponent.selected as DateTime)).toEqual(
                    testComponent.adapter.getMonth(newDate)
                );

                expect(testComponent.adapter.getDate(testComponent.selected as DateTime)).toEqual(
                    testComponent.adapter.getDate(newDate)
                );

                expect(testComponent.adapter.getHours(testComponent.selected as DateTime)).toEqual(
                    testComponent.adapter.getHours(originDateTime)
                );

                expect(testComponent.adapter.getMinutes(testComponent.selected as DateTime)).toEqual(
                    testComponent.adapter.getMinutes(originDateTime)
                );

                expect(testComponent.adapter.getSeconds(testComponent.selected as DateTime)).toEqual(
                    testComponent.adapter.getSeconds(originDateTime)
                );

                expect(testComponent.adapter.getMilliseconds(testComponent.selected as DateTime)).toEqual(
                    testComponent.adapter.getMilliseconds(originDateTime)
                );
            }));
        });

        describe('datepicker with formControl', () => {
            let fixture: ComponentFixture<DatepickerWithFormControl>;
            let testComponent: DatepickerWithFormControl;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(DatepickerWithFormControl, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            }));

            afterEach(fakeAsync(() => {
                testComponent.datepicker.close();
                fixture.detectChanges();
            }));

            it('should update datepicker when formControl changes', () => {
                expect(testComponent.datepickerInput.value).toBeNull();
                expect(testComponent.datepicker.selected).toBeNull();

                const selected = DateTime.local(2017, 1, 1);
                testComponent.formControl.setValue(selected);
                fixture.detectChanges();

                expect(testComponent.datepickerInput.value?.toISO()).toEqual(selected?.toISO());
                expect(testComponent.datepicker.selected?.toISO()).toEqual(selected?.toISO());
            });

            it('should update formControl when date is selected', () => {
                expect(testComponent.formControl.value).toBeNull();
                expect(testComponent.datepickerInput.value).toBeNull();

                const selected = DateTime.local(2017, 1, 1);
                testComponent.datepicker.select(selected);
                fixture.detectChanges();

                expect(testComponent.formControl.value).toEqual(selected);
                expect(testComponent.datepickerInput.value).toEqual(selected);
            });

            it('should disable input when form control disabled', () => {
                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                expect(inputEl.disabled).toBe(false);

                testComponent.formControl.disable();
                fixture.detectChanges();

                expect(inputEl.disabled).toBe(true);
            });

            it('should disable toggle when form control disabled', () => {
                expect(testComponent.datepickerToggle.disabled).toBe(false);

                testComponent.formControl.disable();
                fixture.detectChanges();

                expect(testComponent.datepickerToggle.disabled).toBe(true);
            });
        });

        describe('datepicker with kbq-datepicker-toggle', () => {
            let fixture: ComponentFixture<DatepickerWithToggle>;
            let testComponent: DatepickerWithToggle;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(DatepickerWithToggle, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            }));

            afterEach(fakeAsync(() => {
                testComponent.datepicker.close();
                fixture.detectChanges();
                flush();
            }));

            it('should set `aria-haspopup` on the toggle button', () => {
                const button = fixture.debugElement.query(By.css('button'));

                expect(button).toBeTruthy();
                expect(button.nativeElement.getAttribute('aria-haspopup')).toBe('true');
            });

            it('should not open calendar when toggle clicked if datepicker is disabled', () => {
                testComponent.datepicker.disabled = true;
                fixture.detectChanges();
                const toggle = fixture.debugElement.query(By.css('button')).nativeElement;

                expect(toggle.hasAttribute('disabled')).toBe(true);

                dispatchMouseEvent(toggle, 'click');
                fixture.detectChanges();
            });

            it('should not open calendar when toggle clicked if input is disabled', () => {
                expect(testComponent.datepicker.disabled).toBe(false);

                testComponent.input.disabled = true;
                fixture.detectChanges();
                const toggle = fixture.debugElement.query(By.css('button')).nativeElement;

                expect(toggle.hasAttribute('disabled')).toBe(true);

                dispatchMouseEvent(toggle, 'click');
                fixture.detectChanges();
            });

            it('should set the `button` type on the trigger to prevent form submissions', () => {
                const toggle = fixture.debugElement.query(By.css('button')).nativeElement;
                expect(toggle.getAttribute('type')).toBe('button');
            });

            it('should not change focus on open/close calendar', () => {
                const input = fixture.debugElement.query(By.css('input')).nativeElement;

                fixture.detectChanges();

                input.focus();
                expect(document.activeElement).withContext('Expected input to be focused.').toBe(input);

                fixture.componentInstance.datepicker.open();
                fixture.detectChanges();

                const pane = document.querySelector('.cdk-overlay-pane')!;

                expect(pane).withContext('Expected calendar to be open.').toBeTruthy();

                fixture.componentInstance.datepicker.close();
                fixture.detectChanges();

                expect(document.activeElement).withContext('Expected focus to be restored to input.').toBe(input);
            });

            it('should re-render when the i18n labels change', inject(
                [KbqDatepickerIntl],
                (intl: KbqDatepickerIntl) => {
                    const toggle = fixture.debugElement.query(By.css('button')).nativeElement;

                    intl.openCalendarLabel = 'Open the calendar, perhaps?';
                    intl.changes.next();
                    fixture.detectChanges();

                    expect(toggle.getAttribute('aria-label')).toBe('Open the calendar, perhaps?');
                }
            ));

            it('should toggle the active state of the datepicker toggle', fakeAsync(() => {
                const toggle = fixture.debugElement.query(By.css('kbq-datepicker-toggle')).nativeElement;

                expect(toggle.classList).not.toContain('kbq-active');

                fixture.componentInstance.datepicker.open();
                fixture.detectChanges();
                flush();

                expect(toggle.classList).toContain('kbq-active');

                fixture.componentInstance.datepicker.close();
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(toggle.classList).not.toContain('kbq-active');
            }));
        });

        describe('datepicker with custom kbq-datepicker-toggle icon', () => {
            it('should be able to override the kbq-datepicker-toggle icon', fakeAsync(() => {
                const fixture = createComponent(DatepickerWithCustomIcon, [KbqLuxonDateModule]);
                fixture.detectChanges();

                expect(fixture.nativeElement.querySelector('.kbq-datepicker-toggle .custom-icon'))
                    .withContext('Expected custom icon to be rendered.')
                    .toBeTruthy();

                expect(fixture.nativeElement.querySelector('.kbq-datepicker-toggle kbq-icon'))
                    .withContext('Expected default icon to be removed.')
                    .toBeFalsy();
            }));
        });

        describe('datepicker with tabindex on kbq-datepicker-toggle', () => {
            it('should forward tabindex from host to button', () => {
                const fixture = createComponent(DatepickerWithTabindexOnToggle, [KbqLuxonDateModule]);
                fixture.detectChanges();

                const button = fixture.nativeElement.querySelector('.kbq-datepicker-toggle__button');

                expect(button.getAttribute('tabindex')).toBe('7');
            });
        });

        describe('datepicker with min and max dates and validation', () => {
            let fixture: ComponentFixture<DatepickerWithMinAndMaxValidation>;
            let testComponent: DatepickerWithMinAndMaxValidation;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(DatepickerWithMinAndMaxValidation, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            }));

            afterEach(fakeAsync(() => {
                testComponent.datepicker.close();
                fixture.detectChanges();
            }));

            it('should mark invalid when value is before min', fakeAsync(() => {
                testComponent.date = DateTime.local(2009, 11, 31);
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).toContain('ng-invalid');
            }));

            it('should mark invalid when value is after max', fakeAsync(() => {
                testComponent.date = DateTime.local(2020, 1, 2);
                fixture.detectChanges();
                flush();

                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).toContain('ng-invalid');
            }));

            it('should not mark invalid when value equals min', fakeAsync(() => {
                testComponent.date = testComponent.datepicker.minDate;
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).not.toContain('ng-invalid');
            }));

            it('should not mark invalid when value equals max', fakeAsync(() => {
                testComponent.date = testComponent.datepicker.maxDate;
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).not.toContain('ng-invalid');
            }));

            it('should not mark invalid when value is between min and max', fakeAsync(() => {
                testComponent.date = DateTime.local(2010, 1, 2);
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).not.toContain('ng-invalid');
            }));

            it('should change selected year in calendar if input year is less than MIN', fakeAsync(() => {
                fixture.componentInstance.datepicker.open();
                const yearSelectValuePath = '.kbq-calendar-header__select-group kbq-select .kbq-button_transparent';
                const invalidYearLessThanMin = 2014;
                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
                inputEl.value = `01.01.${invalidYearLessThanMin}`;
                dispatchKeyboardEvent(inputEl, 'keydown', ONE);
                fixture.detectChanges();
                flush();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.date?.year).not.toEqual(fixture.componentInstance.minDate.year);
                expect(fixture.componentInstance.date?.year).toEqual(invalidYearLessThanMin);
                expect(
                    fixture.debugElement.queryAll(By.css(yearSelectValuePath))[1].nativeElement.textContent
                ).toContain(invalidYearLessThanMin.toString());
            }));
        });

        describe('datepicker with filter and validation', () => {
            let fixture: ComponentFixture<DatepickerWithFilterAndValidation>;
            let testComponent: DatepickerWithFilterAndValidation;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(DatepickerWithFilterAndValidation, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            }));

            afterEach(fakeAsync(() => {
                testComponent.datepicker.close();
                fixture.detectChanges();
                flush();
            }));

            it('should mark input invalid', fakeAsync(() => {
                testComponent.date = DateTime.local(2017, 1, 1);
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).toContain('ng-invalid');

                testComponent.date = DateTime.local(2017, 1, 2);
                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).not.toContain('ng-invalid');
            }));

            it('should disable filtered calendar cells', () => {
                fixture.detectChanges();

                testComponent.datepicker.open();
                fixture.detectChanges();

                const cells = document.querySelectorAll('.kbq-calendar__body-cell-content');
                expect(cells[0].classList).toContain('kbq-disabled');
                expect(cells[1].classList).not.toContain('kbq-disabled');
            });
        });

        describe('datepicker with change and input events', () => {
            let fixture: ComponentFixture<DatepickerWithChangeAndInputEvents>;
            let testComponent: DatepickerWithChangeAndInputEvents;
            let inputEl: HTMLInputElement;
            let spyOnDateChange;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(DatepickerWithChangeAndInputEvents, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
                inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                spyOn(testComponent, 'onChange');
                spyOn(testComponent, 'onDateInput');
                spyOnDateChange = spyOn(testComponent, 'onDateChange');
            }));

            afterEach(fakeAsync(() => {
                testComponent.datepicker.close();
                fixture.detectChanges();
            }));

            it('should fire input and dateInput events when user types input', fakeAsync(() => {
                expect(testComponent.onDateInput).not.toHaveBeenCalled();

                inputEl.value = '01.01.2001';
                dispatchKeyboardEvent(inputEl, 'keydown', ONE);
                fixture.detectChanges();
                flush();

                expect(testComponent.onDateInput).toHaveBeenCalled();
            }));

            it('should fire change and dateChange events when user commits typed input', fakeAsync(() => {
                expect(testComponent.onChange).not.toHaveBeenCalled();
                expect(testComponent.onDateChange).not.toHaveBeenCalled();
                expect(testComponent.onDateInput).not.toHaveBeenCalled();

                dispatchFakeEvent(inputEl, 'change');
                fixture.detectChanges();
                flush();

                expect(testComponent.onChange).toHaveBeenCalled();
                expect(testComponent.onDateChange).toHaveBeenCalled();
                expect(testComponent.onDateInput).not.toHaveBeenCalled();
            }));

            it('should fire dateInput event when user selects calendar date', fakeAsync(() => {
                expect(testComponent.onChange).not.toHaveBeenCalled();
                expect(testComponent.onDateInput).not.toHaveBeenCalled();

                expect(testComponent.onDateChange).not.toHaveBeenCalled();

                testComponent.datepicker.open();
                fixture.detectChanges();

                const cells = document.querySelectorAll('.kbq-calendar__body-cell');
                dispatchMouseEvent(cells[0], 'click');
                fixture.detectChanges();
                flush();

                expect(testComponent.onChange).not.toHaveBeenCalled();
                expect(testComponent.onDateInput).not.toHaveBeenCalled();

                expect(testComponent.onDateChange).toHaveBeenCalled();
            }));

            it('should not fire the dateInput event if the value has not changed', fakeAsync(() => {
                expect(testComponent.onDateInput).not.toHaveBeenCalled();

                inputEl.value = '12.12.2011';
                dispatchKeyboardEvent(inputEl, 'keydown', ONE);
                fixture.detectChanges();
                flush();

                expect(testComponent.onDateInput).toHaveBeenCalledTimes(1);

                inputEl.value = '12.12.2011';
                dispatchKeyboardEvent(inputEl, 'keydown', ONE);
                fixture.detectChanges();
                flush();

                expect(testComponent.onDateInput).toHaveBeenCalledTimes(1);
            }));

            it('should set datepicker selected value to null when input cleaned up', fakeAsync(() => {
                expect(testComponent.onDateInput).not.toHaveBeenCalled();

                inputEl.value = '12.12.2011';
                dispatchKeyboardEvent(inputEl, 'keydown', ENTER);
                dispatchFakeEvent(inputEl, 'change');
                fixture.detectChanges();
                flush();

                inputEl.value = '';
                dispatchKeyboardEvent(inputEl, 'keydown', ENTER);
                dispatchFakeEvent(inputEl, 'change');
                fixture.detectChanges();
                flush();

                expect((spyOnDateChange.calls.mostRecent().args[0] as KbqDatepickerInputEvent<any>).value).toBeNull();
                expect(testComponent.datepicker.selected).toBeNull();
            }));
        });

        describe('with ISO 8601 strings as input', () => {
            let fixture: ComponentFixture<DatepickerWithISOStrings>;
            let testComponent: DatepickerWithISOStrings;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(DatepickerWithISOStrings, [KbqLuxonDateModule]);
                testComponent = fixture.componentInstance;
            }));

            afterEach(fakeAsync(() => {
                testComponent.datepicker.close();
                fixture.detectChanges();
            }));

            // TODO ISO
            xit('should coerce ISO strings', fakeAsync(() => {
                expect(() => fixture.detectChanges()).not.toThrow();
                flush();
                fixture.detectChanges();

                expect(testComponent.datepicker.startAt).toEqual(DateTime.local(2017, 6, 1));
                expect(testComponent.datepickerInput.value).toEqual(DateTime.local(2017, 5, 1));
                // expect(testComponent.datepickerInput.min).toEqual(new Date(2017, 1, 1));
                // expect(testComponent.datepickerInput.max).toEqual(new Date(2017, 11, 31));
            }));
        });

        describe('with events', () => {
            let fixture: ComponentFixture<DatepickerWithEvents>;
            let testComponent: DatepickerWithEvents;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(DatepickerWithEvents, [KbqLuxonDateModule]);
                fixture.detectChanges();
                testComponent = fixture.componentInstance;
            }));

            it('should dispatch an event when a datepicker is opened', () => {
                testComponent.datepicker.open();
                fixture.detectChanges();

                expect(testComponent.openedSpy).toHaveBeenCalled();
            });

            it('should dispatch an event when a datepicker is closed', fakeAsync(() => {
                testComponent.datepicker.open();
                fixture.detectChanges();

                testComponent.datepicker.close();
                flush();
                fixture.detectChanges();

                expect(testComponent.closedSpy).toHaveBeenCalled();
            }));
        });

        describe('datepicker that opens on focus', () => {
            let fixture: ComponentFixture<DatepickerOpeningOnFocus>;
            let testComponent: DatepickerOpeningOnFocus;
            let input: HTMLInputElement;

            beforeEach(fakeAsync(() => {
                fixture = createComponent(DatepickerOpeningOnFocus, [KbqLuxonDateModule]);
                fixture.detectChanges();
                testComponent = fixture.componentInstance;
                input = fixture.debugElement.query(By.css('input')).nativeElement;
            }));

            it('should not reopen if the browser fires the focus event asynchronously', fakeAsync(() => {
                // Open initially by focusing.
                input.focus();
                fixture.detectChanges();
                flush();

                // Due to some browser limitations we can't install a stub on `document.activeElement`
                // so instead we have to override the previously-focused element manually.
                (fixture.componentInstance.datepicker as any)._focusedElementBeforeOpen = input;

                // Ensure that the datepicker is actually open.
                expect(testComponent.datepicker.opened).withContext('Expected datepicker to be open.').toBe(true);

                // Close the datepicker.
                testComponent.datepicker.close();
                fixture.detectChanges();

                // Schedule the input to be focused asynchronously.
                input.focus();
                fixture.detectChanges();

                // Flush out the scheduled tasks.
                flush();

                expect(testComponent.datepicker.opened).withContext('Expected datepicker to be closed.').toBe(false);
            }));
        });

        describe('datepicker directionality', () => {
            it('should pass along the directionality to the popup', () => {
                const fixture = createComponent(
                    StandardDatepicker,
                    [KbqLuxonDateModule],
                    [
                        {
                            provide: Directionality,
                            useValue: { value: 'rtl' }
                        }
                    ]
                );

                fixture.detectChanges();
                fixture.componentInstance.datepicker.open();
                fixture.detectChanges();

                const overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

                expect(overlay.getAttribute('dir')).toBe('rtl');
            });

            it('should update the popup direction if the directionality value changes', fakeAsync(() => {
                const dirProvider = { value: 'ltr' };
                const fixture = createComponent(
                    StandardDatepicker,
                    [KbqLuxonDateModule],
                    [
                        {
                            provide: Directionality,
                            useFactory: () => dirProvider
                        }
                    ]
                );

                fixture.detectChanges();
                fixture.componentInstance.datepicker.open();
                fixture.detectChanges();

                let overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

                expect(overlay.getAttribute('dir')).toBe('ltr');

                fixture.componentInstance.datepicker.close();
                fixture.detectChanges();
                flush();

                dirProvider.value = 'rtl';
                fixture.componentInstance.datepicker.open();
                fixture.detectChanges();

                overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

                expect(overlay.getAttribute('dir')).toBe('rtl');
                flush();
            }));
        });
    });

    describe('with missing DateAdapter and KBQ_DATE_FORMATS', () => {
        it('should throw when created', () => {
            expect(() => createComponent(StandardDatepicker)).toThrowError(/KbqDatepicker: No provider found for .*/);
        });
    });

    // TODO Fix it with (use Moment)
    xdescribe('internationalization', () => {
        let fixture: ComponentFixture<DatepickerWithi18n>;
        let testComponent: DatepickerWithi18n;
        let input: HTMLInputElement;

        beforeEach(fakeAsync(() => {
            fixture = createComponent(
                DatepickerWithi18n,
                [KbqLuxonDateModule],
                [{ provide: KBQ_DATE_LOCALE, useValue: 'de-DE' }]
            );
            fixture.detectChanges();
            testComponent = fixture.componentInstance;
            input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        }));

        it('should have the correct input value even when inverted date format', fakeAsync(() => {
            const selected = DateTime.local(2017, 8, 1);
            testComponent.date = selected;
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            // Normally the proper date format would 01.09.2017, but some browsers seem format the
            // date without the leading zero. (e.g. 1.9.2017).
            expect(input.value).toMatch(/0?1\.0?9\.2017/);
            expect(testComponent.datepickerInput.value).toBe(selected);
        }));
    });
});

@Component({
    template: `
        <input [kbqDatepicker]="d" [value]="date" />
        <kbq-datepicker #d [disabled]="disabled" [opened]="opened"></kbq-datepicker>
    `
})
class StandardDatepicker {
    opened = false;
    disabled = false;
    date: DateTime | null = DateTime.local(2020, 1, 1);
    @ViewChild('d', { static: false }) datepicker: KbqDatepicker<DateTime>;
    @ViewChild(KbqDatepickerInput, { static: false }) datepickerInput: KbqDatepickerInput<DateTime>;
}

@Component({
    template: `
        <input [kbqDatepicker]="d" /><input [kbqDatepicker]="d" />
        <kbq-datepicker #d></kbq-datepicker>
    `
})
class MultiInputDatepicker {}

@Component({
    template: ` <kbq-datepicker #d></kbq-datepicker>`
})
class NoInputDatepicker {
    @ViewChild('d', { static: false }) datepicker: KbqDatepicker<DateTime>;
}

@Component({
    template: `
        <input [kbqDatepicker]="d" [value]="date" />
        <kbq-datepicker #d [startAt]="startDate"></kbq-datepicker>
    `
})
class DatepickerWithStartAt {
    date = DateTime.local(2020, 1, 1);
    startDate = DateTime.local(2010, 1, 1);
    @ViewChild('d', { static: false }) datepicker: KbqDatepicker<DateTime>;
}

@Component({
    template: `
        <input [(ngModel)]="selected" [kbqDatepicker]="d" />
        <kbq-datepicker #d></kbq-datepicker>
    `
})
class DatepickerWithNgModel {
    selected: DateTime | null = null;
    @ViewChild('d', { static: false }) datepicker: KbqDatepicker<DateTime>;
    @ViewChild(KbqDatepickerInput, { static: false }) datepickerInput: KbqDatepickerInput<DateTime>;

    constructor(public adapter: DateAdapter<DateTime>) {}
}

@Component({
    template: `
        <input [formControl]="formControl" [kbqDatepicker]="d" />
        <kbq-datepicker-toggle [for]="d"></kbq-datepicker-toggle>
        <kbq-datepicker #d></kbq-datepicker>
    `
})
class DatepickerWithFormControl {
    formControl = new UntypedFormControl();
    @ViewChild('d', { static: false }) datepicker: KbqDatepicker<DateTime>;
    @ViewChild(KbqDatepickerInput, { static: false }) datepickerInput: KbqDatepickerInput<DateTime>;
    @ViewChild(KbqDatepickerToggle, { static: false }) datepickerToggle: KbqDatepickerToggle<DateTime>;
}

@Component({
    template: `
        <input [kbqDatepicker]="d" />
        <kbq-datepicker-toggle [for]="d"></kbq-datepicker-toggle>
        <kbq-datepicker #d></kbq-datepicker>
    `
})
class DatepickerWithToggle {
    @ViewChild('d', { static: false }) datepicker: KbqDatepicker<DateTime>;
    @ViewChild(KbqDatepickerInput, { static: false }) input: KbqDatepickerInput<DateTime>;
}

@Component({
    template: `
        <input [kbqDatepicker]="d" />
        <kbq-datepicker-toggle [for]="d">
            <div class="custom-icon" kbqDatepickerToggleIcon></div>
        </kbq-datepicker-toggle>
        <kbq-datepicker #d></kbq-datepicker>
    `
})
class DatepickerWithCustomIcon {}

@Component({
    template: `
        <input [kbqDatepicker]="d" [(ngModel)]="date" [min]="minDate" [max]="maxDate" />
        <kbq-datepicker-toggle [for]="d"></kbq-datepicker-toggle>
        <kbq-datepicker #d></kbq-datepicker>
    `
})
class DatepickerWithMinAndMaxValidation {
    @ViewChild('d', { static: false }) datepicker: KbqDatepicker<DateTime>;
    date: DateTime | null;
    minDate = DateTime.local(2010, 1, 1);
    maxDate = DateTime.local(2020, 1, 1);
}

@Component({
    template: `
        <input [kbqDatepicker]="d" [(ngModel)]="date" [kbqDatepickerFilter]="filter" />
        <kbq-datepicker-toggle [for]="d"></kbq-datepicker-toggle>
        <kbq-datepicker #d></kbq-datepicker>
    `
})
class DatepickerWithFilterAndValidation {
    @ViewChild('d', { static: false }) datepicker: KbqDatepicker<DateTime>;
    date: DateTime;
    filter = (date: DateTime) => date.get('day') !== 1;
}

@Component({
    template: `
        <input
            [kbqDatepicker]="d"
            (change)="onChange()"
            [(ngModel)]="value"
            (dateChange)="onDateChange($event)"
            (dateInput)="onDateInput()"
        />
        <kbq-datepicker #d></kbq-datepicker>
    `
})
class DatepickerWithChangeAndInputEvents {
    value = null;
    @ViewChild('d', { static: false }) datepicker: KbqDatepicker<DateTime>;

    onChange() {}

    // @ts-ignore
    onDateChange(event: KbqDatepickerInputEvent<any>) {}

    onDateInput() {}
}

@Component({
    template: `
        <input [kbqDatepicker]="d" [(ngModel)]="date" />
        <kbq-datepicker #d></kbq-datepicker>
    `
})
class DatepickerWithi18n {
    date: DateTime | null = DateTime.local(2010, 1, 1);
    @ViewChild('d', { static: false }) datepicker: KbqDatepicker<DateTime>;
    @ViewChild(KbqDatepickerInput, { static: false }) datepickerInput: KbqDatepickerInput<DateTime>;
}

@Component({
    template: `
        <input [kbqDatepicker]="d" [(ngModel)]="value" [min]="min" [max]="max" />
        <kbq-datepicker #d [startAt]="startAt"></kbq-datepicker>
    `
})
// tslint:disable-next-line:naming-convention
class DatepickerWithISOStrings {
    value = new Date(2017, 5, 1).toISOString();
    min = new Date(2017, 1, 1).toISOString();
    max = new Date(2017, 11, 31).toISOString();
    startAt = new Date(2017, 6, 1).toISOString();
    @ViewChild('d', { static: false }) datepicker: KbqDatepicker<DateTime>;
    @ViewChild(KbqDatepickerInput, { static: false }) datepickerInput: KbqDatepickerInput<DateTime>;
}

@Component({
    template: `
        <input [(ngModel)]="selected" [kbqDatepicker]="d" />
        <kbq-datepicker (opened)="openedSpy()" (closed)="closedSpy()" #d></kbq-datepicker>
    `
})
class DatepickerWithEvents {
    selected: DateTime | null = null;
    openedSpy = jasmine.createSpy('opened spy');
    closedSpy = jasmine.createSpy('closed spy');
    @ViewChild('d', { static: false }) datepicker: KbqDatepicker<DateTime>;
}

@Component({
    template: `
        <input (focus)="d.open()" [kbqDatepicker]="d" />
        <kbq-datepicker #d="kbqDatepicker"></kbq-datepicker>
    `
})
class DatepickerOpeningOnFocus {
    @ViewChild(KbqDatepicker, { static: false }) datepicker: KbqDatepicker<DateTime>;
}

@Component({
    template: `
        <input [kbqDatepicker]="assignedDatepicker" [value]="date" />
        <kbq-datepicker #d></kbq-datepicker>
    `
})
class DelayedDatepicker {
    @ViewChild('d', { static: false }) datepicker: KbqDatepicker<DateTime>;
    @ViewChild(KbqDatepickerInput, { static: false }) datepickerInput: KbqDatepickerInput<DateTime>;
    date: DateTime | null;
    assignedDatepicker: KbqDatepicker<DateTime>;
}

@Component({
    template: `
        <input [kbqDatepicker]="d" />
        <kbq-datepicker-toggle [tabIndex]="7" [for]="d">
            <div class="custom-icon" kbqDatepickerToggleIcon></div>
        </kbq-datepicker-toggle>
        <kbq-datepicker #d></kbq-datepicker>
    `
})
class DatepickerWithTabindexOnToggle {}
