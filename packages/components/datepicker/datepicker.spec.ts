import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
    Component,
    FactoryProvider,
    inject as inject_1,
    LOCALE_ID,
    Provider,
    Type,
    ValueProvider,
    viewChild
} from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import {
    AsyncValidatorFn,
    FormControl,
    FormControlStatus,
    FormGroup,
    FormsModule,
    NgModel,
    ReactiveFormsModule,
    UntypedFormControl,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { KBQ_LUXON_DATE_FORMATS, KbqLuxonDateModule, LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    createKeyboardEvent,
    DateAdapter,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    DOWN_ARROW,
    ENTER,
    ErrorStateMatcher,
    ESCAPE,
    KBQ_DATE_FORMATS,
    KBQ_DATE_LOCALE,
    kbqErrorStateMatcherProvider,
    kbqLocaleIDProvider,
    kbqLocaleServiceProvider,
    ONE,
    ShowOnControlDirtyErrorStateMatcher,
    ShowOnFormSubmitErrorStateMatcher,
    SPACE,
    UP_ARROW
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqModalModule, KbqModalService, MODAL_ANIMATE_DURATION } from '@koobiq/components/modal';
import { DateTime } from 'luxon';
import { map, Observable, timer } from 'rxjs';
import type { MockInstance } from 'vitest';
import { KbqInputModule } from '../input/index';
import { KbqDatepickerInput, KbqDatepickerInputEvent } from './datepicker-input.directive';
import { KbqDatepickerToggleIconComponent } from './datepicker-toggle.component';
import { KbqDatepicker } from './datepicker.component';
import { KbqDatepickerModule } from './index';

const getDatepickerInputElement = (fixture: ComponentFixture<unknown>): HTMLInputElement =>
    fixture.debugElement.query(By.directive(KbqDatepickerInput)).nativeElement;

const getDatepickerNgModel = (fixture: ComponentFixture<unknown>): NgModel =>
    fixture.debugElement.query(By.directive(KbqDatepickerInput)).injector.get(NgModel);

/** Drives the masking engine the way a keystroke does. Call with fake timers. */
const typeIntoDatepickerInput = async (fixture: ComponentFixture<unknown>, value: string) => {
    const inputElement = getDatepickerInputElement(fixture);

    inputElement.value = value;
    dispatchKeyboardEvent(inputElement, 'keydown', ONE);
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    await vi.runOnlyPendingTimersAsync();
    fixture.detectChanges();
};

/** Feeds a clipboard payload to the directive's `(paste)` handler. Call with fake timers. */
const pasteIntoDatepickerInput = async (fixture: ComponentFixture<unknown>, value: string) => {
    fixture.debugElement.query(By.directive(KbqDatepickerInput)).triggerEventHandler('paste', {
        preventDefault: () => null,
        clipboardData: { getData: () => value }
    });
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    await vi.runOnlyPendingTimersAsync();
    fixture.detectChanges();
};

const getSubmitButton = (fixture: ComponentFixture<unknown>): HTMLButtonElement =>
    fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;

const getDatepickerToggleIconElement = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.debugElement.query(By.css('kbq-datepicker-toggle-icon i[kbq-icon-button]')).nativeElement;

/** A primary-button click the way a browser delivers it: the press moves the focus unless it is prevented. */
const clickWithMouse = (element: HTMLElement): void => {
    const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });

    element.dispatchEvent(mousedown);

    if (!mousedown.defaultPrevented) {
        const focusable = element.closest<HTMLElement>('[tabindex], button, input');

        if (focusable) {
            focusable.focus();
        } else {
            (document.activeElement as HTMLElement | null)?.blur();
        }
    }

    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    element.click();
};

const customErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control) => !!control?.untouched
};

@Component({
    imports: [KbqDatepickerModule, ReactiveFormsModule, KbqLuxonDateModule],
    template: `
        <form [formGroup]="form">
            <kbq-form-field>
                <input formControlName="date" [kbqDatepicker]="d" [errorStateMatcher]="errorStateMatcher" />
                <kbq-datepicker-toggle-icon kbqSuffix [for]="d" />
                <kbq-datepicker #d />
            </kbq-form-field>
            <button type="submit">Submit</button>
        </form>
    `
})
class DatepickerWithErrorStateMatcher {
    readonly datepickerInput = viewChild.required(KbqDatepickerInput);
    readonly datepickerToggle = viewChild.required(KbqDatepickerToggleIconComponent);
    readonly form = new FormGroup({ date: new FormControl<DateTime | null>(null, Validators.required) });
    errorStateMatcher: ErrorStateMatcher = new ErrorStateMatcher();
}

@Component({
    imports: [KbqDatepickerModule, ReactiveFormsModule, KbqLuxonDateModule],
    template: `
        <form [formGroup]="form">
            <kbq-form-field>
                <input formControlName="date" [kbqDatepicker]="d" />
                <kbq-datepicker #d />
            </kbq-form-field>
        </form>
    `,
    providers: [
        kbqErrorStateMatcherProvider(customErrorStateMatcher)
    ]
})
class DatepickerWithDIErrorStateMatcher {
    readonly datepickerInput = viewChild.required(KbqDatepickerInput);
    readonly form = new FormGroup({ date: new FormControl<DateTime | null>(null, Validators.required) });
}

const ASYNC_VALIDATOR_TIMER_DUE = 1000;

const getAsyncValidator =
    (valid: boolean = true): AsyncValidatorFn =>
    (): Observable<ValidationErrors | null> =>
        timer(ASYNC_VALIDATOR_TIMER_DUE).pipe(map(() => (!valid ? { test: { actual: valid } } : null)));

@Component({
    imports: [KbqDatepickerModule, KbqFormFieldModule, ReactiveFormsModule, KbqLuxonDateModule],
    template: `
        <kbq-form-field>
            <input [kbqDatepicker]="d" [formControl]="control" />
            <kbq-datepicker #d />
        </kbq-form-field>
    `
})
class DatepickerControlWithAsyncValidators {
    readonly datepickerInput = viewChild.required(KbqDatepickerInput);
    readonly control = new FormControl<DateTime | null>(null, {
        asyncValidators: [getAsyncValidator()]
    });
}

