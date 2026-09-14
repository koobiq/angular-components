import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DebugElement, inject, Provider, signal, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule, LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    DateAdapter,
    DateFormatter,
    enUSLocaleData,
    KBQ_LOCALE_SERVICE,
    KbqFormattersModule,
    kbqInjectLocaleConfiguration,
    KbqLocaleService,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqPopoverComponent } from '@koobiq/components/popover';
import { KbqRadioButton } from '@koobiq/components/radio';
import { KBQ_CUSTOM_TIME_RANGE_TYPES, KBQ_DEFAULT_TIME_RANGE_TYPES } from './constants';
import { KbqTimeRangeModule } from './module';
import {
    KBQ_TIME_RANGE_LOCALE_CONFIGURATION,
    KbqTimeRange,
    kbqTimeRangeLocaleConfigurationProvider
} from './time-range';
import { KbqTimeRangeEditor } from './time-range-editor';
import { KbqTimeRangeTitle } from './time-range-title';
import { KbqCustomTimeRangeType, KbqTimeRangeRange, KbqTimeRangeType } from './types';

const setup = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule, KbqLuxonDateModule, KbqFormattersModule],
        providers: [...providers]
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getTriggerNativeElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.query(By.directive(KbqTimeRangeTitle)).nativeElement;
};

const getPopoverDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqPopoverComponent));
};

const getEditorInstance = (debugElement: DebugElement): KbqTimeRangeEditor<unknown> => {
    return debugElement.query(By.directive(KbqTimeRangeEditor)).componentInstance;
};

const getEditorForm = (debugElement: DebugElement): FormGroup => {
    return (getEditorInstance(debugElement) as unknown as { form: FormGroup }).form;
};

const getRangeElement = (debugElement: DebugElement): HTMLElement => {
    return getPopoverDebugElement(debugElement).nativeElement.querySelector('.kbq-time-range-editor__range');
};

const getApplyButton = (): HTMLButtonElement => {
    return document.querySelector('.kbq-time-range__buttons button')!;
};

const getCancelButton = (): HTMLButtonElement => {
    return Array.from(document.querySelectorAll<HTMLButtonElement>('.kbq-time-range__buttons button'))[1];
};

const isPopoverOpen = (): boolean => !!document.querySelector('.kbq-time-range-editor__range');

const getInvalidFieldCount = (debugElement: DebugElement): number => {
    return getRangeElement(debugElement).querySelectorAll('.kbq-form-field_invalid').length;
};

const dispatchFocusOut = (element: HTMLElement, relatedTarget: HTMLElement | null): void => {
    element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget }));
};

const getRangeOptionHint = (debugElement: DebugElement): string | null => {
    return getRangeElement(debugElement).querySelector('.kbq-hint')?.textContent?.trim() ?? null;
};

/** Names of the fields currently painted as invalid, in the order they appear. */
const getInvalidFieldNames = (debugElement: DebugElement): string[] => {
    return Array.from(getRangeElement(debugElement).querySelectorAll('.kbq-form-field_invalid')).map((field) =>
        field.querySelector('input')!.getAttribute('data-time-range-field')!
    );
};

const getBorderElements = (debugElement: DebugElement): HTMLElement[] => {
    return Array.from(getRangeElement(debugElement).querySelectorAll('.kbq-time-range-editor__date-time'));
};

/** Opens the popover and selects the manual range, so the border fields are enabled. */
const openOnRange = (fixture: ComponentFixture<unknown>): void => {
    getTriggerNativeElement(fixture.debugElement).click();
    fixture.detectChanges();
    getEditorForm(fixture.debugElement).controls.type.setValue('range');
    fixture.detectChanges();
};

/** Leaves both borders, which is what lets them report anything at all. */
const revealBorders = (fixture: ComponentFixture<unknown>): void => {
    getBorderElements(fixture.debugElement).forEach((border) =>
        dispatchFocusOut(border, getTriggerNativeElement(fixture.debugElement))
    );
    fixture.detectChanges();
};

