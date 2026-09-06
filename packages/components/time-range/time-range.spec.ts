import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DebugElement, Provider, signal, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { axe } from 'jest-axe';
import { DateTime } from 'luxon';
import { KBQ_CUSTOM_TIME_RANGE_TYPES, KBQ_DEFAULT_TIME_RANGE_TYPES } from './constants';
import {
    KBQ_TIME_RANGE_LOCALE_CONFIGURATION,
    KbqTimeRange,
    kbqTimeRangeLocaleConfigurationProvider
} from './time-range';
import { KbqTimeRangeEditor } from './time-range-editor';
import { KbqTimeRangeTitle } from './time-range-title';
import { KbqTimeRangeTitleAsControl } from './time-range-title-as-form-field';
import { KbqTimeRangeModule } from './time-range.module';
import { KbqCustomTimeRangeType, KbqTimeRangeRange, KbqTimeRangeType } from './types';

/** Jest's own `testTimeout` is 2000 ms, which an axe run does not fit into. */
const axeTimeout = 15000;

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

/** The editor's `form` is protected; the range path cannot be driven without reaching for it. */
type EditorForm = FormGroup<{
    type: FormControl<KbqTimeRangeType>;
    fromTime: FormControl<DateTime>;
    fromDate: FormControl<DateTime>;
    toTime: FormControl<DateTime>;
    toDate: FormControl<DateTime>;
}>;

const getEditorForm = (debugElement: DebugElement): EditorForm => {
    return (getEditorInstance(debugElement) as unknown as { form: EditorForm }).form;
};

const getFooterButtons = (debugElement: DebugElement): HTMLButtonElement[] => {
    return debugElement
        .queryAll(By.css('.kbq-time-range__buttons button'))
        .map((element) => element.nativeElement as HTMLButtonElement);
};

/** Opens the popover and settles the overlay. Must be called inside `fakeAsync`. */
const openPopover = (fixture: ComponentFixture<unknown>): void => {
    getTriggerNativeElement(fixture.debugElement).click();
    tick();
    fixture.detectChanges();
};