describe('KbqDatepicker', () => {
    // Creates a test component fixture.
    function createComponent<T>(
        component: Type<T>,
        imports: Type<any>[] = [],
        providers: (FactoryProvider | ValueProvider)[] = [],
        entryComponents: Type<any>[] = []
    ): ComponentFixture<T> {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                KbqDatepickerModule,
                KbqFormFieldModule,
                KbqInputModule,
                ReactiveFormsModule,
                ...imports,
                component,
                ...entryComponents
            ],
            providers: [
                { provide: KBQ_DATE_FORMATS, useValue: KBQ_LUXON_DATE_FORMATS },
                ...providers
            ]
        });

        TestBed.overrideModule(BrowserDynamicTestingModule, {}).compileComponents();

        return TestBed.createComponent(component);
    }

    afterEach(() => {
        vi.useRealTimers();
    });

    afterEach(inject([OverlayContainer], (container: OverlayContainer) => {
        container.ngOnDestroy();
    }));

    describe('with KbqLuxonDateModule', () => {
        describe('standard datepicker', () => {
            let fixture: ComponentFixture<StandardDatepicker>;
            let testComponent: StandardDatepicker;

            beforeEach(() => {
                vi.useFakeTimers();
                fixture = createComponent(StandardDatepicker, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            });

            afterEach(async () => {
                testComponent.datepicker().close();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
            });

            it('should focus input after close', async () => {
                const input = testComponent.datepicker().datepickerInput.elementRef.nativeElement;

                input.focus();

                testComponent.datepicker().open();
                fixture.detectChanges();

                testComponent.datepicker().close(true);
                fixture.detectChanges();

                await vi.runOnlyPendingTimersAsync();

                expect(document.activeElement).toBe(input);
            });

            it('open non-touch should open popup', () => {
                expect(document.querySelector('.cdk-overlay-pane.kbq-datepicker__popup')).toBeNull();

                testComponent.datepicker().open();
                fixture.detectChanges();

                expect(document.querySelector('.cdk-overlay-pane.kbq-datepicker__popup')).not.toBeNull();
            });

            it('should open datepicker if opened input is set to true', async () => {
                testComponent.opened = true;
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(document.querySelector('.kbq-datepicker__content')).not.toBeNull();

                testComponent.opened = false;
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(document.querySelector('.kbq-datepicker__content')).toBeNull();
            });

            it('open in disabled mode should not open the calendar', () => {
                testComponent.disabled = true;
                fixture.detectChanges();

                expect(document.querySelector('.cdk-overlay-pane')).toBeNull();

                testComponent.datepicker().open();
                fixture.detectChanges();

                expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
            });

            it('disabled datepicker input should open the calendar if datepicker is enabled', () => {
                testComponent.datepicker().disabled = false;
                testComponent.datepickerInput().disabled.set(true);
                fixture.detectChanges();

                expect(document.querySelector('.cdk-overlay-pane')).toBeNull();

                testComponent.datepicker().open();
                fixture.detectChanges();

                expect(document.querySelector('.cdk-overlay-pane')).not.toBeNull();
            });

            it('close should close popup', async () => {
                testComponent.datepicker().open();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                const popup = document.querySelector('.cdk-overlay-pane')!;

                expect(popup).not.toBeNull();
                expect(parseInt(getComputedStyle(popup).height as string)).not.toBe(0);

                testComponent.datepicker().close();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(getComputedStyle(popup).height).toBe('');
            });

            it('should close the popup when pressing ESCAPE', async () => {
                testComponent.datepicker().open();
                fixture.detectChanges();

                expect(testComponent.datepicker().opened).toBe(true);

                dispatchKeyboardEvent(fixture.nativeElement.querySelector('input'), 'keydown', ESCAPE);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(testComponent.datepicker().opened).toBe(false);
            });

            it('should stay open when opened again before the closing has finished', async () => {
                const datepicker = testComponent.datepicker();
                const closed = vi.fn();

                datepicker.closedStream.subscribe(closed);

                datepicker.open();
                fixture.detectChanges();

                datepicker.close();
                datepicker.open();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(datepicker.opened).toBe(true);
                expect(document.querySelector('.kbq-datepicker__content')).not.toBeNull();
                expect(closed).toHaveBeenCalledTimes(1);
            });

            it('clicking the currently selected date should close the calendar without firing selectedChanged', async () => {
                const nextSpyFn = vi.spyOn(testComponent.datepicker().selectedChanged, 'next');

                for (let changeCount = 1; changeCount < 3; changeCount++) {
                    const currentDay = changeCount;

                    testComponent.datepicker().open();
                    fixture.detectChanges();

                    expect(document.querySelector('kbq-datepicker__content')).not.toBeNull();

                    const datepickerInput = testComponent.datepickerInput();

                    expect(datepickerInput.value()?.toISO()).toEqual(DateTime.local(2020, 1, currentDay).toISO());

                    const cells = document.querySelectorAll('.kbq-calendar__body-cell');

                    dispatchMouseEvent(cells[1], 'click');
                    fixture.detectChanges();
                    await vi.runOnlyPendingTimersAsync();
                }

                expect(nextSpyFn).toHaveBeenCalledTimes(1);

                expect(testComponent.datepickerInput().value()?.toISO()).toEqual(DateTime.local(2020, 1, 2).toISO());
            });

            // The calendar handles no keys: the input's keydown is the only listener, and it ignores ENTER.
            it.skip('pressing enter on the currently selected date should close the calendar without firing selectedChanged', async () => {
                const nextSpyFn = vi.spyOn(testComponent.datepicker().selectedChanged, 'next');

                testComponent.datepicker().open();
                fixture.detectChanges();

                const calendarBodyEl = document.querySelector('.kbq-calendar__body') as HTMLElement;

                expect(calendarBodyEl).not.toBeNull();
                expect(testComponent.datepickerInput().value?.toISO()).toEqual(DateTime.local(2020, 1, 1).toISO());

                dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
                fixture.detectChanges();
                await fixture.whenStable();

                expect(testComponent.datepicker().opened).toBe(false);
                expect(nextSpyFn).toHaveBeenCalledTimes(0);
                expect(testComponent.datepickerInput().value?.toISO()).toEqual(DateTime.local(2020, 1, 1).toISO());
            });

            it('startAt should fallback to input value', () => {
                expect(testComponent.datepicker().startAt?.toISO()).toEqual(DateTime.local(2020, 1, 1).toISO());
            });

            it('should not throw when given wrong data type', () => {
                testComponent.date = '1/1/2017' as any;

                expect(() => fixture.detectChanges()).not.toThrow();
            });

            it('should clear out the backdrop subscriptions on close', async () => {
                for (let i = 0; i < 3; i++) {
                    testComponent.datepicker().open();
                    fixture.detectChanges();

                    testComponent.datepicker().close();
                    fixture.detectChanges();
                }

                testComponent.datepicker().open();
                fixture.detectChanges();

                const spy = vi.fn();
                const subscription = testComponent.datepicker().closedStream.subscribe(spy);

                document.body.click();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(spy).toHaveBeenCalledTimes(1);
                expect(testComponent.datepicker().opened).toBe(false);
                subscription.unsubscribe();
            });

            it('should reset the datepicker when it is closed externally', inject(
                [OverlayContainer],
                async (oldOverlayContainer: OverlayContainer) => {
                    // Destroy the old container manually since resetting the testing module won't do it.
                    oldOverlayContainer.ngOnDestroy();
                    TestBed.resetTestingModule();

                    // Stub out a `CloseScrollStrategy` so we can trigger a detachment via the `OverlayRef`.
                    fixture = createComponent(StandardDatepicker, [KbqLuxonDateModule]);

                    fixture.detectChanges();
                    testComponent = fixture.componentInstance;

                    testComponent.datepicker().open();
                    fixture.detectChanges();

                    expect(testComponent.datepicker().opened).toBe(true);

                    document.body.click();
                    await vi.runOnlyPendingTimersAsync();
                    fixture.detectChanges();

                    expect(testComponent.datepicker().opened).toBe(false);
                }
            ));

            it('should close the datepicker using ALT + UP_ARROW', async () => {
                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                testComponent.datepicker().open();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(testComponent.datepicker().opened).toBe(true);

                const event = createKeyboardEvent('keydown', UP_ARROW);

                Object.defineProperty(event, 'altKey', { get: () => true });

                dispatchEvent(inputEl, event);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(testComponent.datepicker().opened).toBe(false);
                expect(event.defaultPrevented).toBe(true);
            });

            it('should open the datepicker using ALT + DOWN_ARROW', async () => {
                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                expect(testComponent.datepicker().opened).toBe(false);

                const event = createKeyboardEvent('keydown', DOWN_ARROW);

                Object.defineProperty(event, 'altKey', { get: () => true });

                dispatchEvent(inputEl, event);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(testComponent.datepicker().opened).toBe(true);
                expect(event.defaultPrevented).toBe(true);
            });

            it('should not open for ALT + DOWN_ARROW on readonly input', async () => {
                const input = fixture.nativeElement.querySelector('input');

                expect(testComponent.datepicker().opened).toBe(false);

                input.setAttribute('readonly', 'true');

                const event = createKeyboardEvent('keydown', DOWN_ARROW);

                Object.defineProperty(event, 'altKey', { get: () => true });

                dispatchEvent(input, event);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(testComponent.datepicker().opened).toBe(false);
                expect(event.defaultPrevented).toBe(false);
            });
        });

        describe('caret handling', () => {
            const charWidth = 10;
            const padding = 8;
            const clientWidth = 60;
            const value = '24.01.2026';

            let fixture: ComponentFixture<StandardDatepicker>;
            let input: HTMLInputElement;
            let scrollLeft: number;

            // jsdom lays nothing out, so the metrics the reveal reads have to be supplied.
            const stubMetrics = () => {
                vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockImplementation(function (this: Element) {
                    return (this.textContent || '').length * charWidth;
                });
                Object.defineProperty(input, 'scrollWidth', {
                    value: value.length * charWidth + padding * 2,
                    configurable: true
                });
                Object.defineProperty(input, 'clientWidth', { value: clientWidth, configurable: true });
                Object.defineProperty(input, 'scrollLeft', {
                    get: () => scrollLeft,
                    set: (offset: number) => (scrollLeft = offset),
                    configurable: true
                });
            };

            beforeEach(() => {
                fixture = createComponent(StandardDatepicker, [KbqLuxonDateModule]);
                fixture.detectChanges();

                input = getDatepickerInputElement(fixture);
                input.style.padding = `0 ${padding}px`;
                input.value = value;
                scrollLeft = 0;
                input.focus();
            });

            // `clearMocks` only clears call records, so the prototype patch has to be undone by hand.
            afterEach(() => vi.restoreAllMocks());

            it('should advance from the digit before a separator, not the one after it', async () => {
                vi.useFakeTimers();

                input.setSelectionRange(3, 3);

                fixture.componentInstance.datepickerInput().onInput();
                await vi.advanceTimersByTimeAsync(0);

                // Corrected back onto the day, so the month follows; uncorrected it would skip to the year.
                expect([input.selectionStart, input.selectionEnd]).toEqual([3, 5]);
            });

            it('should scroll the part the caret moves to into view', async () => {
                vi.useFakeTimers();

                stubMetrics();

                // The caret sits at the end of the day, so the month is the part it moves on to.
                input.setSelectionRange(2, 2);

                fixture.componentInstance.datepickerInput().onInput();
                await vi.advanceTimersByTimeAsync(0);

                expect([input.selectionStart, input.selectionEnd]).toEqual([3, 5]);
                // Just enough to show the end of the month: neither end of the value.
                expect(input.scrollLeft).toBe(padding + 5 * charWidth + padding - clientWidth);
            });
        });

        describe('datepicker with too many inputs', () => {
            it('should throw when multiple inputs registered', async () => {
                vi.useFakeTimers();

                const fixture = createComponent(MultiInputDatepicker, [KbqLuxonDateModule]);

                expect(() => fixture.detectChanges()).toThrow();
            });
        });

        describe('datepicker that is assigned to input at a later point', () => {
            it('should not throw on ALT + DOWN_ARROW for input without datepicker', async () => {
                vi.useFakeTimers();

                const fixture = createComponent(DelayedDatepicker, [KbqLuxonDateModule]);

                fixture.detectChanges();

                expect(() => {
                    const event = createKeyboardEvent('keydown', DOWN_ARROW);

                    Object.defineProperty(event, 'altKey', { get: () => true });
                    dispatchEvent(fixture.nativeElement.querySelector('input'), event);
                    fixture.detectChanges();
                    vi.runOnlyPendingTimers();
                }).not.toThrow();
            });

            it('should handle value changes when a datepicker is assigned after init', async () => {
                vi.useFakeTimers();

                const fixture = createComponent(DelayedDatepicker, [KbqLuxonDateModule]);
                const testComponent: DelayedDatepicker = fixture.componentInstance;
                const toSelect = DateTime.local(2017, 1, 1);

                fixture.detectChanges();

                expect(testComponent.datepickerInput().value()).toBeNull();
                expect(testComponent.datepicker().selected).toBeNull();

                testComponent.assignedDatepicker = testComponent.datepicker();
                fixture.detectChanges();

                testComponent.assignedDatepicker.select(toSelect);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(testComponent.datepickerInput().value()?.toISO()).toEqual(toSelect.toISO());
                expect(testComponent.datepicker().selected?.toISO()).toEqual(toSelect.toISO());
            });
        });

        describe('datepicker with no inputs', () => {
            let fixture: ComponentFixture<NoInputDatepicker>;
            let testComponent: NoInputDatepicker;

            beforeEach(() => {
                fixture = createComponent(NoInputDatepicker, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            });

            afterEach(() => {
                testComponent.datepicker().close();
                fixture.detectChanges();
            });

            it('should not throw when accessing disabled property', () => {
                expect(() => testComponent.datepicker().disabled).not.toThrow();
            });

            it('should throw when opened with no registered inputs', async () => {
                vi.useFakeTimers();

                expect(() => testComponent.datepicker().open()).toThrow();
            });
        });

        describe('datepicker with startAt', () => {
            let fixture: ComponentFixture<DatepickerWithStartAt>;
            let testComponent: DatepickerWithStartAt;

            beforeEach(() => {
                fixture = createComponent(DatepickerWithStartAt, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            });

            afterEach(() => {
                testComponent.datepicker().close();
                fixture.detectChanges();
            });

            it('explicit startAt should override input value', () => {
                expect(testComponent.datepicker().startAt?.toISO()).toEqual(DateTime.local(2010, 1, 1).toISO());
            });
        });

        describe('datepicker with ngModel', () => {
            let fixture: ComponentFixture<DatepickerWithNgModel>;
            let testComponent: DatepickerWithNgModel;

            beforeEach(() => {
                fixture = createComponent(DatepickerWithNgModel, [KbqLuxonDateModule]);
                fixture.detectChanges();

                fixture.whenStable().then(() => {
                    fixture.detectChanges();

                    testComponent = fixture.componentInstance;
                });
            });

            afterEach(() => {
                testComponent.datepicker().close();
                fixture.detectChanges();
            });

            it('should update datepicker when model changes', async () => {
                vi.useFakeTimers();

                expect(testComponent.datepickerInput().value()).toBeNull();
                expect(testComponent.datepicker().selected).toBeNull();

                const selected = DateTime.local(2017, 1, 1);

                testComponent.selected = selected;
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(testComponent.datepickerInput().value()?.toISO()).toEqual(selected?.toISO());
                expect(testComponent.datepicker().selected?.toISO()).toEqual(selected?.toISO());
            });

            it('should update model when date is selected', async () => {
                vi.useFakeTimers();

                expect(testComponent.selected).toBeNull();
                expect(testComponent.datepickerInput().value()).toBeNull();

                const selected = DateTime.local(2017, 1, 1);

                testComponent.datepicker().select(selected);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(testComponent.selected).toEqual(selected);
                expect(testComponent.datepickerInput().value()).toEqual(selected);
            });

            it('should mark input dirty after input', async () => {
                vi.useFakeTimers();

                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                expect(inputEl.classList).toContain('ng-pristine');

                inputEl.value = '01.01.2001';
                dispatchKeyboardEvent(inputEl, 'keydown', SPACE);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(inputEl.classList).toContain('ng-dirty');
            });

            it('should mark input dirty after date selected', async () => {
                vi.useFakeTimers();

                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                expect(inputEl.classList).toContain('ng-pristine');

                testComponent.datepicker().select(DateTime.local(2017, 1, 1));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(inputEl.classList).toContain('ng-dirty');
            });

            it('should not mark dirty after model change', async () => {
                vi.useFakeTimers();

                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                expect(inputEl.classList).toContain('ng-pristine');

                testComponent.selected = DateTime.local(2017, 1, 1);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(inputEl.classList).toContain('ng-pristine');
            });

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

            it('should mark input touched on calendar selection', async () => {
                vi.useFakeTimers();

                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                expect(inputEl.classList).toContain('ng-untouched');

                testComponent.datepicker().select(DateTime.local(2017, 1, 1));
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(inputEl.classList).toContain('ng-touched');
            });

            it('should save time part of model when date is selected', async () => {
                vi.useFakeTimers();

                const originDateTime = testComponent.adapter.createDateTime(2017, 1, 1, 1, 1, 10, 100);

                testComponent.datepicker().select(originDateTime);

                expect(testComponent.adapter.toIso8601(testComponent.selected as DateTime)).toEqual(
                    testComponent.adapter.toIso8601(originDateTime as DateTime)
                );

                const newDate = testComponent.adapter.createDate(2018, 1, 1);

                testComponent.datepicker().select(newDate);

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
            });
        });

        describe('datepicker with formControl', () => {
            let fixture: ComponentFixture<DatepickerWithFormControl>;
            let testComponent: DatepickerWithFormControl;

            beforeEach(() => {
                fixture = createComponent(DatepickerWithFormControl, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            });

            afterEach(() => {
                testComponent.datepicker().close();
                fixture.detectChanges();
            });

            it('should update datepicker when formControl changes', () => {
                expect(testComponent.datepickerInput().value()).toBeNull();
                expect(testComponent.datepicker().selected).toBeNull();

                const selected = DateTime.local(2017, 1, 1);

                testComponent.formControl.setValue(selected);
                fixture.detectChanges();

                expect(testComponent.datepickerInput().value()?.toISO()).toEqual(selected?.toISO());
                expect(testComponent.datepicker().selected?.toISO()).toEqual(selected?.toISO());
            });

            it('should update formControl when date is selected', () => {
                expect(testComponent.formControl.value).toBeNull();
                expect(testComponent.datepickerInput().value()).toBeNull();

                const selected = DateTime.local(2017, 1, 1);

                testComponent.datepicker().select(selected);
                fixture.detectChanges();

                expect(testComponent.formControl.value).toEqual(selected);
                expect(testComponent.datepickerInput().value()).toEqual(selected);
            });

            it('should disable input when form control disabled', () => {
                const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                expect(inputEl.disabled).toBe(false);

                testComponent.formControl.disable();
                fixture.detectChanges();

                expect(inputEl.disabled).toBe(true);
            });

            it('should disable toggle when form control disabled', () => {
                expect(testComponent.datepickerToggle().disabled).toBe(false);

                testComponent.formControl.disable();
                fixture.detectChanges();

                expect(testComponent.datepickerToggle().disabled).toBe(true);
            });
        });

        describe('ErrorStateMatcher', () => {
            describe(ErrorStateMatcher.name, () => {
                it('should not be in error state initially when invalid but untouched', () => {
                    const fixture = createComponent(DatepickerWithErrorStateMatcher, [KbqLuxonDateModule]);

                    fixture.detectChanges();

                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(false);
                });

                it('should be in error state when invalid and touched', () => {
                    const fixture = createComponent(DatepickerWithErrorStateMatcher, [KbqLuxonDateModule]);

                    fixture.componentInstance.form.controls.date.markAsTouched();
                    fixture.detectChanges();

                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(true);
                });

                it('should apply kbq-error class to the datepicker toggle icon when invalid and touched', () => {
                    const fixture = createComponent(DatepickerWithErrorStateMatcher, [KbqLuxonDateModule]);

                    fixture.detectChanges();

                    expect(getDatepickerToggleIconElement(fixture).classList.contains('kbq-error')).toBe(false);

                    fixture.componentInstance.form.controls.date.markAsTouched();
                    fixture.detectChanges();

                    expect(getDatepickerToggleIconElement(fixture).classList.contains('kbq-error')).toBe(true);
                });

                it('should be in error state when form is submitted and control is invalid', () => {
                    const fixture = createComponent(DatepickerWithErrorStateMatcher, [KbqLuxonDateModule]);

                    // Bind [formGroup] first: submitting an unbound FormGroupDirective throws.
                    fixture.detectChanges();
                    getSubmitButton(fixture).click();
                    fixture.detectChanges();

                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(true);
                });

                it('should call errorStateMatcher and update errorState on blur', () => {
                    const fixture = createComponent(DatepickerWithErrorStateMatcher, [KbqLuxonDateModule]);

                    fixture.detectChanges();

                    const spy = vi.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                    expect(spy).not.toHaveBeenCalled();
                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(false);

                    // focus first so that subsequent blur triggers focusChanged and marks control as touched
                    getDatepickerInputElement(fixture).dispatchEvent(new Event('focus'));
                    getDatepickerInputElement(fixture).dispatchEvent(new Event('blur'));
                    fixture.detectChanges();

                    expect(spy).toHaveBeenCalled();
                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(true);
                });
            });

            describe(ShowOnFormSubmitErrorStateMatcher.name, () => {
                it('should not be in error state when invalid and touched but form not submitted', () => {
                    const fixture = createComponent(DatepickerWithErrorStateMatcher, [KbqLuxonDateModule]);

                    fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
                    fixture.componentInstance.form.controls.date.markAsTouched();
                    fixture.detectChanges();

                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(false);
                });

                it('should be in error state after form is submitted when invalid', () => {
                    const fixture = createComponent(DatepickerWithErrorStateMatcher, [KbqLuxonDateModule]);

                    fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
                    fixture.detectChanges();

                    getSubmitButton(fixture).click();
                    fixture.detectChanges();

                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(true);
                });

                it('should call errorStateMatcher and NOT update errorState on blur', () => {
                    const fixture = createComponent(DatepickerWithErrorStateMatcher, [KbqLuxonDateModule]);

                    fixture.detectChanges();

                    fixture.componentInstance.errorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
                    fixture.detectChanges();

                    const spy = vi.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                    expect(spy).not.toHaveBeenCalled();
                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(false);

                    getDatepickerInputElement(fixture).dispatchEvent(new Event('focus'));
                    getDatepickerInputElement(fixture).dispatchEvent(new Event('blur'));
                    fixture.detectChanges();

                    expect(spy).toHaveBeenCalled();
                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(false);
                });
            });

            describe(ShowOnControlDirtyErrorStateMatcher.name, () => {
                it('should not be in error state when invalid but pristine', () => {
                    const fixture = createComponent(DatepickerWithErrorStateMatcher, [KbqLuxonDateModule]);

                    fixture.componentInstance.errorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();
                    fixture.detectChanges();

                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(false);
                });

                it('should be in error state when invalid and dirty', () => {
                    const fixture = createComponent(DatepickerWithErrorStateMatcher, [KbqLuxonDateModule]);

                    fixture.componentInstance.errorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();
                    fixture.componentInstance.form.controls.date.markAsDirty();
                    fixture.detectChanges();

                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(true);
                });

                it('should call errorStateMatcher and NOT update errorState on blur', () => {
                    const fixture = createComponent(DatepickerWithErrorStateMatcher, [KbqLuxonDateModule]);

                    fixture.detectChanges();

                    fixture.componentInstance.errorStateMatcher = new ShowOnControlDirtyErrorStateMatcher();
                    fixture.detectChanges();

                    const spy = vi.spyOn(fixture.componentInstance.errorStateMatcher, 'isErrorState');

                    expect(spy).not.toHaveBeenCalled();
                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(false);

                    getDatepickerInputElement(fixture).dispatchEvent(new Event('focus'));
                    getDatepickerInputElement(fixture).dispatchEvent(new Event('blur'));
                    fixture.detectChanges();

                    expect(spy).toHaveBeenCalled();
                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(false);
                });
            });

            describe('custom ErrorStateMatcher', () => {
                it('should override errorStateMatcher via kbqErrorStateMatcherProvider', () => {
                    const fixture = createComponent(DatepickerWithDIErrorStateMatcher, [KbqLuxonDateModule]);

                    fixture.detectChanges();

                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(true);

                    fixture.componentInstance.form.controls.date.markAsTouched();
                    fixture.detectChanges();

                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(false);
                });

                it('should use custom errorStateMatcher', () => {
                    const fixture = createComponent(DatepickerWithErrorStateMatcher, [KbqLuxonDateModule]);

                    fixture.componentInstance.errorStateMatcher = customErrorStateMatcher;
                    fixture.detectChanges();

                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(true);

                    fixture.componentInstance.form.controls.date.markAsTouched();
                    fixture.detectChanges();

                    expect(fixture.componentInstance.datepickerInput().errorState()).toBe(false);
                });
            });
        });

        describe('async validation', () => {
            it('should emit VALID via statusChanges on blur', async () => {
                vi.useFakeTimers();

                const fixture = createComponent(DatepickerControlWithAsyncValidators, [KbqLuxonDateModule]);

                fixture.detectChanges();

                const { datepickerInput, control } = fixture.componentInstance;
                const statuses: FormControlStatus[] = [];

                const subscription = control.statusChanges!.subscribe((status) => statuses.push(status));

                control.setValue(DateTime.local(2020, 1, 1));

                expect(control.status).toBe('PENDING');
                expect(statuses).toEqual(['PENDING']);

                await vi.advanceTimersByTimeAsync(ASYNC_VALIDATOR_TIMER_DUE);

                expect(control.status).toBe('VALID');
                expect(statuses).toEqual(['PENDING', 'VALID']);

                datepickerInput().onBlur();
                await vi.advanceTimersByTimeAsync(ASYNC_VALIDATOR_TIMER_DUE);

                expect(control.status).toBe('VALID');
                expect(statuses).toEqual(['PENDING', 'VALID']);

                subscription.unsubscribe();
            });
        });

        describe('datepicker with kbq-datepicker-toggle', () => {
            let fixture: ComponentFixture<DatepickerWithToggle>;
            let testComponent: DatepickerWithToggle;

            beforeEach(() => {
                vi.useFakeTimers();
                fixture = createComponent(DatepickerWithToggle, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            });

            afterEach(async () => {
                testComponent.datepicker().close();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
            });

            it('should not throw when typing into an input without a form control', async () => {
                await expect(typeIntoDatepickerInput(fixture, '1')).resolves.not.toThrow();
            });

            it('should not throw when blurring a partially typed input without a form control', async () => {
                await typeIntoDatepickerInput(fixture, '1.2');

                expect(() => {
                    testComponent.input().onBlur();
                    vi.advanceTimersByTime(0);
                    vi.runOnlyPendingTimers();
                }).not.toThrow();
            });

            // The legacy `<kbq-datepicker-toggle>` (a wrapper around a real <button>) was
            // removed in v20.0.0 — the new `<kbq-datepicker-toggle-icon>` is an icon-only
            // directive whose host listens to (click) and projects an <i kbq-icon-button>.
            // Tests below query the host element directly instead of `By.css('button')`.
            it('should reflect the datepicker disabled state via aria-disabled on the toggle host', () => {
                testComponent.datepicker().disabled = true;
                fixture.detectChanges();

                const toggle = fixture.debugElement.query(By.css('kbq-datepicker-toggle-icon')).nativeElement;

                expect(toggle.getAttribute('aria-disabled')).toBe('true');

                dispatchMouseEvent(toggle, 'click');
                fixture.detectChanges();

                expect(testComponent.datepicker().opened).toBe(false);
            });

            it('should not open calendar when toggle clicked if input is disabled', () => {
                expect(testComponent.datepicker().disabled).toBe(false);

                testComponent.input().disabled.set(true);
                fixture.detectChanges();

                const toggle = fixture.debugElement.query(By.css('kbq-datepicker-toggle-icon')).nativeElement;

                expect(toggle.getAttribute('aria-disabled')).toBe('true');

                dispatchMouseEvent(toggle, 'click');
                fixture.detectChanges();

                expect(testComponent.datepicker().opened).toBe(false);
            });

            it('should not change focus on open/close calendar', () => {
                const input = fixture.debugElement.query(By.css('input')).nativeElement;

                fixture.detectChanges();

                input.focus();
                expect(document.activeElement).toBe(input);

                fixture.componentInstance.datepicker().open();
                fixture.detectChanges();

                const pane = document.querySelector('.cdk-overlay-pane')!;

                expect(pane).toBeTruthy();

                fixture.componentInstance.datepicker().close();
                fixture.detectChanges();

                expect(document.activeElement).toBe(input);
            });

            it('should toggle the kbq-active class on the inner icon-button while the datepicker is open', async () => {
                const innerIcon = fixture.debugElement.query(
                    By.css('kbq-datepicker-toggle-icon i[kbq-icon-button]')
                ).nativeElement;

                expect(innerIcon.classList).not.toContain('kbq-active');

                fixture.componentInstance.datepicker().open();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(innerIcon.classList).toContain('kbq-active');

                fixture.componentInstance.datepicker().close();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(innerIcon.classList).not.toContain('kbq-active');
            });

            it('should return the focus to the input once a day is picked in a calendar opened from the toggle', async () => {
                clickWithMouse(getDatepickerToggleIconElement(fixture));
                fixture.detectChanges();

                clickWithMouse(document.querySelectorAll<HTMLElement>('.kbq-calendar__body-cell')[5]);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(testComponent.datepicker().opened).toBe(false);
                expect(document.activeElement).toBe(testComponent.input().elementRef.nativeElement);
            });

            it('should close on ESCAPE a calendar opened from the toggle', async () => {
                clickWithMouse(getDatepickerToggleIconElement(fixture));
                fixture.detectChanges();

                dispatchKeyboardEvent(document.activeElement!, 'keydown', ESCAPE);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(testComponent.datepicker().opened).toBe(false);
            });

            it('should close on a second click on the toggle and open on the next one', async () => {
                const datepicker = testComponent.datepicker();
                const toggle = getDatepickerToggleIconElement(fixture);
                const events: string[] = [];

                datepicker.openedStream.subscribe(() => events.push('opened'));
                datepicker.closedStream.subscribe(() => events.push('closed'));

                clickWithMouse(toggle);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                clickWithMouse(toggle);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(datepicker.opened).toBe(false);
                expect(document.querySelector('.kbq-datepicker__content')).toBeNull();
                expect(events).toEqual(['opened', 'closed']);

                clickWithMouse(toggle);
                fixture.detectChanges();

                expect(datepicker.opened).toBe(true);
            });
        });

        describe('datepicker with custom kbq-datepicker-toggle icon', () => {
            it('should render the projected custom icon and suppress the default kbq-icon-button', async () => {
                vi.useFakeTimers();

                const fixture = createComponent(DatepickerWithCustomIcon, [KbqLuxonDateModule]);

                fixture.detectChanges();

                const host = fixture.nativeElement.querySelector('kbq-datepicker-toggle-icon');

                expect(host).toBeTruthy();
                // Projected custom icon is rendered inside the host.
                expect(host.querySelector('.custom-icon')).toBeTruthy();
                // And the default <i kbq-icon-button="kbq-calendar-o_16"> is NOT projected
                // (ng-content fallback is replaced by user-supplied content).
                expect(host.querySelector('i[kbq-icon-button]')).toBeFalsy();
            });
        });

        describe('datepicker with min and max dates and validation', () => {
            let fixture: ComponentFixture<DatepickerWithMinAndMaxValidation>;
            let testComponent: DatepickerWithMinAndMaxValidation;

            beforeEach(() => {
                fixture = createComponent(DatepickerWithMinAndMaxValidation, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            });

            afterEach(() => {
                testComponent.datepicker().close();
                fixture.detectChanges();
            });

            it('should mark invalid when value is before min', async () => {
                vi.useFakeTimers();

                testComponent.date = DateTime.local(2009, 12, 31);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).toContain('ng-invalid');
            });

            it('should mark invalid when value is after max', async () => {
                vi.useFakeTimers();

                testComponent.date = DateTime.local(2020, 1, 2);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).toContain('ng-invalid');
            });

            it('should not mark invalid when value equals min', async () => {
                vi.useFakeTimers();

                testComponent.date = testComponent.minDate!;
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).not.toContain('ng-invalid');
            });

            it('should not mark invalid when value equals max', async () => {
                vi.useFakeTimers();

                testComponent.date = testComponent.maxDate;
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).not.toContain('ng-invalid');
            });

            it('should not mark invalid when value is between min and max', async () => {
                vi.useFakeTimers();

                testComponent.date = DateTime.local(2010, 1, 2);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).not.toContain('ng-invalid');
            });

            it('should mark invalid when a date before min is typed', async () => {
                vi.useFakeTimers();

                await typeIntoDatepickerInput(fixture, '31.12.2009');

                expect(getDatepickerNgModel(fixture).errors).toHaveProperty('kbqDatepickerMin');
            });

            it('should mark invalid when a date after max is typed', async () => {
                vi.useFakeTimers();

                await typeIntoDatepickerInput(fixture, '02.01.2020');

                expect(getDatepickerNgModel(fixture).errors).toHaveProperty('kbqDatepickerMax');
            });

            it('should stay valid when a date inside the range is typed', async () => {
                vi.useFakeTimers();

                await typeIntoDatepickerInput(fixture, '02.01.2010');

                expect(getDatepickerNgModel(fixture).errors).toBeNull();
            });

            it('should mark invalid when a date before min is pasted', async () => {
                vi.useFakeTimers();

                await pasteIntoDatepickerInput(fixture, '31.12.2009');

                expect(getDatepickerNgModel(fixture).errors).toHaveProperty('kbqDatepickerMin');
            });

            it('should re-validate when min changes', async () => {
                vi.useFakeTimers();

                testComponent.date = DateTime.local(2015, 6, 15);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(getDatepickerNgModel(fixture).errors).toBeNull();

                testComponent.minDate = DateTime.local(2016, 1, 1);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(getDatepickerNgModel(fixture).errors).toHaveProperty('kbqDatepickerMin');
            });

            it('should lift min when its binding becomes unset', async () => {
                testComponent.date = DateTime.local(2009, 12, 31);
                fixture.detectChanges();
                await fixture.whenStable();

                expect(getDatepickerNgModel(fixture).errors).toHaveProperty('kbqDatepickerMin');

                testComponent.minDate = undefined;
                fixture.detectChanges();
                await fixture.whenStable();

                expect(getDatepickerNgModel(fixture).errors).toBeNull();
            });

            it('should keep a max written in code while the bound one does not change', async () => {
                const datepickerInput = fixture.debugElement
                    .query(By.directive(KbqDatepickerInput))
                    .injector.get(KbqDatepickerInput);

                testComponent.date = DateTime.local(2015, 6, 15);
                fixture.detectChanges();
                await fixture.whenStable();

                datepickerInput.max = DateTime.local(2015, 1, 1);
                testComponent.minDate = DateTime.local(2010, 1, 2);
                fixture.detectChanges();
                await fixture.whenStable();

                expect(getDatepickerNgModel(fixture).errors).toHaveProperty('kbqDatepickerMax');
            });

            it('should ignore an invalid min', async () => {
                vi.useFakeTimers();

                testComponent.minDate = DateTime.invalid('unparseable');
                testComponent.date = DateTime.local(2015, 6, 15);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(getDatepickerNgModel(fixture).errors).toBeNull();
            });

            it('should ignore an invalid max', async () => {
                vi.useFakeTimers();

                testComponent.maxDate = DateTime.invalid('unparseable');
                testComponent.date = DateTime.local(2015, 6, 15);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(getDatepickerNgModel(fixture).errors).toBeNull();
            });

            it('should not report a range error for an unparseable value', async () => {
                vi.useFakeTimers();

                testComponent.date = DateTime.invalid('unparseable');
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(getDatepickerNgModel(fixture).errors).toBeNull();
            });

            it('should change selected year in calendar if input year is less than MIN', async () => {
                vi.useFakeTimers();

                fixture.componentInstance.datepicker().open();
                fixture.detectChanges();

                const yearSelectValuePath = '.kbq-calendar-header__select-group kbq-select .kbq-button_transparent';
                const invalidYearLessThanMin = 2014;

                await typeIntoDatepickerInput(fixture, `01.01.${invalidYearLessThanMin}`);

                expect(fixture.componentInstance.date?.year).not.toEqual(fixture.componentInstance.minDate?.year);
                expect(fixture.componentInstance.date?.year).toEqual(invalidYearLessThanMin);
                expect(
                    fixture.debugElement.queryAll(By.css(yearSelectValuePath))[1].nativeElement.textContent
                ).toContain(invalidYearLessThanMin.toString());
            });
        });

        describe('datepicker with filter and validation', () => {
            let fixture: ComponentFixture<DatepickerWithFilterAndValidation>;
            let testComponent: DatepickerWithFilterAndValidation;

            beforeEach(() => {
                vi.useFakeTimers();
                fixture = createComponent(DatepickerWithFilterAndValidation, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
            });

            afterEach(async () => {
                testComponent.datepicker().close();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
            });

            it('should mark input invalid', async () => {
                testComponent.date = DateTime.local(2017, 1, 1);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).toContain('ng-invalid');

                testComponent.date = DateTime.local(2017, 1, 2);
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(fixture.debugElement.query(By.css('input')).nativeElement.classList).not.toContain('ng-invalid');
            });

            it('should disable filtered calendar cells', () => {
                fixture.detectChanges();

                testComponent.datepicker().open();
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
            let onDateChangeSpyFn: MockInstance;
            let onChangeSpyFn: MockInstance;
            let onDateInputSpyFn: MockInstance;

            beforeEach(() => {
                fixture = createComponent(DatepickerWithChangeAndInputEvents, [KbqLuxonDateModule]);
                fixture.detectChanges();

                testComponent = fixture.componentInstance;
                inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

                onChangeSpyFn = vi.spyOn(testComponent, 'onChange');
                onDateInputSpyFn = vi.spyOn(testComponent, 'onDateInput');
                onDateChangeSpyFn = vi.spyOn(testComponent, 'onDateChange');
            });

            afterEach(() => {
                testComponent.datepicker().close();
                fixture.detectChanges();
            });

            it('should fire input and dateInput events when user types input', async () => {
                vi.useFakeTimers();

                expect(onDateInputSpyFn).not.toHaveBeenCalled();

                await typeIntoDatepickerInput(fixture, '01.01.2001');

                expect(onDateInputSpyFn).toHaveBeenCalled();
            });

            it('should fire change and dateChange events when user commits typed input', async () => {
                vi.useFakeTimers();

                expect(onChangeSpyFn).not.toHaveBeenCalled();
                expect(onDateChangeSpyFn).not.toHaveBeenCalled();
                expect(onDateInputSpyFn).not.toHaveBeenCalled();

                dispatchFakeEvent(inputEl, 'change');
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(onChangeSpyFn).toHaveBeenCalled();
                expect(onDateChangeSpyFn).toHaveBeenCalled();
                expect(onDateInputSpyFn).not.toHaveBeenCalled();
            });

            it('should fire dateInput event when user selects calendar date', async () => {
                vi.useFakeTimers();

                expect(onChangeSpyFn).not.toHaveBeenCalled();
                expect(onDateInputSpyFn).not.toHaveBeenCalled();

                expect(onDateChangeSpyFn).not.toHaveBeenCalled();

                testComponent.datepicker().open();
                fixture.detectChanges();

                const cells = document.querySelectorAll('.kbq-calendar__body-cell');

                dispatchMouseEvent(cells[0], 'click');
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(onChangeSpyFn).not.toHaveBeenCalled();
                expect(onDateInputSpyFn).not.toHaveBeenCalled();

                expect(onDateChangeSpyFn).toHaveBeenCalled();
            });

            it('should not fire the dateInput event if the value has not changed', async () => {
                vi.useFakeTimers();

                expect(onDateInputSpyFn).not.toHaveBeenCalled();

                await typeIntoDatepickerInput(fixture, '12.12.2011');

                expect(onDateInputSpyFn).toHaveBeenCalledTimes(1);

                await typeIntoDatepickerInput(fixture, '12.12.2011');

                expect(onDateInputSpyFn).toHaveBeenCalledTimes(1);
            });

            it('should set datepicker selected value to null when input cleaned up', async () => {
                vi.useFakeTimers();

                expect(onDateInputSpyFn).not.toHaveBeenCalled();

                inputEl.value = '12.12.2011';
                dispatchKeyboardEvent(inputEl, 'keydown', ENTER);
                dispatchFakeEvent(inputEl, 'change');
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                inputEl.value = '';
                dispatchKeyboardEvent(inputEl, 'keydown', ENTER);
                dispatchFakeEvent(inputEl, 'change');
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(onDateChangeSpyFn).toHaveBeenCalledWith(expect.objectContaining({ value: null }));
                expect(testComponent.datepicker().selected).toBeNull();
            });
        });

        describe('with ISO 8601 strings as input', () => {
            let fixture: ComponentFixture<DatepickerWithISOStrings>;
            let testComponent: DatepickerWithISOStrings;

            beforeEach(() => {
                fixture = createComponent(DatepickerWithISOStrings, [KbqLuxonDateModule]);
                testComponent = fixture.componentInstance;
            });

            afterEach(() => {
                testComponent.datepicker().close();
                fixture.detectChanges();
            });

            it('should coerce ISO strings', async () => {
                vi.useFakeTimers();

                expect(() => fixture.detectChanges()).not.toThrow();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(testComponent.datepicker().startAt?.toISO()).toEqual(DateTime.local(2017, 7, 1).toISO());
            });

            // writeValue deserializes the ISO string, but setControl's valueChanges subscription then stores the
            // raw control value in the input, so its value stays a string.
            it.skip('should coerce an ISO string bound through ngModel', async () => {
                vi.useFakeTimers();

                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(testComponent.datepickerInput().value?.toISO()).toEqual(DateTime.local(2017, 6, 1).toISO());
            });
        });

        describe('with events', () => {
            let fixture: ComponentFixture<DatepickerWithEvents>;
            let testComponent: DatepickerWithEvents;

            beforeEach(() => {
                fixture = createComponent(DatepickerWithEvents, [KbqLuxonDateModule]);
                fixture.detectChanges();
                testComponent = fixture.componentInstance;
            });

            it('should dispatch an event when a datepicker is opened', () => {
                testComponent.datepicker().open();
                fixture.detectChanges();

                expect(testComponent.openedSpy).toHaveBeenCalled();
            });

            it('should dispatch an event when a datepicker is closed', async () => {
                vi.useFakeTimers();

                testComponent.datepicker().open();
                fixture.detectChanges();

                testComponent.datepicker().close();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();

                expect(testComponent.closedSpy).toHaveBeenCalled();
            });
        });

        describe('datepicker that opens on focus', () => {
            let fixture: ComponentFixture<DatepickerOpeningOnFocus>;
            let testComponent: DatepickerOpeningOnFocus;
            let input: HTMLInputElement;

            beforeEach(() => {
                fixture = createComponent(DatepickerOpeningOnFocus, [KbqLuxonDateModule]);
                fixture.detectChanges();
                testComponent = fixture.componentInstance;
                input = fixture.debugElement.query(By.css('input')).nativeElement;
            });

            it('should not reopen if the browser fires the focus event asynchronously', async () => {
                vi.useFakeTimers();

                // Open initially by focusing.
                input.focus();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                // Due to some browser limitations we can't install a stub on `document.activeElement`
                // so instead we have to override the previously-focused element manually.
                (fixture.componentInstance.datepicker() as any)._focusedElementBeforeOpen = input;

                // Ensure that the datepicker is actually open.
                expect(testComponent.datepicker().opened).toBe(true);

                // Close the datepicker.
                testComponent.datepicker().close();
                fixture.detectChanges();

                // Schedule the input to be focused asynchronously.
                input.focus();
                fixture.detectChanges();

                // Flush out the scheduled tasks.
                await vi.runOnlyPendingTimersAsync();

                expect(testComponent.datepicker().opened).toBe(false);
            });
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
                fixture.componentInstance.datepicker().open();
                fixture.detectChanges();

                const overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

                expect(overlay.getAttribute('dir')).toBe('rtl');
            });

            it('should update the popup direction if the directionality value changes', async () => {
                vi.useFakeTimers();

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
                fixture.componentInstance.datepicker().open();
                fixture.detectChanges();

                let overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

                expect(overlay.getAttribute('dir')).toBe('ltr');

                fixture.componentInstance.datepicker().close();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                dirProvider.value = 'rtl';
                fixture.componentInstance.datepicker().open();
                fixture.detectChanges();

                overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

                expect(overlay.getAttribute('dir')).toBe('rtl');
                await vi.runOnlyPendingTimersAsync();
            });
        });
    });

    describe('with missing DateAdapter and KBQ_DATE_FORMATS', () => {
        it('should throw when created', () => {
            expect(() => createComponent(StandardDatepicker)).toThrow(/KbqDatepicker: No provider found for .*/);
        });
    });

    // `KbqModalService` builds the modal content from the root injector, so `KbqDatepickerModule`'s own
    // providers are out of reach there — `KBQ_DATEPICKER_SCROLL_STRATEGY` has to carry a root default for the
    // calendar to open at all. Every suite above pulls the module into the TestBed root, which hides the gap.
    describe('inside a modal', () => {
        beforeEach(() => {
            // Only the app-level date wiring is registered here. `KbqDatepickerModule` deliberately stays a
            // standalone import of the modal content component, which is where the reported app had it.
            TestBed.configureTestingModule({
                imports: [KbqLuxonDateModule, DatepickerInModalHost],
                providers: [{ provide: KBQ_DATE_FORMATS, useValue: KBQ_LUXON_DATE_FORMATS }]
            });
        });

        it('should open the calendar', async () => {
            vi.useFakeTimers();

            const overlayContainer = TestBed.inject(OverlayContainer);
            const fixture = TestBed.createComponent(DatepickerInModalHost);

            fixture.detectChanges();

            expect(() => {
                fixture.componentInstance.open();
                fixture.detectChanges();
                vi.advanceTimersByTime(MODAL_ANIMATE_DURATION);
            }).not.toThrow();

            const toggle = overlayContainer
                .getContainerElement()
                .querySelector<HTMLElement>('kbq-datepicker-toggle-icon');

            expect(toggle).not.toBeNull();

            expect(() => {
                toggle!.click();
                fixture.detectChanges();
                vi.advanceTimersByTime(500);
            }).not.toThrow();

            expect(overlayContainer.getContainerElement().querySelector('kbq-datepicker__content')).not.toBeNull();
        });
    });

    describe('placeholder', () => {
        const renderPlaceholder = (providers: Provider[]): string => {
            TestBed.configureTestingModule({ imports: [LuxonDateModule, DatepickerWithDefaultPlaceholder], providers });

            const fixture = TestBed.createComponent(DatepickerWithDefaultPlaceholder);

            fixture.detectChanges();

            return getDatepickerInputElement(fixture).placeholder;
        };

        it('should follow LOCALE_ID without a locale service', () => {
            expect(renderPlaceholder([{ provide: LOCALE_ID, useValue: 'en-US' }])).toBe('yyyy-mm-dd');
        });

        it('should follow KBQ_DATE_LOCALE without a locale service', () => {
            expect(renderPlaceholder([{ provide: KBQ_DATE_LOCALE, useValue: 'es-LA' }])).toBe('dd/mm/aaaa');
        });

        it('should fall back to ru-RU for a date locale the library ships no strings for', () => {
            expect(renderPlaceholder([{ provide: KBQ_DATE_LOCALE, useValue: 'zh-CN' }])).toBe('дд.мм.гггг');
        });

        it('should follow the locale service over KBQ_DATE_LOCALE', () => {
            const placeholder = renderPlaceholder([
                { provide: KBQ_DATE_LOCALE, useValue: 'en-US' },
                kbqLocaleIDProvider('pt-BR'),
                kbqLocaleServiceProvider()
            ]);

            expect(placeholder).toBe('dd/mm/yyyy');
        });
    });

    // @koobiq/luxon-date-adapter carries locale data for a fixed set of locales, and its base constructor
    // calls setLocale before the subclass field that would widen it exists. KBQ_DATE_LOCALE: 'de-DE' therefore
    // throws inside the adapter constructor, before any assertion here runs.
    describe.skip('internationalization', () => {
        let fixture: ComponentFixture<DatepickerWithi18n>;
        let testComponent: DatepickerWithi18n;
        let input: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(
                DatepickerWithi18n,
                [KbqLuxonDateModule],
                [{ provide: KBQ_DATE_LOCALE, useValue: 'de-DE' }]
            );
            fixture.detectChanges();
            testComponent = fixture.componentInstance;
            input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        });

        it('should have the correct input value even when inverted date format', async () => {
            vi.useFakeTimers();

            const selected = DateTime.local(2017, 8, 1);

            testComponent.date = selected;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            // Normally the proper date format would 01.09.2017, but some browsers seem format the
            // date without the leading zero. (e.g. 1.9.2017).
            expect(input.value).toMatch(/0?1\.0?9\.2017/);
            expect(testComponent.datepickerInput().value).toBe(selected);
        });
    });

    describe('overlay layer', () => {
        it('should render the popup of an input inside the element into its overlay layer on every open', fakeAsync(() => {
            const fixture = createComponent(DatepickerInOverlayLayer, [KbqLuxonDateModule]);

            fixture.detectChanges();

            const datepicker = fixture.componentInstance.datepicker();
            const getLayer = (): HTMLElement =>
                fixture.nativeElement.querySelector('[kbqOverlayLayer] > .kbq-overlay-layer');
            const getPopupHost = (): HTMLElement =>
                document.querySelector('.cdk-overlay-pane.kbq-datepicker__popup')!.parentElement!;

            datepicker.open();
            fixture.detectChanges();

            expect(getPopupHost().parentElement).toBe(getLayer());

            datepicker.close();
            fixture.detectChanges();
            flush();
            datepicker.open();
            fixture.detectChanges();

            expect(getPopupHost().parentElement).toBe(getLayer());

            datepicker.close();
            fixture.detectChanges();
            flush();
        }));
    });
});