describe('KbqTimeRange', () => {
    describe('Component initialization', () => {
        it('should apply default configuration', () => {
            const { debugElement } = setup(TestComponent);

            expect(getTriggerNativeElement(debugElement).textContent).toMatchSnapshot();
        });

        it('should open popover when trigger is clicked', fakeAsync(() => {
            const fixture = setup(TestComponent);
            const { debugElement } = fixture;
            const triggerElement = getTriggerNativeElement(debugElement);

            triggerElement.click();
            tick();
            fixture.detectChanges();

            expect(getPopoverDebugElement(debugElement)).toBeTruthy();
        }));

        it('should select first radio if no external value provided', fakeAsync(() => {
            const fixture = setup(TestComponent);
            const { debugElement } = fixture;
            const triggerElement = getTriggerNativeElement(debugElement);

            triggerElement.click();
            tick();
            fixture.detectChanges();

            const popoverElement = getPopoverDebugElement(debugElement);

            expect(popoverElement.queryAll(By.directive(KbqRadioButton))[0].classes['kbq-selected']).toBeTruthy();
        }));

        it('should select first radio if availableTimeRangeTypes provided', fakeAsync(() => {
            const fixture = setup(TestComponentWithInputs);
            const { debugElement } = fixture;
            const triggerElement = getTriggerNativeElement(debugElement);

            triggerElement.click();
            tick();
            fixture.detectChanges();

            const popoverElement = getPopoverDebugElement(debugElement);

            expect(
                popoverElement
                    .queryAll(By.directive(KbqRadioButton))
                    .findIndex((element) => element.classes['kbq-selected'])
            ).toBe(0);
        }));

        it('should check selected radio if external value provided', fakeAsync(() => {
            const fixture = setup(TestComponentWithInitial);
            const { debugElement } = fixture;
            const triggerElement = getTriggerNativeElement(debugElement);

            triggerElement.click();
            tick();
            fixture.detectChanges();

            const popoverElement = getPopoverDebugElement(debugElement);
            const checkedRadio: HTMLElement | undefined = popoverElement
                .queryAll(By.directive(KbqRadioButton))
                .find((element) => element.classes['kbq-selected'])?.nativeElement satisfies HTMLElement;

            expect({
                trigger: getTriggerNativeElement(debugElement).textContent,
                checkedRadio: checkedRadio?.textContent
            }).toMatchSnapshot();
        }));

        it('should check range as default if nothing provided', () => {
            const fixture = setup(TestComponentWithInputs);
            const { componentInstance } = fixture;
            const initial = componentInstance.control.value.type;

            componentInstance.availableTimeRangeTypes.set([]);
            fixture.detectChanges();

            expect({
                initial,
                current: componentInstance.control.value.type
            }).toMatchSnapshot();
        });

        it('should keep a nullable trigger empty when the type list is empty', fakeAsync(() => {
            const fixture = setup(TestComponentNullableWithoutTypes);
            const { componentInstance, debugElement } = fixture;

            tick();
            fixture.detectChanges();

            // Replacing the types is not the user picking a range, so nothing may reach the control.
            expect(componentInstance.control.value).toBeNull();
            expect(getTriggerNativeElement(debugElement).textContent).toContain('Выберите период');
        }));

        it('should work with custom ranges', () => {
            const customTypes: KbqCustomTimeRangeType[] = [
                { type: 'last3Minutes', units: { minutes: -3 }, translationType: 'minutes' },
                { type: 'last3Weeks', units: { weeks: -3 }, translationType: 'weeks' },
                { type: 'last3Years', units: { years: -3 }, translationType: 'months' }
            ];

            const customDefaultTypes = customTypes.map(({ type }) => type);

            const fixture = setup(TestComponent, [
                DateFormatter,
                { provide: KBQ_CUSTOM_TIME_RANGE_TYPES, useValue: customTypes },
                { provide: KBQ_DEFAULT_TIME_RANGE_TYPES, useValue: customDefaultTypes }
            ]);
            const { debugElement } = fixture;

            fixture.detectChanges();

            expect(getTriggerNativeElement(debugElement).textContent).toMatchSnapshot();
        });

        it('should apply custom option template in KbqTimeRangeEditor', fakeAsync(() => {
            const fixture = setup(TestTimeRangeCustomOption);
            const { debugElement } = fixture;

            fixture.detectChanges();

            const triggerElement = getTriggerNativeElement(debugElement);

            triggerElement.click();
            tick();
            fixture.detectChanges();

            const popoverElement = getPopoverDebugElement(debugElement);

            expect(
                popoverElement.queryAll(By.css('.kbq-radio__text')).map((element) => element.nativeElement.textContent)
            ).toMatchSnapshot();
        }));
    });

    describe('Value correction', () => {
        it('should correct the type and emit valueCorrected when the provided type is not available', fakeAsync(() => {
            const fixture = setup(TestComponentWithValueCorrection);
            const { componentInstance, debugElement } = fixture;

            componentInstance.control.setValue({ type: 'currentYear' });
            fixture.detectChanges();

            expect(componentInstance.valueCorrected()?.type).toBe('lastHour');

            const triggerElement = getTriggerNativeElement(debugElement);

            triggerElement.click();
            tick();
            fixture.detectChanges();

            const popoverElement = getPopoverDebugElement(debugElement);
            const selectedIndex = popoverElement
                .queryAll(By.directive(KbqRadioButton))
                .findIndex((element) => element.classes['kbq-selected']);

            expect(selectedIndex).toBe(0);
        }));

        it('should not emit valueCorrected when a fully valid value is provided', () => {
            const fixture = setup(TestComponentWithValueCorrection);
            const { componentInstance } = fixture;

            componentInstance.valueCorrected.set(undefined);
            componentInstance.control.setValue({ type: 'last24Hours', startDateTime: '2024-01-01T00:00:00.000Z' });
            fixture.detectChanges();

            expect(componentInstance.valueCorrected()).toBeUndefined();
        });

        it('should fall back to a default value and emit valueCorrected when null is provided while nonNullable', () => {
            const fixture = setup(TestComponentWithValueCorrection);
            const { componentInstance } = fixture;

            componentInstance.control.setValue(null);
            fixture.detectChanges();

            expect(componentInstance.valueCorrected()?.type).toBe('lastHour');
        });

        it('should keep the value empty and skip correction when nonNullable is false', () => {
            const fixture = setup(TestComponentWithValueCorrection);
            const { componentInstance, debugElement } = fixture;

            componentInstance.nonNullable.set(false);
            fixture.detectChanges();

            componentInstance.valueCorrected.set(undefined);
            componentInstance.control.setValue(null);
            fixture.detectChanges();

            expect(componentInstance.valueCorrected()).toBeUndefined();
            expect(getTriggerNativeElement(debugElement).textContent?.trim()).toBe(
                ruRULocaleData.timeRange.title.placeholder
            );
        });

        it('should recalculate missing start/end dates for an incomplete range value', fakeAsync(() => {
            const fixture = setup(TestComponentWithValueCorrection);
            const { componentInstance, debugElement } = fixture;

            componentInstance.control.setValue({ type: 'range' });
            fixture.detectChanges();

            const corrected = componentInstance.valueCorrected();

            expect(corrected?.type).toBe('range');
            expect(corrected?.startDateTime).toBeTruthy();
            expect(corrected?.endDateTime).toBeTruthy();

            const triggerElement = getTriggerNativeElement(debugElement);

            triggerElement.click();
            tick();
            fixture.detectChanges();

            const editorForm = (getEditorInstance(debugElement) as any).form.value;

            expect(editorForm.fromDate).toBeTruthy();
            expect(editorForm.toDate).toBeTruthy();
        }));
    });

    describe('Reversed range', () => {
        const reversedFrom = '2024-03-10T18:00:00.000Z';
        const reversedTo = '2024-03-01T09:00:00.000Z';

        /** Opens the popover and leaves the manual range fields holding a "to" earlier than "from". */
        const setupReversedRange = (
            fixture: ComponentFixture<TestComponentWithRange>,
            fromIso = reversedFrom,
            toIso = reversedTo
        ) => {
            const { debugElement } = fixture;

            getTriggerNativeElement(debugElement).click();
            tick();
            fixture.detectChanges();

            const dateAdapter = TestBed.inject(DateAdapter);
            const from = dateAdapter.deserialize(fromIso);
            const to = dateAdapter.deserialize(toIso);
            const form = getEditorForm(debugElement);

            form.patchValue({ fromTime: from, fromDate: from, toTime: to, toDate: to });
            fixture.detectChanges();

            // A reversed range is corrected silently, so it must never reach the user as an error.
            expect(form.valid).toBe(true);
            expect(getInvalidFieldCount(debugElement)).toBe(0);
            expect(getApplyButton().disabled).toBe(false);

            return { dateAdapter, form, rangeElement: getRangeElement(debugElement) };
        };

        /** The four field values as ISO strings, in `[fromDate, fromTime, toDate, toTime]` order. */
        const readRange = (dateAdapter: DateAdapter<unknown>, form: FormGroup): string[] => {
            return [
                form.value.fromDate,
                form.value.fromTime,
                form.value.toDate,
                form.value.toTime
            ].map((value) => dateAdapter.toIso8601(value));
        };

        /** The same shape built from ISO literals, so both sides carry the adapter's own offset. */
        const expectedRange = (dateAdapter: DateAdapter<unknown>, from: string, to: string): string[] => {
            return [from, from, to, to].map((iso) => dateAdapter.toIso8601(dateAdapter.deserialize(iso)));
        };

        it('should swap the values once focus leaves the range block', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { dateAdapter, form, rangeElement } = setupReversedRange(fixture);

            dispatchFocusOut(rangeElement, getTriggerNativeElement(fixture.debugElement));
            fixture.detectChanges();

            expect(readRange(dateAdapter, form)).toEqual(expectedRange(dateAdapter, reversedTo, reversedFrom));
            expect(getInvalidFieldCount(fixture.debugElement)).toBe(0);
            expect(getApplyButton().disabled).toBe(false);
        }));

        it('should swap the values when only the time is reversed within the same day', fakeAsync(() => {
            const sameDayFrom = '2024-03-10T18:00:00.000Z';
            const sameDayTo = '2024-03-10T09:00:00.000Z';
            const fixture = setup(TestComponentWithRange);
            const { dateAdapter, form, rangeElement } = setupReversedRange(fixture, sameDayFrom, sameDayTo);

            dispatchFocusOut(rangeElement, getTriggerNativeElement(fixture.debugElement));
            fixture.detectChanges();

            expect(readRange(dateAdapter, form)).toEqual(expectedRange(dateAdapter, sameDayTo, sameDayFrom));
        }));

        it('should keep the values while focus moves between the range fields', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { dateAdapter, form, rangeElement } = setupReversedRange(fixture);

            dispatchFocusOut(rangeElement, rangeElement.querySelector('input'));
            fixture.detectChanges();

            expect(readRange(dateAdapter, form)).toEqual(expectedRange(dateAdapter, reversedFrom, reversedTo));
        }));

        it('should keep the values while focus moves into the datepicker overlay', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { dateAdapter, form, rangeElement } = setupReversedRange(fixture);
            // The calendar is rendered in a CDK overlay, outside of the range block.
            const overlayPane = document.createElement('div');
            const calendarCell = document.createElement('td');

            overlayPane.classList.add('kbq-datepicker__popup');
            overlayPane.appendChild(calendarCell);

            dispatchFocusOut(rangeElement, calendarCell);
            fixture.detectChanges();

            expect(readRange(dateAdapter, form)).toEqual(expectedRange(dateAdapter, reversedFrom, reversedTo));
        }));

        it('should leave an ordered range untouched', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { debugElement } = fixture;

            getTriggerNativeElement(debugElement).click();
            tick();
            fixture.detectChanges();

            const form = getEditorForm(debugElement);
            const { fromDate, toDate } = form.value;

            dispatchFocusOut(getRangeElement(debugElement), getTriggerNativeElement(debugElement));
            fixture.detectChanges();

            expect(form.valid).toBe(true);
            expect(form.value.fromDate).toBe(fromDate);
            expect(form.value.toDate).toBe(toDate);
        }));

        it('should swap only the applied value when focus moves straight to the apply button', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { componentInstance, debugElement } = fixture;

            getTriggerNativeElement(debugElement).click();
            tick();
            fixture.detectChanges();

            const dateAdapter = TestBed.inject(DateAdapter);
            const form = getEditorForm(debugElement);

            // Only the date half moves, the way the datepicker updates it - past the "to" date.
            form.patchValue({ fromDate: dateAdapter.deserialize('2024-03-20T09:00:00.000Z') });
            fixture.detectChanges();

            // What the browser does on a click: focus leaves the block first, the button acts second.
            dispatchFocusOut(getRangeElement(debugElement), getApplyButton());
            fixture.detectChanges();

            // The popover must not visibly reorder itself in the gesture that closes it.
            expect([dateAdapter.getDate(form.value.fromDate), dateAdapter.getDate(form.value.toDate)]).toEqual([
                20,
                10
            ]);

            getApplyButton().click();
            tick();
            fixture.detectChanges();

            const { startDateTime, endDateTime } = componentInstance.control.value;
            const start = dateAdapter.deserialize(startDateTime!);
            const end = dateAdapter.deserialize(endDateTime!);

            expect([dateAdapter.getDate(start), dateAdapter.getDate(end)]).toEqual([10, 20]);
            expect(dateAdapter.compareDateTime(start, end)).toBeLessThan(0);
        }));

        it('should swap the fields when the pointer lands on a blank spot in the editor', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { dateAdapter, form, rangeElement } = setupReversedRange(fixture);
            // A headless document is never focused, so the window-blur guard has to be taken out of play.
            const hasFocus = jest.spyOn(document, 'hasFocus').mockReturnValue(true);

            // A mousedown on something unfocusable blurs the field and reports no `relatedTarget` at all.
            dispatchFocusOut(rangeElement, null);
            fixture.detectChanges();
            hasFocus.mockRestore();

            expect(readRange(dateAdapter, form)).toEqual(expectedRange(dateAdapter, reversedTo, reversedFrom));
        }));

        it('should keep the fields while a pointer gesture on the footer is in flight', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { dateAdapter, form, rangeElement } = setupReversedRange(fixture);
            // Focused, so the gesture is the only thing that can be holding the swap back.
            const hasFocus = jest.spyOn(document, 'hasFocus').mockReturnValue(true);

            // Safari does not focus a button on click, so the footer is recognised by the gesture instead.
            getApplyButton().dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            dispatchFocusOut(rangeElement, null);
            fixture.detectChanges();
            hasFocus.mockRestore();

            expect(readRange(dateAdapter, form)).toEqual(expectedRange(dateAdapter, reversedFrom, reversedTo));
        }));

        it('should keep the fields while the whole window is out of focus', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { dateAdapter, form, rangeElement } = setupReversedRange(fixture);
            const hasFocus = jest.spyOn(document, 'hasFocus').mockReturnValue(false);

            dispatchFocusOut(rangeElement, null);
            fixture.detectChanges();
            hasFocus.mockRestore();

            expect(readRange(dateAdapter, form)).toEqual(expectedRange(dateAdapter, reversedFrom, reversedTo));
        }));

        it('should never emit a reversed range, even when the fields were never blurred', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { componentInstance, debugElement } = fixture;

            getTriggerNativeElement(debugElement).click();
            tick();
            fixture.detectChanges();

            const dateAdapter = TestBed.inject(DateAdapter);
            const form = getEditorForm(debugElement);

            form.patchValue({ fromDate: dateAdapter.deserialize('2024-03-20T09:00:00.000Z') });
            fixture.detectChanges();

            // No focusout at all: the fields commit on `blur`, which a browser may dispatch after
            // `focusout`, leaving the swap nothing to act on when "apply" runs in the same gesture.
            const days = [form.value.toDate, form.value.fromDate].map((value) => dateAdapter.getDate(value));

            getApplyButton().click();
            tick();
            fixture.detectChanges();

            const { startDateTime, endDateTime } = componentInstance.control.value;
            const start = dateAdapter.deserialize(startDateTime!);
            const end = dateAdapter.deserialize(endDateTime!);

            expect(dateAdapter.compareDateTime(start, end)).toBeLessThan(0);
            expect([dateAdapter.getDate(start), dateAdapter.getDate(end)]).toEqual(days);
        }));
    });

    describe('Applied value', () => {
        it('should take the end of the range from the "to" date field', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { componentInstance, debugElement } = fixture;

            getTriggerNativeElement(debugElement).click();
            tick();
            fixture.detectChanges();

            const dateAdapter = TestBed.inject(DateAdapter);
            const form = getEditorForm(debugElement);

            // Only the date half moves, so a range built from the time half alone keeps the old day.
            form.patchValue({ toDate: dateAdapter.deserialize('2024-03-20T09:00:00.000Z') });
            fixture.detectChanges();

            // Applying writes the result back into the form, so the expectations are read up front.
            const endDay = dateAdapter.getDate(form.value.toDate);
            const endHours = dateAdapter.getHours(form.value.toTime);

            getApplyButton().click();
            tick();
            fixture.detectChanges();

            const applied = dateAdapter.deserialize(componentInstance.control.value.endDateTime!);

            expect([dateAdapter.getDate(applied), dateAdapter.getHours(applied)]).toEqual([endDay, endHours]);
        }));
    });

    describe('Min and max dates', () => {
        it('should open the range editor on a default range the datepickers accept', fakeAsync(() => {
            const fixture = setup(TestComponentWithBounds);
            const { componentInstance, debugElement } = fixture;

            getTriggerNativeElement(debugElement).click();
            tick();
            fixture.detectChanges();

            const dateAdapter = TestBed.inject(DateAdapter);
            const form = getEditorForm(debugElement);

            // The preset selected first keeps the range fields disabled, and disabled controls never validate.
            form.controls.type.setValue('range');
            fixture.detectChanges();
            revealBorders(fixture);

            const { minDate, maxDate } = componentInstance;

            expect(getInvalidFieldCount(debugElement)).toBe(0);
            expect(form.valid).toBe(true);

            [form.value.fromDate, form.value.toDate].forEach((value) => {
                expect(dateAdapter.compareDateTime(value, minDate)).toBeGreaterThanOrEqual(0);
                expect(dateAdapter.compareDateTime(value, maxDate)).toBeLessThanOrEqual(0);
            });

            // Clamping both ends against the bounds independently would collapse the range onto `maxDate`.
            expect(dateAdapter.compareDateTime(form.value.fromDate, form.value.toDate)).toBeLessThan(0);
        }));

        it('should not carry an unapplied out-of-bounds value into the next open', fakeAsync(() => {
            const fixture = setup(TestComponentWithBoundsOnly);
            const { componentInstance, debugElement } = fixture;

            getTriggerNativeElement(debugElement).click();
            tick();
            fixture.detectChanges();

            const dateAdapter = TestBed.inject(DateAdapter);
            const outOfBounds = dateAdapter.deserialize('2020-06-15T09:00:00.000Z');

            getEditorForm(debugElement).patchValue({ toDate: outOfBounds });
            fixture.detectChanges();

            getApplyButton().click();
            tick();
            fixture.detectChanges();

            // Refused, so the popover stays open on the value the user still has to deal with.
            expect(isPopoverOpen()).toBe(true);

            getCancelButton().click();
            tick();
            fixture.detectChanges();
            expect(isPopoverOpen()).toBe(false);

            getTriggerNativeElement(debugElement).click();
            tick();
            fixture.detectChanges();

            const { toDate } = getEditorForm(debugElement).getRawValue();

            expect(dateAdapter.compareDateTime(toDate, outOfBounds)).not.toBe(0);
            expect(dateAdapter.compareDateTime(toDate, componentInstance.maxDate)).toBeLessThanOrEqual(0);
        }));

        // Built the same way the bounds are, so that none of these hinge on the runner's time zone.
        it.each([
            ['from', 'its day is before minDate', [2014, 5, 15, 12], ['fromTime', 'fromDate']],
            ['from', 'only its time is before minDate', [2015, 0, 1, 6], ['fromTime']],
            ['to', 'its day is after maxDate', [2020, 5, 15, 12], ['toTime', 'toDate']],
            ['to', 'only its time is after maxDate', [2017, 11, 31, 20], ['toTime']]
        ])('should paint the %s border when %s', (border, _case, [year, month, day, hours], expected) => {
            const fixture = setup(TestComponentWithTimedBounds);
            const dateAdapter = TestBed.inject(DateAdapter);

            openOnRange(fixture);

            const moment = dateAdapter.createDateTime(year, month, day, hours, 0, 0, 0);

            getEditorForm(fixture.debugElement).patchValue({
                [`${border}Date`]: moment,
                [`${border}Time`]: moment
            });
            revealBorders(fixture);

            expect(getInvalidFieldNames(fixture.debugElement)).toEqual(expected);
        });

        it('should not swap a reversed range while a border is out of bounds', () => {
            const fixture = setup(TestComponentWithTimedBounds);
            const dateAdapter = TestBed.inject(DateAdapter);

            openOnRange(fixture);

            // Reversed *and* out of bounds: the user has to fix it or cancel, so nothing may be reordered
            // under them in the meantime.
            const from = dateAdapter.createDateTime(2020, 5, 15, 12, 0, 0, 0);
            const to = dateAdapter.createDateTime(2016, 5, 15, 12, 0, 0, 0);
            const form = getEditorForm(fixture.debugElement);

            form.patchValue({ fromDate: from, fromTime: from, toDate: to, toTime: to });
            revealBorders(fixture);

            expect(dateAdapter.compareDateTime(form.getRawValue().fromDate, from)).toBe(0);
            expect(dateAdapter.compareDateTime(form.getRawValue().toDate, to)).toBe(0);
            expect(getInvalidFieldNames(fixture.debugElement)).toEqual(['fromTime', 'fromDate']);
        });

        it('should still swap a reversed range once both borders are within bounds', () => {
            const fixture = setup(TestComponentWithTimedBounds);
            const dateAdapter = TestBed.inject(DateAdapter);

            openOnRange(fixture);

            const from = dateAdapter.createDateTime(2016, 5, 15, 12, 0, 0, 0);
            const to = dateAdapter.createDateTime(2015, 5, 15, 12, 0, 0, 0);
            const form = getEditorForm(fixture.debugElement);

            form.patchValue({ fromDate: from, fromTime: from, toDate: to, toTime: to });
            revealBorders(fixture);

            expect(dateAdapter.compareDateTime(form.getRawValue().fromDate, to)).toBe(0);
            expect(dateAdapter.compareDateTime(form.getRawValue().toDate, from)).toBe(0);
            expect(getInvalidFieldNames(fixture.debugElement)).toEqual([]);
        });

        it('should hold an error back until the border is left, and drop it again on input', () => {
            const fixture = setup(TestComponentWithTimedBounds);
            const { debugElement } = fixture;
            const dateAdapter = TestBed.inject(DateAdapter);

            openOnRange(fixture);

            const outOfBounds = dateAdapter.createDateTime(2020, 5, 15, 12, 0, 0, 0);
            const [fromBorder] = getBorderElements(debugElement);

            getEditorForm(debugElement).patchValue({ fromDate: outOfBounds, fromTime: outOfBounds });
            fixture.detectChanges();

            // Still filling the pair in - nothing is said yet.
            expect(getInvalidFieldNames(debugElement)).toEqual([]);

            // Moving between the border's own date and time is not leaving it either.
            dispatchFocusOut(fromBorder, fromBorder.querySelector('input'));
            fixture.detectChanges();
            expect(getInvalidFieldNames(debugElement)).toEqual([]);

            dispatchFocusOut(fromBorder, getTriggerNativeElement(debugElement));
            fixture.detectChanges();
            expect(getInvalidFieldNames(debugElement)).toEqual(['fromTime', 'fromDate']);

            // Typing puts the border back to neutral, even before the value becomes correct.
            fromBorder.querySelector('input')!.dispatchEvent(new Event('input', { bubbles: true }));
            fixture.detectChanges();
            expect(getInvalidFieldNames(debugElement)).toEqual([]);
        });

        it('should leave a border sitting exactly on its bound alone', () => {
            const fixture = setup(TestComponentWithTimedBounds);
            const { componentInstance } = fixture;

            openOnRange(fixture);

            getEditorForm(fixture.debugElement).patchValue({
                fromDate: componentInstance.minDate,
                fromTime: componentInstance.minDate,
                toDate: componentInstance.maxDate,
                toTime: componentInstance.maxDate
            });
            revealBorders(fixture);

            expect(getInvalidFieldNames(fixture.debugElement)).toEqual([]);
        });

        it('should caption the range option with day-only bounds', fakeAsync(() => {
            const fixture = setup(TestComponentWithBounds);
            const { debugElement } = fixture;

            getTriggerNativeElement(debugElement).click();
            tick();
            fixture.detectChanges();

            // Hung off the option itself while there is one to hang it off.
            expect(getRangeElement(debugElement).querySelector('kbq-radio-button .kbq-hint')).toBeTruthy();
            expect(getRangeOptionHint(debugElement)).toMatchSnapshot();
        }));

        it('should caption the range option with the time of bounds that carry one', fakeAsync(() => {
            const fixture = setup(TestComponentWithMillisecondBounds);
            const { debugElement } = fixture;

            getTriggerNativeElement(debugElement).click();
            tick();
            fixture.detectChanges();

            // A bound at 14:23 is only honoured if the caption spells the time out.
            expect(getRangeOptionHint(debugElement)).toContain('14:23');
        }));

        it('should caption the bounds even with no preset option to hang them off', fakeAsync(() => {
            const fixture = setup(TestComponentWithBoundsOnly);
            const { debugElement } = fixture;

            getTriggerNativeElement(debugElement).click();
            tick();
            fixture.detectChanges();

            const rangeElement = getRangeElement(debugElement);

            expect(rangeElement.querySelector('kbq-radio-button')).toBeNull();
            // Inside the "to" fieldset's own hint area, so it is styled and placed like any other hint.
            expect(getBorderElements(debugElement).at(-1)!.querySelector('kbq-fieldset .kbq-hint')).toBeTruthy();
            expect(getRangeOptionHint(debugElement)).toMatchSnapshot();
        }));

        it('should leave the range option uncaptioned when there are no bounds', fakeAsync(() => {
            const fixture = setup(TestComponent);
            const { debugElement } = fixture;

            getTriggerNativeElement(debugElement).click();
            tick();
            fixture.detectChanges();

            expect(getRangeOptionHint(debugElement)).toBeNull();
        }));

        it('should clamp the default range onto bounds that carry a time of their own', fakeAsync(() => {
            const fixture = setup(TestComponentWithMillisecondBounds);
            const { componentInstance, debugElement } = fixture;

            getTriggerNativeElement(debugElement).click();
            tick();
            fixture.detectChanges();

            const dateAdapter = TestBed.inject(DateAdapter);
            const form = getEditorForm(debugElement);

            form.controls.type.setValue('range');
            fixture.detectChanges();
            revealBorders(fixture);

            // Stripping the milliseconds after clamping would leave the border just below `minDate`.
            expect(dateAdapter.compareDateTime(form.value.fromDate, componentInstance.minDate)).toBeGreaterThanOrEqual(
                0
            );
            expect(getInvalidFieldCount(debugElement)).toBe(0);
            expect(form.valid).toBe(true);
        }));
    });

    describe('kbqTimeRangeLocaleConfigurationProvider', () => {
        const apply = '*unit_test* Apply';

        const injectConfiguration = (providers: unknown[]) => {
            TestBed.configureTestingModule({ providers: providers as [] });

            return TestBed.runInInjectionContext(() =>
                kbqInjectLocaleConfiguration('timeRange', KBQ_TIME_RANGE_LOCALE_CONFIGURATION)
            );
        };

        it('should override a nested key while keeping the rest at the defaults', () => {
            const { timeRange } = ruRULocaleData;

            const { editor, title } = injectConfiguration([
                kbqTimeRangeLocaleConfigurationProvider({ editor: { apply } })
            ])();

            expect(editor.apply).toBe(apply);
            // The siblings of the overridden key are what a shallow merge of the section would drop.
            expect(editor.cancel).toBe(timeRange.editor.cancel);
            expect(editor.from).toBe(timeRange.editor.from);
            expect(editor.to).toBe(timeRange.editor.to);
            expect(title).toBe(timeRange.title);
        });

        it('should apply the override on top of the active locale', () => {
            const configuration = injectConfiguration([
                { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
                kbqTimeRangeLocaleConfigurationProvider({ editor: { apply } })
            ]);

            expect(configuration().editor.apply).toBe(apply);

            TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');

            // The overridden key stays pinned, everything else follows the locale.
            expect(configuration().editor.apply).toBe(apply);
            expect(configuration().editor.cancel).toBe(enUSLocaleData.timeRange.editor.cancel);
        });
    });
});

