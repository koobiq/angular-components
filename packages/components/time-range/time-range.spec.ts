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

const getInvalidFieldCount = (debugElement: DebugElement): number => {
    return getRangeElement(debugElement).querySelectorAll('.kbq-form-field_invalid').length;
};

const dispatchFocusOut = (element: HTMLElement, relatedTarget: HTMLElement | null): void => {
    element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget }));
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

        it('should apply the swapped range when focus moves straight to the apply button', fakeAsync(() => {
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

            const startDay = dateAdapter.getDate(form.value.fromDate);
            const endDay = dateAdapter.getDate(form.value.toDate);

            getApplyButton().click();
            tick();
            fixture.detectChanges();

            const { startDateTime, endDateTime } = componentInstance.control.value;
            const start = dateAdapter.deserialize(startDateTime!);
            const end = dateAdapter.deserialize(endDateTime!);

            expect([dateAdapter.getDate(start), dateAdapter.getDate(end)]).toEqual([startDay, endDay]);
            expect(dateAdapter.compareDateTime(start, end)).toBeLessThan(0);
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

            const { minDate, maxDate } = componentInstance;

            expect(getInvalidFieldCount(debugElement)).toBe(0);
            expect(form.valid).toBe(true);

            [form.value.fromDate, form.value.toDate].forEach((value) => {
                expect(dateAdapter.compareDateTime(value, minDate)).toBeGreaterThanOrEqual(0);
                expect(dateAdapter.compareDateTime(value, maxDate)).toBeLessThanOrEqual(0);
            });
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