@Component({
    imports: [KbqDatepickerModule, KbqOverlayLayer],
    template: `
        <div kbqOverlayLayer>
            <input [kbqDatepicker]="d" />
            <kbq-datepicker #d />
        </div>
    `
})
class DatepickerInOverlayLayer {
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
}

@Component({
    imports: [
        KbqDatepickerModule
    ],
    template: `
        <input [kbqDatepicker]="d" [value]="date" />
        <kbq-datepicker #d [disabled]="disabled" [opened]="opened" />
    `
})
class StandardDatepicker {
    opened = false;
    disabled = false;
    date: DateTime | null = DateTime.local(2020, 1, 1);
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
    readonly datepickerInput = viewChild.required(KbqDatepickerInput);
}

@Component({
    imports: [
        KbqDatepickerModule
    ],
    template: `
        <input [kbqDatepicker]="d" />
        <input [kbqDatepicker]="d" />
        <kbq-datepicker #d />
    `
})
class MultiInputDatepicker {}

@Component({
    imports: [
        KbqDatepickerModule
    ],
    template: `
        <kbq-datepicker #d />
    `
})
class NoInputDatepicker {
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
}

@Component({
    imports: [
        KbqDatepickerModule
    ],
    template: `
        <input [kbqDatepicker]="d" [value]="date" />
        <kbq-datepicker #d [startAt]="startDate" />
    `
})
class DatepickerWithStartAt {
    date = DateTime.local(2020, 1, 1);
    startDate = DateTime.local(2010, 1, 1);
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
}