@Component({
    imports: [KbqTimeRange],
    template: `
        <kbq-time-range />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponent {}

@Component({
    imports: [KbqTimeRange, ReactiveFormsModule],
    template: `
        <kbq-time-range [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentWithInitial {
    control = new FormControl<KbqTimeRangeRange>({ type: 'currentYear' }, { nonNullable: true });
}

@Component({
    imports: [KbqTimeRange, ReactiveFormsModule],
    template: `
        <kbq-time-range [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentWithRange {
    control = new FormControl<KbqTimeRangeRange>(
        {
            type: 'range',
            startDateTime: '2024-03-01T09:00:00.000Z',
            endDateTime: '2024-03-10T18:00:00.000Z'
        },
        { nonNullable: true }
    );
}

@Component({
    imports: [KbqTimeRange],
    template: `
        <kbq-time-range [minDate]="minDate" [maxDate]="maxDate" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentWithBounds {
    private readonly dateAdapter = inject<DateAdapter<unknown>>(DateAdapter);

    // Entirely in the past, so the stock "yesterday to today" range falls outside of them.
    readonly minDate = this.dateAdapter.createDate(2015, 0, 1);
    readonly maxDate = this.dateAdapter.createDate(2017, 11, 31);
}

@Component({
    imports: [ReactiveFormsModule, KbqTimeRange],
    template: `
        <kbq-time-range [formControl]="control" [availableTimeRangeTypes]="[]" [nonNullable]="false" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentNullableWithoutTypes {
    readonly control = new FormControl<KbqTimeRangeRange | null>(null);
}

@Component({
    imports: [KbqTimeRange],
    template: `
        <kbq-time-range [minDate]="minDate" [maxDate]="maxDate" [availableTimeRangeTypes]="[]" [nonNullable]="false" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentWithBoundsOnly {
    private readonly dateAdapter = inject<DateAdapter<unknown>>(DateAdapter);

    readonly minDate = this.dateAdapter.createDate(2015, 0, 1);
    readonly maxDate = this.dateAdapter.createDate(2017, 11, 31);
}

@Component({
    imports: [KbqTimeRange],
    template: `
        <kbq-time-range [minDate]="minDate" [maxDate]="maxDate" [availableTimeRangeTypes]="['range']" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentWithTimedBounds {
    private readonly dateAdapter = inject<DateAdapter<unknown>>(DateAdapter);

    // Bounds that fall inside their own day, so that "the day is out" and "only the time is out" are
    // distinguishable cases.
    readonly minDate = this.dateAdapter.createDateTime(2015, 0, 1, 9, 0, 0, 0);
    readonly maxDate = this.dateAdapter.createDateTime(2017, 11, 31, 18, 30, 0, 0);
}

@Component({
    imports: [KbqTimeRange],
    template: `
        <kbq-time-range [minDate]="minDate" [maxDate]="maxDate" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentWithMillisecondBounds {
    private readonly dateAdapter = inject<DateAdapter<unknown>>(DateAdapter);
    private readonly nextYear = this.dateAdapter.getYear(this.dateAdapter.today()) + 1;

    // Entirely in the future and carrying milliseconds, the way a `today()`-derived bound does for a
    // real consumer - spelled out rather than derived, so the case does not hinge on the current clock.
    readonly minDate = this.dateAdapter.createDateTime(this.nextYear, 0, 1, 14, 23, 45, 678);
    readonly maxDate = this.dateAdapter.createDateTime(this.nextYear, 11, 31, 14, 23, 45, 678);
}

@Component({
    imports: [KbqTimeRange, ReactiveFormsModule],
    template: `
        <kbq-time-range [availableTimeRangeTypes]="availableTimeRangeTypes()" [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentWithInputs {
    availableTimeRangeTypes = signal<KbqTimeRangeType[]>([
        'lastMinute',
        'last5Minutes',
        'last15Minutes',
        'last30Minutes',
        'lastHour',
        'last24Hours',
        'last3Days',
        'last7Days',
        'last14Days',
        'last30Days',
        'last3Months',
        'last12Months',
        'allTime',
        'currentQuarter',
        'currentYear',
        'range'
    ]);
    control = new FormControl<KbqTimeRangeRange>({ type: this.availableTimeRangeTypes()[0] }, { nonNullable: true });
}

@Component({
    imports: [KbqTimeRange, ReactiveFormsModule],
    template: `
        <kbq-time-range
            [availableTimeRangeTypes]="availableTimeRangeTypes()"
            [nonNullable]="nonNullable()"
            [formControl]="control"
            (valueCorrected)="valueCorrected.set($event)"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentWithValueCorrection {
    availableTimeRangeTypes = signal<KbqTimeRangeType[]>(['lastHour', 'last24Hours', 'range']);
    nonNullable = signal(true);
    control = new FormControl<KbqTimeRangeRange | null>({
        type: 'last24Hours',
        startDateTime: '2024-01-01T00:00:00.000Z'
    });
    valueCorrected = signal<KbqTimeRangeRange | undefined>(undefined);
}

@Component({
    selector: 'time-range-custom-range-types-example',
    imports: [
        ReactiveFormsModule,
        KbqTimeRangeModule,
        LuxonDateModule,
        KbqIconModule,
        KbqFormFieldModule,
        TitleCasePipe
    ],
    template: `
        <ng-template #customOption let-context>
            {{ context.type | titlecase }}
        </ng-template>

        <kbq-time-range [optionTemplate]="customOption" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-flex layout-row layout-align-center-center layout-gap-3xl'
    }
})
export class TestTimeRangeCustomOption {}