describe('KbqTimeRange', () => {
    describe('Component initialization', () => {
        it('should apply default configuration', () => {
            const { debugElement } = setup(TestComponent);

            expect(getTriggerNativeElement(debugElement).textContent?.trim()).toBe('за последний час');
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

            expect(getTriggerNativeElement(debugElement).textContent?.trim()).toBe('за текущий год');
            expect(checkedRadio?.textContent?.trim()).toBe('Текущий год');
        }));

        it('should check range as default if nothing provided', () => {
            const fixture = setup(TestComponentWithInputs);
            const { componentInstance } = fixture;

            expect(componentInstance.control.value.type).toBe('lastMinute');

            componentInstance.availableTimeRangeTypes.set([]);
            fixture.detectChanges();

            expect(componentInstance.control.value.type).toBe('range');
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

            expect(getTriggerNativeElement(debugElement).textContent?.trim()).toBe('за последние 3 минуты');
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
                popoverElement
                    .queryAll(By.css('.kbq-radio__text'))
                    .map((element) => element.nativeElement.textContent.trim())
            ).toEqual([
                'Lasthour',
                'Last24hours',
                'Last3days',
                'Last7days',
                'Last14days',
                'Currentquarter',
                'Currentyear',
                'Alltime',
                'Период'
            ]);
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

    describe('Custom range', () => {
        /** 0-based, the convention `DateAdapter.createDate` uses. */
        const september = 8;

        /**
         * The `to` pair deliberately holds two different days, so a range assembled from the wrong
         * control is visible in the emitted value rather than only in a wrong clock.
         */
        const dates = (adapter: DateAdapter<DateTime>) => ({
            fromDate: adapter.createDateTime(2024, september, 1, 0, 0, 0, 0),
            fromTime: adapter.createDateTime(2024, september, 1, 10, 0, 0, 0),
            toDate: adapter.createDateTime(2024, september, 20, 0, 0, 0, 0),
            toTime: adapter.createDateTime(2024, september, 5, 18, 30, 0, 0)
        });

        it('should emit an end date built from the to-date and the to-time', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { componentInstance, debugElement } = fixture;
            const adapter = TestBed.inject(DateAdapter) as DateAdapter<DateTime>;

            openPopover(fixture);
            getEditorForm(debugElement).patchValue(dates(adapter));
            fixture.detectChanges();

            getFooterButtons(debugElement)[0].click();
            flush();
            fixture.detectChanges();

            expect(componentInstance.control.value?.endDateTime).toBe(
                adapter.toIso8601(adapter.createDateTime(2024, september, 20, 18, 30, 0, 0))
            );
        }));

        it('should emit a start date built from the from-date and the from-time', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { componentInstance, debugElement } = fixture;
            const adapter = TestBed.inject(DateAdapter) as DateAdapter<DateTime>;

            openPopover(fixture);
            getEditorForm(debugElement).patchValue(dates(adapter));
            fixture.detectChanges();

            getFooterButtons(debugElement)[0].click();
            flush();
            fixture.detectChanges();

            expect(componentInstance.control.value?.startDateTime).toBe(
                adapter.toIso8601(adapter.createDateTime(2024, september, 1, 10, 0, 0, 0))
            );
        }));

        it('should block Apply while the range is inverted', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { debugElement } = fixture;
            const adapter = TestBed.inject(DateAdapter) as DateAdapter<DateTime>;
            const { fromDate, fromTime, toDate, toTime } = dates(adapter);

            openPopover(fixture);
            getEditorForm(debugElement).patchValue({
                fromDate: toDate,
                fromTime: toTime,
                toDate: fromDate,
                toTime: fromTime
            });
            fixture.detectChanges();

            expect(getFooterButtons(debugElement)[0].disabled).toBe(true);
        }));

        it('should mark both date fields invalid when the range is inverted', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { debugElement } = fixture;
            const adapter = TestBed.inject(DateAdapter) as DateAdapter<DateTime>;
            const { fromDate, fromTime, toDate, toTime } = dates(adapter);

            openPopover(fixture);
            getEditorForm(debugElement).patchValue({
                fromDate: toDate,
                fromTime: toTime,
                toDate: fromDate,
                toTime: fromTime
            });
            fixture.detectChanges();

            // Four fields: the from/to timepickers and the from/to datepickers.
            expect(debugElement.queryAll(By.css('.kbq-time-range-editor__range .kbq-form-field_invalid')).length).toBe(
                4
            );
        }));

        it('should restore the applied value when the popover is cancelled', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { componentInstance, debugElement } = fixture;
            const adapter = TestBed.inject(DateAdapter) as DateAdapter<DateTime>;
            const applied = componentInstance.control.value;

            openPopover(fixture);
            getEditorForm(debugElement).patchValue(dates(adapter));
            fixture.detectChanges();

            getFooterButtons(debugElement)[1].click();
            flush();
            fixture.detectChanges();

            expect(componentInstance.control.value).toEqual(applied);
        }));
    });

    describe('ControlValueAccessor', () => {
        it('should mark the control touched once the popover closes', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { componentInstance, debugElement } = fixture;

            openPopover(fixture);

            expect(componentInstance.control.touched).toBe(false);

            getFooterButtons(debugElement)[1].click();
            flush();
            fixture.detectChanges();

            expect(componentInstance.control.touched).toBe(true);
        }));

        it('should drop the trigger out of the tab order when the control is disabled', () => {
            const fixture = setup(TestComponentWithRange);
            const { componentInstance, debugElement } = fixture;

            expect(getTriggerNativeElement(debugElement).querySelector('a')!.getAttribute('tabindex')).toBe('0');

            componentInstance.control.disable();
            fixture.detectChanges();

            expect(getTriggerNativeElement(debugElement).querySelector('a')!.getAttribute('tabindex')).toBe('-1');
            expect(debugElement.query(By.directive(KbqTimeRange)).classes['kbq-disabled']).toBe(true);
        });

        it('should not open the popover while the control is disabled', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { componentInstance, debugElement } = fixture;

            componentInstance.control.disable();
            fixture.detectChanges();

            openPopover(fixture);

            expect(getPopoverDebugElement(debugElement)).toBeNull();
        }));

        it('should disable the editor form together with the control', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { componentInstance, debugElement } = fixture;

            openPopover(fixture);

            expect(getEditorForm(debugElement).disabled).toBe(false);

            componentInstance.control.disable();
            fixture.detectChanges();

            expect(getEditorForm(debugElement).disabled).toBe(true);
        }));

        it('should keep the preset-driven disabling after the control is re-enabled', fakeAsync(() => {
            const fixture = setup(TestComponentWithPresets);
            const { componentInstance, debugElement } = fixture;

            openPopover(fixture);

            componentInstance.control.disable();
            fixture.detectChanges();
            componentInstance.control.enable();
            fixture.detectChanges();

            const form = getEditorForm(debugElement);

            expect(form.controls.type.enabled).toBe(true);
            // `lastHour` is selected, so the from/to pair must stay disabled after a blanket enable().
            expect(form.controls.fromDate.disabled).toBe(true);
            expect(form.controls.toDate.disabled).toBe(true);
        }));
    });

    describe('valueCorrected', () => {
        it('should stay silent when the same allTime value is written twice', () => {
            const fixture = setup(TestComponentWithValueCorrection);
            const { componentInstance } = fixture;

            componentInstance.availableTimeRangeTypes.set(['allTime', 'lastHour']);
            fixture.detectChanges();

            componentInstance.corrections.set(0);
            componentInstance.control.setValue({ type: 'allTime' });
            fixture.detectChanges();
            componentInstance.control.setValue({ type: 'allTime' });
            fixture.detectChanges();

            expect(componentInstance.corrections()).toBe(0);
        });

        it('should emit exactly once for a type outside the available list', () => {
            const fixture = setup(TestComponentWithValueCorrection);
            const { componentInstance } = fixture;

            componentInstance.corrections.set(0);
            componentInstance.control.setValue({ type: 'currentYear' });
            fixture.detectChanges();

            expect(componentInstance.corrections()).toBe(1);
        });
    });

    describe('KbqTimeRangeTitleAsControl', () => {
        it('should hand the form field its error state', fakeAsync(() => {
            const fixture = setup(TestComponentAsFormField);
            const { componentInstance, debugElement } = fixture;
            const formField = debugElement.query(By.css('kbq-form-field'));

            expect(formField.classes['kbq-form-field_invalid']).toBeFalsy();

            componentInstance.control.setValue(null);
            componentInstance.control.markAsTouched();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(formField.classes['kbq-form-field_invalid']).toBe(true);
        }));

        it('should report emptiness and requiredness from the bound control', () => {
            const fixture = setup(TestComponentAsFormField);
            const { componentInstance, debugElement } = fixture;
            const control = debugElement.query(By.directive(KbqTimeRangeTitleAsControl))
                .componentInstance as KbqTimeRangeTitleAsControl;

            expect(control.required).toBe(true);
            expect(control.empty).toBe(false);
            expect(control.id).toMatch(/^kbq-time-range-title-as-control-\d+$/);

            componentInstance.control.setValue(null);
            fixture.detectChanges();

            expect(control.empty).toBe(true);
        });
    });

    describe('Accessibility', () => {
        it('should keep the radiogroup free of anything but radios', fakeAsync(() => {
            const fixture = setup(TestComponentWithPresets);
            const { debugElement } = fixture;

            openPopover(fixture);

            const radioGroup = debugElement.query(By.css('kbq-radio-group')).nativeElement as HTMLElement;

            expect(radioGroup.querySelectorAll('input:not(.kbq-radio-input)').length).toBe(0);
            expect(radioGroup.querySelectorAll('kbq-form-field').length).toBe(0);
        }));

        it('should name each date and time field with its from/to prefix', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { debugElement } = fixture;

            openPopover(fixture);

            const range = debugElement.query(By.css('.kbq-time-range-editor__range')).nativeElement as HTMLElement;
            const prefixes = Array.from(range.querySelectorAll('.kbq-time-range-editor__date-time-prefix'));
            const inputs = Array.from(range.querySelectorAll<HTMLInputElement>('input'));

            expect(prefixes.map((prefix) => prefix.id)).toEqual([
                expect.stringMatching(/^kbq-time-range-editor-from-\d+$/),
                expect.stringMatching(/^kbq-time-range-editor-to-\d+$/)
            ]);
            // Both fields of a pair take the prefix as part of their accessible name.
            expect(inputs.map((input) => input.getAttribute('aria-labelledby'))).toEqual([
                prefixes[0].id,
                prefixes[0].id,
                prefixes[1].id,
                prefixes[1].id
            ]);
            expect(range.getAttribute('aria-label')).toBe(ruRULocaleData.timeRange.editor.rangeLabel);
        }));

        it('should not wrap the popover actions in an unnamed group', fakeAsync(() => {
            const fixture = setup(TestComponentWithRange);
            const { debugElement } = fixture;

            openPopover(fixture);

            expect(
                debugElement.query(By.css('.kbq-time-range__buttons')).nativeElement.getAttribute('role')
            ).toBeNull();
        }));

        it(
            'should have no axe violations with the editor open',
            async () => {
                const fixture = setup(TestComponentWithPresets);
                const { debugElement } = fixture;

                getTriggerNativeElement(debugElement).click();
                await fixture.whenStable();
                fixture.detectChanges();

                const editor = debugElement.query(By.directive(KbqTimeRangeEditor)).nativeElement;

                expect(await axe(editor)).toHaveNoViolations();
            },
            axeTimeout
        );
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
            (valueCorrected)="onValueCorrected($event)"
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
    corrections = signal(0);

    onValueCorrected(value: KbqTimeRangeRange): void {
        this.valueCorrected.set(value);
        this.corrections.update((count) => count + 1);
    }
}

@Component({
    imports: [KbqTimeRange, ReactiveFormsModule],
    template: `
        <kbq-time-range [availableTimeRangeTypes]="['range']" [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentWithRange {
    control = new FormControl<KbqTimeRangeRange>({ type: 'range' }, { nonNullable: true });
}

@Component({
    imports: [KbqTimeRange, ReactiveFormsModule],
    template: `
        <kbq-time-range [availableTimeRangeTypes]="['lastHour', 'last24Hours', 'range']" [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentWithPresets {
    control = new FormControl<KbqTimeRangeRange>({ type: 'lastHour' }, { nonNullable: true });
}

@Component({
    imports: [KbqTimeRangeModule, ReactiveFormsModule, KbqFormFieldModule],
    template: `
        <ng-template #titleAsFormField let-context>
            <kbq-form-field>
                <kbq-time-range-title-as-control>{{ context.formattedDate }}</kbq-time-range-title-as-control>
            </kbq-form-field>
        </ng-template>

        <kbq-time-range [titleTemplate]="titleAsFormField" [nonNullable]="false" [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponentAsFormField {
    control = new FormControl<KbqTimeRangeRange | null>({ type: 'lastHour' }, [Validators.required]);
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