@Component({
    imports: [
        KbqDatepickerModule,
        FormsModule
    ],
    template: `
        <input [kbqDatepicker]="d" [(ngModel)]="selected" />
        <kbq-datepicker #d />
    `
})
class DatepickerWithNgModel {
    adapter = inject_1<DateAdapter<DateTime>>(DateAdapter);

    selected: DateTime | null = null;
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
    readonly datepickerInput = viewChild.required(KbqDatepickerInput);
}

@Component({
    imports: [
        ReactiveFormsModule,
        KbqDatepickerModule
    ],
    template: `
        <input [formControl]="formControl" [kbqDatepicker]="d" />
        <kbq-datepicker-toggle-icon kbqSuffix [for]="d" />
        <kbq-datepicker #d />
    `
})
class DatepickerWithFormControl {
    formControl = new UntypedFormControl();
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
    readonly datepickerInput = viewChild.required(KbqDatepickerInput);
    readonly datepickerToggle = viewChild.required(KbqDatepickerToggleIconComponent);
}

@Component({
    imports: [
        KbqDatepickerInput,
        KbqDatepicker,
        KbqDatepickerToggleIconComponent
    ],
    template: `
        <input [kbqDatepicker]="d" />
        <kbq-datepicker-toggle-icon kbqSuffix [for]="d" />
        <kbq-datepicker #d />
    `
})
class DatepickerWithToggle {
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
    readonly input = viewChild.required(KbqDatepickerInput);
}

@Component({
    imports: [
        KbqDatepickerModule
    ],
    template: `
        <input [kbqDatepicker]="d" />
        <kbq-datepicker-toggle-icon kbqSuffix [for]="d">
            <div class="custom-icon" kbqDatepickerToggleIcon></div>
        </kbq-datepicker-toggle-icon>
        <kbq-datepicker #d />
    `
})
class DatepickerWithCustomIcon {}

@Component({
    imports: [
        KbqDatepickerModule,
        FormsModule
    ],
    template: `
        <input [kbqDatepicker]="d" [min]="minDate" [max]="maxDate" [(ngModel)]="date" />
        <kbq-datepicker-toggle-icon kbqSuffix [for]="d" />
        <kbq-datepicker #d />
    `
})
class DatepickerWithMinAndMaxValidation {
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
    date: DateTime | null;
    minDate: DateTime | undefined = DateTime.local(2010, 1, 1);
    maxDate: DateTime = DateTime.local(2020, 1, 1);
}

@Component({
    imports: [
        KbqDatepickerModule,
        FormsModule
    ],
    template: `
        <input [kbqDatepicker]="d" [kbqDatepickerFilter]="filter" [(ngModel)]="date" />
        <kbq-datepicker-toggle-icon kbqSuffix [for]="d" />
        <kbq-datepicker #d />
    `
})
class DatepickerWithFilterAndValidation {
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
    date: DateTime;
    filter = (date: DateTime) => date.get('day') !== 1;
}

@Component({
    imports: [
        KbqDatepickerModule,
        FormsModule
    ],
    template: `
        <input
            [kbqDatepicker]="d"
            [(ngModel)]="value"
            (change)="onChange()"
            (dateChange)="onDateChange($event)"
            (dateInput)="onDateInput()"
        />
        <kbq-datepicker #d />
    `
})
class DatepickerWithChangeAndInputEvents {
    value = null;
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');

    onChange() {}

    onDateChange(_event: KbqDatepickerInputEvent<any>) {}

    onDateInput() {}
}

@Component({
    imports: [
        KbqDatepickerModule,
        FormsModule
    ],
    template: `
        <input [kbqDatepicker]="d" [(ngModel)]="date" />
        <kbq-datepicker #d />
    `
})
class DatepickerWithi18n {
    date: DateTime | null = DateTime.local(2010, 1, 1);
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
    readonly datepickerInput = viewChild.required(KbqDatepickerInput);
}

@Component({
    imports: [
        KbqDatepickerModule,
        FormsModule
    ],
    template: `
        <input [kbqDatepicker]="d" [min]="min" [max]="max" [(ngModel)]="value" />
        <kbq-datepicker #d [startAt]="startAt" />
    `
})
class DatepickerWithISOStrings {
    value = new Date(2017, 5, 1).toISOString();
    min = new Date(2017, 1, 1).toISOString();
    max = new Date(2017, 11, 31).toISOString();
    startAt = new Date(2017, 6, 1).toISOString();
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
    readonly datepickerInput = viewChild.required(KbqDatepickerInput);
}

@Component({
    imports: [
        KbqDatepickerModule,
        FormsModule
    ],
    template: `
        <input [kbqDatepicker]="d" [(ngModel)]="selected" />
        <kbq-datepicker #d (opened)="openedSpy()" (closed)="closedSpy()" />
    `
})
class DatepickerWithEvents {
    selected: DateTime | null = null;
    openedSpy = vi.fn();
    closedSpy = vi.fn();
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
}

@Component({
    imports: [KbqDatepickerModule],
    template: `
        <input [kbqDatepicker]="d" />
        <kbq-datepicker #d />
    `
})
class DatepickerWithDefaultPlaceholder {}

@Component({
    imports: [
        KbqDatepickerModule
    ],
    template: `
        <input [kbqDatepicker]="d" (focus)="d.open()" />
        <kbq-datepicker #d="kbqDatepicker" />
    `
})
class DatepickerOpeningOnFocus {
    readonly datepicker = viewChild.required(KbqDatepicker);
}

@Component({
    imports: [
        KbqDatepickerModule
    ],
    template: `
        <input [kbqDatepicker]="assignedDatepicker" [value]="date" />
        <kbq-datepicker #d />
    `
})
class DelayedDatepicker {
    readonly datepicker = viewChild.required<KbqDatepicker<DateTime>>('d');
    readonly datepickerInput = viewChild.required(KbqDatepickerInput);
    date: DateTime | null;
    assignedDatepicker: KbqDatepicker<DateTime>;
}

@Component({
    imports: [
        KbqDatepickerModule,
        KbqFormFieldModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <input [kbqDatepicker]="d" [ngModel]="null" />
            <kbq-datepicker-toggle-icon kbqSuffix [for]="d" />
            <kbq-datepicker #d />
        </kbq-form-field>
    `
})
class DatepickerInModalContent {}

@Component({
    imports: [
        KbqModalModule
    ],
    template: ''
})
class DatepickerInModalHost {
    readonly modalService = inject_1(KbqModalService);

    open() {
        return this.modalService.open({ kbqComponent: DatepickerInModalContent });
    }
}
