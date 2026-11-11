import {
    AfterContentInit,
    booleanAttribute,
    computed,
    Directive,
    DoCheck,
    effect,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    InjectionToken,
    input,
    linkedSignal,
    OnChanges,
    OnDestroy,
    output,
    Provider,
    Renderer2,
    signal,
    SimpleChanges,
    untracked
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    ControlValueAccessor,
    FormGroupDirective,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    NgControl,
    NgForm,
    ValidationErrors,
    Validator,
    ValidatorFn,
    Validators
} from '@angular/forms';
import {
    BACKSPACE,
    DateAdapter,
    DELETE,
    DOWN_ARROW,
    END,
    ErrorStateMatcher,
    ESCAPE,
    hasModifierKey,
    HOME,
    isHorizontalMovement,
    isLetterKey,
    isVerticalMovement,
    KBQ_DATE_FORMATS,
    KBQ_DATE_LOCALE,
    KBQ_DEFAULT_LOCALE_DATA_FACTORY,
    KbqDateFormats,
    KbqDatepickerLocaleConfiguration,
    KbqDateTimezoneService,
    KbqDeepPartial,
    KbqErrorStateTracker,
    kbqLocaleConfigurationOverrideProvider,
    KbqLocaleDataInput,
    KbqLocaleOverridesDirective,
    kbqRevealSelection,
    kbqSetSelectionRange,
    LEFT_ARROW,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    ruRULocaleData,
    SPACE,
    TAB,
    UP_ARROW,
    validationTooltipHideDelay,
    validationTooltipShowDelay
} from '@koobiq/components/core';
import { KBQ_FORM_FIELD, KbqFormFieldControl } from '@koobiq/components/form-field';
import type { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Subscription } from 'rxjs';
import { KbqCalendar } from './calendar.component';
import { injectRequiredDateAdapter } from './datepicker-errors';
import { KbqDatepicker } from './datepicker.component';

enum DateParts {
    year = 'y',
    month = 'm',
    day = 'd'
}

export const MAX_YEAR = 9999;
const YEAR_LENGTH = 4;

/** Days in the longest month */
const MAX_DAYS_IN_MONTH = 31;

/** A one- or two-digit year below it falls in the current century, any other in the previous one */
const SHORT_YEAR_PIVOT = 30;

/** First year of the current century */
const CURRENT_CENTURY_START = 2000;

/** First year of the previous century */
const PREVIOUS_CENTURY_START = 1900;

/** Key of the error reported for text that is not a date */
const parseErrorKey = 'kbqDatepickerParse';

class DateDigit {
    maxDays = MAX_DAYS_IN_MONTH;
    maxMonth = 12;

    parse: (value: string) => number;

    constructor(
        public value: DateParts,
        public start: number,
        public length: number
    ) {
        if (value === DateParts.day) {
            this.parse = this.parseDay;
        } else if (value === DateParts.month) {
            this.parse = this.parseMonth;
        } else if (value === DateParts.year) {
            this.parse = this.parseYear;
        }
    }

    get end(): number {
        return this.start + this.length;
    }

    get isDay(): boolean {
        return this.value === DateParts.day;
    }

    get isMonth(): boolean {
        return this.value === DateParts.month;
    }

    get isYear(): boolean {
        return this.value === DateParts.year;
    }

    get fullName(): string {
        if (this.isDay) {
            return 'date';
        }

        if (this.isMonth) {
            return 'month';
        }

        if (this.isYear) {
            return 'year';
        }

        return '';
    }

    private parseDay(value: string): number {
        const parsedValue: number = parseInt(value);

        if (parsedValue === 0) {
            return 1;
        }

        if (parsedValue > this.maxDays) {
            return this.maxDays;
        }

        return parsedValue;
    }

    private parseMonth(value: string): number {
        const parsedValue: number = parseInt(value);

        if (parsedValue === 0) {
            return 1;
        }

        if (parsedValue > this.maxMonth) {
            return this.maxMonth;
        }

        return parsedValue;
    }

    private parseYear(value: string): number {
        const parsedValue: number = parseInt(value);

        if (parsedValue === 0) {
            return 1;
        }

        if (parsedValue > MAX_YEAR) {
            return parseInt(value.substring(0, YEAR_LENGTH));
        }

        return parsedValue;
    }
}

/** @docs-private */
export const KBQ_DATEPICKER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqDatepickerInput),
    multi: true
};

/** @docs-private */
export const KBQ_DATEPICKER_VALIDATORS: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => KbqDatepickerInput),
    multi: true
};

/** default configuration of datepicker */
/** @docs-private */
export const KBQ_DATEPICKER_DEFAULT_LOCALE_CONFIGURATION = ruRULocaleData.datepicker;

/** The `datepicker` section of the shipped locale `localeId`, if the library ships one. */
const shippedDatepickerLocaleConfiguration = (localeId: string): KbqDatepickerLocaleConfiguration | undefined => {
    const shipped: KbqLocaleDataInput = KBQ_DEFAULT_LOCALE_DATA_FACTORY();
    const locale = shipped[localeId];

    // A shipped locale is complete, its sections included.
    return locale && !Array.isArray(locale) ? (locale.datepicker as KbqDatepickerLocaleConfiguration) : undefined;
};

/** The values of the token's own factory, told apart from strings an application provides for the token. */
const factoryDefaults = new WeakSet<KbqDatepickerLocaleConfiguration>();

/** Injection Token for providing configuration of datepicker */
/** @docs-private */
export const KBQ_DATEPICKER_LOCALE_CONFIGURATION = new InjectionToken<KbqDatepickerLocaleConfiguration>(
    'KbqDatepickerLocaleConfiguration',
    {
        factory: () => {
            // A copy: the shipped section itself may also be provided on purpose.
            const configuration = {
                ...(shippedDatepickerLocaleConfiguration(inject(KBQ_DATE_LOCALE)) ??
                    KBQ_DATEPICKER_DEFAULT_LOCALE_CONFIGURATION)
            };

            factoryDefaults.add(configuration);

            return configuration;
        }
    }
);

/** The default strings of one input. */
const KBQ_DATEPICKER_INPUT_LOCALE_CONFIGURATION = new InjectionToken<KbqDatepickerLocaleConfiguration>(
    'KbqDatepickerInputLocaleConfiguration'
);

/**
 * Unless strings are provided for the token, those of the format the input parses: the token's own default resolves
 * in the root injector, which knows only the date locale of the application, not the date adapter of the input.
 */
const datepickerInputLocaleConfiguration = (): KbqDatepickerLocaleConfiguration => {
    const configuration = inject(KBQ_DATEPICKER_LOCALE_CONFIGURATION);
    const adapter = inject(DateAdapter, { optional: true });

    if (!factoryDefaults.has(configuration) || !adapter?.config) return configuration;

    const format: string = inject(KBQ_DATE_FORMATS, { optional: true })?.dateInput || adapter.config.dateInput;
    // The shipped placeholders name the locale's own format, lower-cased and translated.
    const shipped = format === adapter.config.dateInput && shippedDatepickerLocaleConfiguration(adapter.config.name);

    return shipped || { placeholder: format.toLowerCase() };
};

/**
 * Utility provider for `KBQ_DATEPICKER_LOCALE_CONFIGURATION`. Only the strings you pass are overridden; the rest
 * keep following the active locale.
 */
export const kbqDatepickerLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqDatepickerLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('datepicker', configuration);

/** @deprecated Use {@link KBQ_DATEPICKER_DEFAULT_LOCALE_CONFIGURATION}. Will be removed in 22.0.0. */
export const KBQ_DATEPICKER_DEFAULT_CONFIGURATION = KBQ_DATEPICKER_DEFAULT_LOCALE_CONFIGURATION;
/** @deprecated Use {@link KBQ_DATEPICKER_LOCALE_CONFIGURATION}. Will be removed in 22.0.0. */
export const KBQ_DATEPICKER_CONFIGURATION = KBQ_DATEPICKER_LOCALE_CONFIGURATION;

/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use KbqDatepickerInputEvent instead.
 */
export class KbqDatepickerInputEvent<D> {
    /** The new value for the target datepicker input. */
    value: D | null;

    constructor(
        /** Reference to the datepicker input component that emitted the event. */
        public target: KbqDatepickerInput<D>,
        /** Reference to the native input element associated with the datepicker input. */
        public targetElement: HTMLElement
    ) {
        this.value = this.target.value();
    }
}

let uniqueComponentIdSuffix = 0;

interface DateTimeObject {
    year: number;
    month: number;
    date: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}

/** Directive used to connect an input to a KbqDatepicker. */
@Directive({
    selector: 'input[kbqDatepicker], input[kbqCalendar]',
    providers: [
        KBQ_DATEPICKER_VALUE_ACCESSOR,
        KBQ_DATEPICKER_VALIDATORS,
        { provide: KbqFormFieldControl, useExisting: KbqDatepickerInput },
        { provide: KBQ_DATEPICKER_INPUT_LOCALE_CONFIGURATION, useFactory: datepickerInputLocaleConfiguration }
    ],
    host: {
        class: 'kbq-input kbq-datepicker',
        '[attr.id]': 'id()',
        '[attr.placeholder]': 'placeholder()',
        '[attr.required]': 'required() || null',
        '[attr.disabled]': 'disabled() || null',
        '[attr.min]': 'min ? toISO8601(min) : null',
        '[attr.max]': 'max ? toISO8601(max) : null',
        '[attr.autocomplete]': '"off"',
        '(paste)': 'onPaste($event)',
        '(drop)': 'onDrop($event)',
        '(dragstart)': 'draggingOwnText = true',
        '(dragend)': 'draggingOwnText = false',
        '(change)': 'onChange()',
        '(focus)': 'focusChanged(true)',
        '(blur)': 'onBlur()',
        '(keydown)': 'onKeyDown($event)'
    },
    // Covers the strings this input renders itself. The calendar is created through `<kbq-datepicker>`, a
    // sibling of this element rather than a descendant, so it carries its own — bind `[localeOverrides]`
    // there for the pop-up, or put a carrier on an element enclosing both.
    hostDirectives: [
        { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
    ],
    exportAs: 'kbqDatepickerInput'
})
export class KbqDatepickerInput<D>
    implements KbqFormFieldControl<D>, ControlValueAccessor, Validator, OnChanges, OnDestroy, DoCheck, AfterContentInit
{
    elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
    private readonly renderer = inject(Renderer2);
    readonly adapter: DateAdapter<D> = injectRequiredDateAdapter<D>();
    private readonly timezoneService = inject(KbqDateTimezoneService);
    private readonly dateFormats = inject<KbqDateFormats>(KBQ_DATE_FORMATS, { optional: true });
    /** @docs-private */
    protected readonly formField = inject(KBQ_FORM_FIELD, { optional: true, host: true });

    protected readonly localeConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'datepicker',
        KBQ_DATEPICKER_INPUT_LOCALE_CONFIGURATION
    );

    private readonly errorStateTracker = new KbqErrorStateTracker(
        inject(ErrorStateMatcher),
        // update ngControl later, so it will be initialized
        null,
        inject(FormGroupDirective, { optional: true }),
        inject(NgForm, { optional: true })
    );

    /** Whether the input is in an error state. */
    readonly errorState = this.errorStateTracker.errorState;

    controlType: string = 'datepicker';

    private readonly focusedValue = signal(false);

    /** Whether the input has focus. */
    readonly focused = this.focusedValue.asReadonly();

    datepicker: KbqDatepicker<D>;
    calendar: KbqCalendar<D>;

    dateFilter: (date: D | null) => boolean;

    /** Emits when the value changes (either due to user input or programmatic change). */
    valueChange = new EventEmitter<D | null>();

    /** Emits when the disabled state has changed */
    disabledChange = new EventEmitter<boolean>();

    /** Object used to control when error messages are shown. */
    readonly errorStateMatcher = input<ErrorStateMatcher>();

    /** @docs-private */
    readonly placeholderInput = input<string | undefined>(undefined, { alias: 'placeholder' });

    /** Placeholder of the input. Defaults to the localized date pattern. */
    readonly placeholder = computed(() => this.placeholderInput() || this.localeConfiguration().placeholder);

    /** Whether the input is required. */
    readonly required = input<boolean, boolean | string | null | undefined>(false, { transform: booleanAttribute });

    /** The datepicker that this input is associated with. */
    set kbqDatepicker(value: KbqDatepicker<D>) {
        if (!value) {
            return;
        }

        this.datepicker = value;
        this.datepicker.registerInput(this);
        this.datepickerSubscription.unsubscribe();

        this.datepickerSubscription = this.datepicker.selectedChanged.subscribe((selected: D) => {
            const newValue = this.saveTimePart(selected);

            this.setValue(newValue);
            this.cvaOnChange(newValue);
            this.onTouched();
            this.dateChange.emit(new KbqDatepickerInputEvent(this, this.elementRef.nativeElement));
        });
    }

    /** The calendar that this input is associated with. */
    set kbqCalendar(value: KbqCalendar<D>) {
        if (!value) {
            return;
        }

        this.calendar = value;
        this.calendar.registerInput(this);
    }

    /** @docs-private */
    readonly kbqDatepickerInput = input<KbqDatepicker<D> | undefined>(undefined, { alias: 'kbqDatepicker' });

    /** @docs-private */
    readonly kbqCalendarInput = input<KbqCalendar<D> | undefined>(undefined, { alias: 'kbqCalendar' });

    /** Function that can be used to filter out dates within the datepicker. `undefined` removes the filter. */
    set kbqDatepickerFilter(value: ((date: D | null) => boolean) | undefined) {
        // `dateFilter` is unset until a filter is given; `undefined` returns it there.
        this.dateFilter = value!;
        this.validatorOnChange();
    }

    /** @docs-private */
    readonly kbqDatepickerFilterInput = input<((date: D | null) => boolean) | undefined>(undefined, {
        alias: 'kbqDatepickerFilter'
    });

    /** @docs-private */
    readonly valueInput = input<D | null | undefined>(undefined, { alias: 'value' });

    private readonly valueState = signal<D | null>(null);

    /** The date the input holds: set with `[value]`, by the form control, by typing and by the calendar. */
    readonly value = this.valueState.asReadonly();

    /**
     * The minimum valid date. Drives validation only — including dates typed or pasted into the
     * input — and reports `kbqDatepickerMin`. The calendar is restricted separately, by `minDate`
     * on the associated `<kbq-datepicker>`.
     *
     * Compared down to the millisecond, not by calendar day: the input keeps the time part of the
     * value it parses, and the comparison is made on wall-clock components rather than on absolute
     * time.
     */
    get min(): D | null {
        return this._min;
    }

    set min(value: D | null) {
        this._min = this.getValidDateOrNull(this.adapter.deserialize(value));
        this.validatorOnChange();
    }

    private _min: D | null;

    /**
     * The maximum valid date. Drives validation only — including dates typed or pasted into the
     * input — and reports `kbqDatepickerMax`. The calendar is restricted separately, by `maxDate`
     * on the associated `<kbq-datepicker>`.
     *
     * Compared down to the millisecond, not by calendar day: the input keeps the time part of the
     * value it parses, so an upper bound meant to include its whole day has to be the end of that
     * day.
     */
    get max(): D | null {
        return this._max;
    }

    set max(value: D | null) {
        this._max = this.getValidDateOrNull(this.adapter.deserialize(value));
        this.validatorOnChange();
    }

    private _max: D | null;

    /** @docs-private */
    readonly minInput = input<D | null | undefined>(undefined, { alias: 'min' });

    /** @docs-private */
    readonly maxInput = input<D | null | undefined>(undefined, { alias: 'max' });

    /** @docs-private */
    readonly disabledInput = input<boolean, boolean | string | null | undefined>(false, {
        alias: 'disabled',
        transform: booleanAttribute
    });

    /** Whether the datepicker-input is disabled. Also set by the bound form control. */
    readonly disabled = linkedSignal(() => this.disabledInput());

    /** @docs-private */
    readonly idInput = input<string | undefined>(undefined, { alias: 'id' });

    /** Unique id of the element, generated when not provided. */
    readonly id = computed(() => this.idInput() || this.uid);

    set kbqValidationTooltip(tooltip: KbqTooltipTrigger) {
        if (!tooltip) {
            return;
        }

        tooltip.enterDelay = validationTooltipShowDelay;
        tooltip.trigger = 'manual';

        tooltip.initListeners();

        this.incorrectInput.subscribe(() => {
            if (tooltip.isOpen) {
                return;
            }

            tooltip.show();

            setTimeout(() => tooltip.hide(), validationTooltipHideDelay);
        });
    }

    /** @docs-private */
    readonly kbqValidationTooltipInput = input<KbqTooltipTrigger | undefined>(undefined, {
        alias: 'kbqValidationTooltip'
    });

    readonly incorrectInput = output<void>();

    /** Emits when a `change` event is fired on this `<input>`. */
    readonly dateChange = output<KbqDatepickerInputEvent<D>>();

    /** Emits when an `input` event is fired on this `<input>`. */
    readonly dateInput = output<KbqDatepickerInputEvent<D>>();

    private readonly emptyValue = signal(true);

    /** Whether the input renders no text. */
    readonly empty = this.emptyValue.asReadonly();

    get viewValue(): string {
        return this.elementRef.nativeElement.value;
    }

    get ngControl(): any {
        return this.control;
    }

    get isReadOnly(): boolean {
        return this.elementRef.nativeElement.readOnly;
    }

    get dateInputFormat(): string {
        return this.dateFormats?.dateInput || this.adapter.config.dateInput;
    }

    private get readyForParse(): boolean {
        return !!(this.firstDigit && this.secondDigit && this.thirdDigit);
    }

    private get selectionStart(): number | null {
        return this.elementRef.nativeElement.selectionStart;
    }

    private get selectionEnd(): number | null {
        return this.elementRef.nativeElement.selectionEnd;
    }

    private control: AbstractControl | undefined;
    private readonly uid = `kbq-datepicker-input-${uniqueComponentIdSuffix++}`;

    private datepickerSubscription = Subscription.EMPTY;

    /** Whether the last value set on the input was valid. */
    private lastValueValid = false;

    /**
     * Whether a drag started in this field, so that its drop here is the field's own text.
     *
     * @internal
     */
    protected draggingOwnText = false;

    /** The combined form control validator for this input. */
    private readonly validator: ValidatorFn | null;

    private separator: string;

    private firstDigit: DateDigit | null = null;
    private secondDigit: DateDigit | null = null;
    private thirdDigit: DateDigit | null = null;

    private separatorPositions: number[];

    /** Work the keys left to timers, in the order the timers run. */
    private readonly deferred = new Map<ReturnType<typeof setTimeout>, () => void>();

    constructor() {
        this.validator = Validators.compose([
            this.parseValidator,
            this.minValidator,
            this.maxValidator,
            this.filterValidator
        ]);

        this.setFormat(this.dateInputFormat);

        // A bound value is applied whenever the binding changes; an unbound one leaves the value to the form.
        let bound = false;

        effect(() => {
            const value = this.valueInput();

            if (!bound && value === undefined) return;

            bound = true;

            untracked(() => this.setValue(value ?? null));
        });

        let wasDisabled = false;

        effect(() => {
            const disabled = this.disabled();

            untracked(() => {
                if (disabled !== wasDisabled) {
                    wasDisabled = disabled;
                    this.disabledChange.emit(disabled);
                }

                const element = this.elementRef.nativeElement;

                // We need to null check the `blur` method, because it's undefined during SSR.
                if (disabled && element.blur) {
                    // Normally, native input elements automatically blur if they turn disabled. This behavior
                    // is problematic, because it would mean that it triggers another change detection cycle,
                    // which then causes a changed after checked error if the input element was focused before.
                    element.blur();
                }
            });
        });

        let isFirstRun = true;

        effect(() => {
            this.localeConfiguration();

            // Nothing to re-format on the first run: `setFormat` above already ran against the active
            // locale, while re-assigning `value` here would emit `valueChange` at a point where the
            // datepicker and the calendar are already subscribed to it.
            if (isFirstRun) {
                isFirstRun = false;

                return;
            }

            // The date adapter follows the same locale, so its input format may have changed with it: the
            // digit layout has to be re-derived and the rendered value re-formatted.
            // Only a complete value is re-rendered: with none, the text is the user's, and `''` written over it
            // would leave the form with an error about text that is gone.
            untracked(() => {
                this.setFormat(this.dateInputFormat);

                const value = this.valueState();

                if (value) this.setValue(value);
            });
        });

        this.timezoneService.changes.pipe(takeUntilDestroyed()).subscribe(() => {
            // The rendered text names a wall clock in the zone it was formatted in. Left as it is, the
            // next keystroke re-parses it against the new zone and emits a different instant. Only a
            // complete value, as above.
            const value = this.valueState();

            if (value) this.setValue(value);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        // A bound input is handed to its member; unbound, it leaves what code wrote.
        // Not in an effect, which runs too late: `min`, `max` and the filter revalidate the form control before the
        // template reads its errors.
        if (changes['kbqDatepickerInput']) {
            const datepicker = this.kbqDatepickerInput();

            if (datepicker !== undefined) this.kbqDatepicker = datepicker;
        }

        if (changes['kbqCalendarInput']) {
            const calendar = this.kbqCalendarInput();

            if (calendar !== undefined) this.kbqCalendar = calendar;
        }

        // A bound `undefined` is handed over too: it removes the filter.
        if (changes['kbqDatepickerFilterInput']) this.kbqDatepickerFilter = this.kbqDatepickerFilterInput();

        if (changes['minInput']) this.min = this.minInput() ?? null;

        if (changes['maxInput']) this.max = this.maxInput() ?? null;

        if (changes['kbqValidationTooltipInput']) {
            const tooltip = this.kbqValidationTooltipInput();

            if (tooltip !== undefined) this.kbqValidationTooltip = tooltip;
        }
    }

    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
        }

        // The browser changes the rendered text without notice as the user types; `setViewValue()` covers the rest.
        this.emptyValue.set(this.isEmpty());
    }

    onContainerClick() {
        this.focus();
    }

    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    focusChanged(isFocused: boolean): void {
        if (isFocused !== this.focused()) {
            this.focusedValue.set(isFocused);
            this.onTouched();
        }
    }

    /**
     * Called when the control is blurred. Needed to properly implement `ControlValueAccessor`.
     *
     * @docs-private
     */
    onTouched = () => {};

    ngAfterContentInit() {
        this.updateErrorState();
    }

    ngOnDestroy() {
        this.datepickerSubscription.unsubscribe();
        this.valueChange.complete();
        this.disabledChange.complete();
    }

    /** @docs-private */
    registerOnValidatorChange(fn: () => void): void {
        this.validatorOnChange = fn;
    }

    /** @docs-private */
    validate(control: AbstractControl): ValidationErrors | null {
        this.setControl(control);

        // Untracked, as `writeValue()`: a form control set from a consumer's `effect()` writes and validates on the
        // spot, and the state read on the way — `focused`, the value — would make the effect run again.
        return this.validator ? untracked(() => this.validator!(control)) : null;
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(value: D): void {
        untracked(() => this.setValue(value));
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: any) => void): void {
        this.cvaOnChange = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.isReadOnly) {
            return;
        }

        // Keys from a scanner, an autotype or a busy page arrive before the timers the previous ones set. Run that
        // work first, so that each key acts on the value and selection a slower typist's would.
        this.runDeferred();

        const keyCode = event.keyCode;

        if (this.isLetterKey(event)) {
            event.preventDefault();

            this.incorrectInput.emit();
        } else if (this.isKeyForOpen(event)) {
            event.preventDefault();

            this.datepicker?.open();
        } else if (this.isKeyForClose(event)) {
            // Consumed only when there is a calendar to close, so a dialog around the input still takes the key.
            if (!this.datepicker?.opened) return;

            event.preventDefault();

            this.datepicker.close();
        } else if (keyCode === TAB) {
            this.datepicker?.close(false);
        } else if (this.isKeyForByPass(event)) {
            return;
        } else if (keyCode === SPACE) {
            this.spaceKeyHandler(event);
        } else if ([UP_ARROW, DOWN_ARROW].includes(keyCode)) {
            event.preventDefault();

            this.verticalArrowKeyHandler(keyCode);
        } else if ([LEFT_ARROW, RIGHT_ARROW, HOME, PAGE_UP, END, PAGE_DOWN].includes(keyCode)) {
            event.preventDefault();

            this.changeCaretPosition(keyCode);
        } else if (/^\D$/.test(event.key)) {
            event.preventDefault();

            const newValue = this.getNewValue(event.key, this.selectionStart as number);
            const formattedValue = this.replaceSymbols(newValue);

            if (newValue !== formattedValue) {
                this.setViewValue(formattedValue, true);

                this.defer(this.onInput);
            } else {
                this.incorrectInput.emit();
            }
        } else {
            this.defer(this.onInput);
        }
    }

    onInput = () => {
        if (!this.readViewValue() && this.viewValue) {
            this.control?.updateValueAndValidity();
        }
    };

    parseOnBlur = (): any => {
        if (!this.viewValue || !this.readyForParse) {
            return null;
        }

        const date: DateTimeObject = this.getDefaultValue();

        const viewDigits: string[] = this.viewValue
            .split(this.separator)
            .map((value: string) => value)
            .filter((value) => value);

        const [firsViewDigit, secondViewDigit, thirdViewDigit] = viewDigits;

        // A text that fails here is reported by `onBlur()` unless the next parse takes it.
        if (viewDigits.length !== 3) {
            this.lastValueValid = false;
            this.valueState.set(null);

            return null;
        }

        date[this.firstDigit!.fullName] = this.firstDigit!.parse(firsViewDigit);
        date[this.secondDigit!.fullName] = this.secondDigit!.parse(secondViewDigit);
        date[this.thirdDigit!.fullName] = this.thirdDigit!.parse(thirdViewDigit);

        const [digitWithYear, viewDigitWithYear] = [this.firstDigit, this.secondDigit, this.thirdDigit].reduce(
            (acc: any, digit, index) => (digit!.value === DateParts.year ? [digit, viewDigits[index]] : acc),
            []
        );

        if (viewDigitWithYear.length < 3) {
            // From the text rather than `date.year`: the year part reads `00` as 1.
            date.year = this.expandShortYear(parseInt(viewDigitWithYear));
        } else if (viewDigitWithYear.length < digitWithYear.length) {
            this.lastValueValid = false;
            this.valueState.set(null);

            return null;
        }

        const newTimeObj = this.createDateTime(date);

        if (!newTimeObj) {
            this.lastValueValid = false;
            this.valueState.set(null);

            return null;
        }

        /* Check if the number of days entered does not match the entered month */
        if (!this.getValidDateOrNull(newTimeObj)) {
            return null;
        }

        this.lastValueValid = !!newTimeObj;

        this.setViewValue(this.getTimeStringFromDate(newTimeObj, this.dateInputFormat), true);

        this.updateValue(newTimeObj);
    };

    onChange() {
        setTimeout(() => {
            this.dateChange.emit(new KbqDatepickerInputEvent(this, this.elementRef.nativeElement));
        });
    }

    /** Handles blur events on the input. */
    onBlur() {
        const wasFocused = this.focused();
        const reportedText = this.control?.getError(parseErrorKey)?.text ?? '';

        // `focused` goes first, as the validators read it, and `onTouched` last: it is what commits the
        // value of a control with `updateOn: 'blur'`, and whatever is emitted after it waits for the next blur.
        this.focusedValue.set(false);

        // A text the form already knows is not a date: parsing it again would only restart its async validators.
        if (!reportedText || reportedText !== this.viewValue) {
            this.parseOnBlur();
            this.readViewValue();

            // Text that is not a date reaches the element without a keydown: an undo, an IME, autofill.
            if (!this.lastValueValid && this.viewValue) {
                this.valueState.set(null);
                this.cvaOnChange(null);
            }
        }

        if (wasFocused) this.onTouched();
    }

    onPaste(event: ClipboardEvent): void {
        event.preventDefault();

        if (this.isReadOnly) return;

        this.replaceText(event.clipboardData?.getData('text') ?? '');
    }

    /**
     * Takes dropped text the way a paste is taken. The browser would insert it at the pointer, with no event
     * the parsing listens to.
     *
     * @internal
     */
    protected onDrop(event: DragEvent): void {
        event.preventDefault();

        // A part dragged within the field would be read as the whole date. A disabled or read-only field is only
        // reached when an ancestor accepts the drop.
        if (this.draggingOwnText || this.disabled() || this.isReadOnly) return;

        this.focus();
        // Not left to the focus: a window that is not active, where a drag from another one ends, fires none.
        this.onTouched();

        this.replaceText(event.dataTransfer?.getData('text') ?? '');
    }

    toISO8601(value: D): string {
        return this.adapter.toIso8601(value);
    }

    /** Refreshes the error state of the input. */
    updateErrorState() {
        this.errorStateTracker.errorStateMatcher = this.errorStateMatcher();
        this.errorStateTracker.updateErrorState();
    }

    /** Returns the ElementRef of the formField if it exists; otherwise, returns the ElementRef of the input. */
    getOrigin(): ElementRef {
        return this.formField ? this.formField.getConnectedOverlayOrigin() : this.elementRef;
    }

    /** Parses the rendered text as typing does, taking the date it holds. Returns whether there was one. */
    private readViewValue(): boolean {
        const cursorPosition = this.correctedCursorPosition();
        const newTimeObj = this.getDateFromString(this.replaceSymbols(this.viewValue));

        this.lastValueValid = !!newTimeObj;

        if (!newTimeObj) {
            if (!this.viewValue) {
                this.updateValue(null as D);
            }

            return false;
        }

        this.setViewValue(this.getTimeStringFromDate(newTimeObj, this.dateInputFormat), true);

        this.selectNextDigitByCursor(cursorPosition);

        this.updateValue(newTimeObj);

        return true;
    }

    /** Takes a pasted or dropped text as the whole value; one that is not a date is rejected as a letter key is. */
    private replaceText(text: string): void {
        // Punctuation around the date comes along when it is copied out of a sentence or brackets.
        const newTimeObj = this.readPastedDate(text.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, ''));

        if (!newTimeObj) {
            if (text.trim()) this.incorrectInput.emit();

            return;
        }

        this.lastValueValid = true;
        this.setViewValue(this.getTimeStringFromDate(newTimeObj, this.dateInputFormat));

        this.updateValue(newTimeObj);
    }

    /**
     * Reads the parts of the format, in its order, from two or three groups of digits split by anything but a
     * letter. A short day or month is padded and a short year expanded as blur does; a group longer than its
     * part, such as the year of an ISO date, makes the text not a date.
     */
    private readPastedDate(text: string): D | null {
        if (!this.readyForParse || !/^\d+(?:[^\p{L}\d]+\d+){1,2}$/u.test(text)) return null;

        const digits = [this.firstDigit!, this.secondDigit!, this.thirdDigit!];
        const parts: string[] = [];

        for (const [index, part] of text.split(/[^\p{L}\d]+/u).entries()) {
            const digit = digits[index];

            if (part.length > digit.length) return null;

            if (!digit.isYear) {
                parts.push(part.padStart(digit.length, '0'));
            } else if (part.length === digit.length) {
                parts.push(part);
            } else if (part.length <= 2) {
                parts.push(`${this.expandShortYear(parseInt(part))}`);
            } else {
                return null;
            }
        }

        return this.getDateFromString(parts.join(this.separator));
    }

    /** A year of one or two digits as a full one. */
    private expandShortYear(year: number): number {
        return year + (year < SHORT_YEAR_PIVOT ? CURRENT_CENTURY_START : PREVIOUS_CENTURY_START);
    }

    private saveTimePart(selected: D) {
        const value = this.value();

        if (!value) {
            return selected;
        }

        const years = this.adapter.getYear(selected);
        const month = this.adapter.getMonth(selected);
        const day = this.adapter.getDate(selected);

        const hours = this.adapter.getHours(value);
        const minutes = this.adapter.getMinutes(value);
        const seconds = this.adapter.getSeconds(value);
        const milliseconds = this.adapter.getMilliseconds(value);

        return this.adapter.createDateTime(years, month, day, hours, minutes, seconds, milliseconds);
    }

    private setFormat(format: string): void {
        // `[a-zA-Z]`, not `[aA-zZ]`: the latter reads as `a`, the range `A-z` and `Z`, and that range
        // takes in the six characters ASCII puts between the two alphabets — opening bracket,
        // backslash, closing bracket, caret, underscore and backtick. A format escaping a literal in
        // brackets could therefore have had that bracket counted as part of a placeholder.
        this.separator = format.match(/[a-zA-Z]+(?<separator>\W|\D)[a-zA-Z]+/)!.groups!.separator;

        this.separatorPositions = format
            .split('')
            .reduce((acc: any, item, index: number) => (this.separator === item ? [...acc, index + 1] : acc), []);

        this.getDigitPositions(format);
    }

    /** Takes a value from any source, re-rendering the element with it. */
    private setValue(value: D | null): void {
        let newValue = this.adapter.deserialize(value);

        this.lastValueValid = !newValue || this.adapter.isValid(newValue);

        newValue = this.getValidDateOrNull(newValue);

        const oldDate = this.valueState();

        this.valueState.set(newValue);
        this.formatValue(newValue);

        if (!this.adapter.sameDate(oldDate, newValue)) {
            this.valueChange.emit(newValue);
        }
    }

    private updateValue(newValue: D) {
        if (!this.adapter.sameDate(newValue, this.value())) {
            this.valueState.set(newValue);
            this.cvaOnChange(newValue);
            this.valueChange.emit(newValue);
            this.dateInput.emit(new KbqDatepickerInputEvent(this, this.elementRef.nativeElement));
        }

        this.control?.updateValueAndValidity({ emitEvent: false });
    }

    private isKeyForClose(event: KeyboardEvent): boolean {
        return (event.altKey && event.keyCode === UP_ARROW) || event.keyCode === ESCAPE;
    }

    private isKeyForOpen(event: KeyboardEvent): boolean {
        return event.altKey && event.keyCode === DOWN_ARROW;
    }

    private isLetterKey(event: KeyboardEvent): boolean {
        return isLetterKey(event) && !event.ctrlKey && !event.metaKey;
    }

    private isKeyForByPass(event: KeyboardEvent): boolean {
        return (
            (hasModifierKey(event) && (isVerticalMovement(event) || isHorizontalMovement(event))) ||
            event.ctrlKey ||
            event.metaKey ||
            [DELETE, BACKSPACE, TAB].includes(event.keyCode)
        );
    }

    private spaceKeyHandler(event: KeyboardEvent) {
        event.preventDefault();

        const position = this.selectionStart as number;

        // Right after a separator the digit group is empty, so a space cannot stand in for one:
        // advance instead of inserting a character the value can never be parsed with.
        if (this.selectionStart !== this.selectionEnd || this.separatorPositions.includes(position)) {
            this.selectNextDigit(position, true);

            return;
        }

        this.setViewValue(this.getNewValue(event.key, position));

        this.defer(this.onInput);
    }

    private getNewValue(key: string, position: number) {
        return [this.viewValue.slice(0, position), key, this.viewValue.slice(position)].join('');
    }

    private setViewValue(value: string, savePosition: boolean = false) {
        const element = this.elementRef.nativeElement;
        const selectionStart = this.selectionStart ?? 0;
        const selectionEnd = this.selectionEnd ?? 0;

        this.renderer.setProperty(element, 'value', value);
        // Right away: a form or a `[value]` binding writes after `ngDoCheck()` has run.
        this.emptyValue.set(this.isEmpty());

        if (savePosition) {
            this.setSelection(selectionStart, selectionEnd);
        } else {
            // A paste, a model write or a calendar pick replaces the whole value, and the offset the
            // previous one was left at has to go with it.
            kbqRevealSelection(element);
        }
    }

    private setSelection(start: number, end: number): void {
        kbqSetSelectionRange(this.elementRef.nativeElement, start, end);
    }

    private replaceSymbols(value: string): string {
        return value
            .split(this.separator)
            .map((part: string) => part.replace(/^([0-9]+)\W$/, '0$1'))
            .join(this.separator);
    }

    private getDateFromString(timeString: string): D | null {
        if (!timeString || timeString.length < this.firstDigit!.length) {
            return null;
        }

        const date = this.getDefaultValue();

        const viewDigits: string[] = timeString.split(this.separator).map((value: string) => value);

        const [firsViewDigit, secondViewDigit, thirdViewDigit] = viewDigits;

        if (viewDigits.length === 1) {
            if (/\D/.test(firsViewDigit) || firsViewDigit.length < this.firstDigit!.length) {
                return null;
            }

            date[this.firstDigit!.fullName] = this.firstDigit!.parse(firsViewDigit);

            if (this.firstDigit!.isDay) {
                date.month = 1;
            }
        } else if (viewDigits.length === 2) {
            if (firsViewDigit.length < this.firstDigit!.length || secondViewDigit.length < this.secondDigit!.length) {
                return null;
            }

            date[this.firstDigit!.fullName] = this.firstDigit!.parse(firsViewDigit);
            date[this.secondDigit!.fullName] = this.secondDigit!.parse(secondViewDigit);
        } else if (viewDigits.length === 3) {
            if (
                firsViewDigit.length < this.firstDigit!.length ||
                secondViewDigit.length < this.secondDigit!.length ||
                thirdViewDigit.length < this.thirdDigit!.length
            ) {
                return null;
            }

            const digitViewValue: { date?: number; month?: number; year?: number } = {};
            const dateDigits = [this.firstDigit, this.secondDigit, this.thirdDigit];

            for (const [index, dateDigit] of dateDigits.entries()) {
                digitViewValue[dateDigit!.fullName] = parseInt(viewDigits[index]);
            }

            const { month, year } = digitViewValue;
            // Set on every parse: a limit left by an earlier date would cut the day of this one.
            const maxDays =
                month && month <= this.firstDigit!.maxMonth && !isNaN(year as number)
                    ? this.getLastDayFor(year as number, month - 1)
                    : MAX_DAYS_IN_MONTH;

            dateDigits.forEach((digit) => (digit!.maxDays = maxDays));

            date[this.firstDigit!.fullName] = this.firstDigit!.parse(firsViewDigit);
            date[this.secondDigit!.fullName] = this.secondDigit!.parse(secondViewDigit);
            date[this.thirdDigit!.fullName] = this.thirdDigit!.parse(thirdViewDigit);
        } else {
            return null;
        }

        return this.getValidDateOrNull(this.createDateTime(date));
    }

    private getDefaultValue(): DateTimeObject {
        const defaultValue = this.value() || this.adapter.today();

        return {
            year: this.adapter.getYear(defaultValue),
            month: this.adapter.getMonth(defaultValue),
            date: this.adapter.getDate(defaultValue),
            hours: this.adapter.getHours(defaultValue),
            minutes: this.adapter.getMinutes(defaultValue),
            seconds: this.adapter.getSeconds(defaultValue),
            milliseconds: this.adapter.getMilliseconds(defaultValue)
        };
    }

    private getTimeStringFromDate(value: D | null, timeFormat: string): string {
        if (!value || !this.adapter.isValid(value)) {
            return '';
        }

        return this.adapter.format(value, timeFormat);
    }

    private getDateEditMetrics(
        cursorPosition: number
    ): [modifiedTimePart: DateParts, cursorStartPosition: number, cursorEndPosition: number] {
        for (const digit of [this.firstDigit, this.secondDigit, this.thirdDigit]) {
            if (cursorPosition >= digit!.start && cursorPosition <= digit!.end) {
                return [digit!.value, digit!.start, digit!.end];
            }
        }

        return [this.thirdDigit!.value, this.thirdDigit!.start, this.thirdDigit!.end];
    }

    private isMaxMonth(date: D): boolean {
        return this.adapter.getMonth(date) === this.getMaxMonth(date);
    }

    private isMinMonth(date: D): boolean {
        return this.adapter.getMonth(date) === this.getMinMonth(date);
    }

    private isMaxYear(date: D): boolean {
        return this.adapter.getYear(date) === this.getMaxYear();
    }

    private isMinYear(date: D): boolean {
        return this.adapter.getYear(date) === this.getMinYear();
    }

    private getMaxDate(date: D): number {
        const maxDate = this.datepicker?.maxDate();

        if (maxDate && this.isMaxYear(date) && this.isMaxMonth(date)) {
            return this.adapter.getDate(maxDate);
        }

        return this.adapter.getNumDaysInMonth(date);
    }

    private getMinDate(date: D): number {
        const minDate = this.datepicker?.minDate();

        if (minDate && this.isMinYear(date) && this.isMinMonth(date)) {
            return this.adapter.getDate(minDate);
        }

        return 1;
    }

    private getMaxMonth(date: D): number {
        const maxDate = this.datepicker?.maxDate();

        if (maxDate && this.isMaxYear(date)) {
            return this.adapter.getMonth(maxDate);
        }

        return 11;
    }

    private getMinMonth(date: D): number {
        const minDate = this.datepicker?.minDate();

        if (minDate && this.isMinYear(date)) {
            return this.adapter.getMonth(minDate);
        }

        return 0;
    }

    private getMaxYear(): number {
        const maxDate = this.datepicker?.maxDate();

        if (maxDate) {
            return this.adapter.getYear(maxDate);
        }

        return MAX_YEAR;
    }

    private getMinYear(): number {
        const minDate = this.datepicker?.minDate();

        if (minDate) {
            return this.adapter.getYear(minDate);
        }

        return 1;
    }

    private incrementDate(date: D, whatToIncrement: DateParts): D {
        let year = this.adapter.getYear(date);
        let month = this.adapter.getMonth(date);
        let day = this.adapter.getDate(date);

        switch (whatToIncrement) {
            case DateParts.day:
                day++;

                if (day > this.getMaxDate(date)) {
                    if (this.isMaxYear(date) && this.isMaxMonth(date)) {
                        day = this.getMaxDate(date);
                    } else if (this.isMinYear(date) && this.isMinMonth(date)) {
                        day = this.getMinDate(date);
                    } else {
                        day = 1;
                    }
                }

                break;
            case DateParts.month: {
                month++;

                if (month > this.getMaxMonth(date)) {
                    if (this.isMaxYear(date)) {
                        month = this.getMaxMonth(date);
                    } else if (this.isMinYear(date)) {
                        month = this.getMinMonth(date);
                    } else {
                        month = 0;
                    }
                }

                const lastDay = this.getLastDayFor(year, month);

                if (day > lastDay) {
                    day = lastDay;
                }

                break;
            }
            case DateParts.year:
                year++;

                if (year > this.getMaxYear()) {
                    year = this.getMaxYear();
                }

                break;
            default:
        }

        return this.createDate(year, month, day);
    }

    private getLastDayFor(year: number, month: number): number {
        // The adapter's own date: the input's one takes the time of the value, and there may be none.
        return this.adapter.getNumDaysInMonth(this.adapter.createDate(year, month, 1));
    }

    private decrementDate(date: D, whatToDecrement: DateParts): D {
        let year = this.adapter.getYear(date);
        let month = this.adapter.getMonth(date);
        let day = this.adapter.getDate(date);

        switch (whatToDecrement) {
            case DateParts.day:
                day--;

                if (day < this.getMinDate(date)) {
                    if (this.isMinYear(date) && this.isMinMonth(date)) {
                        day = this.getMinDate(date);
                    } else if (this.isMaxYear(date) && this.isMaxMonth(date)) {
                        day = this.getMaxDate(date);
                    } else {
                        day = this.adapter.getNumDaysInMonth(date);
                    }
                }

                break;
            case DateParts.month: {
                month--;

                if (month < this.getMinMonth(date)) {
                    if (year === this.getMinYear()) {
                        month = this.getMinMonth(date);
                    } else if (this.isMaxYear(date)) {
                        month = this.getMaxMonth(date);
                    } else {
                        month = 11;
                    }
                }

                const lastDay = this.getLastDayFor(year, month);

                if (day > lastDay) {
                    day = lastDay;
                }

                break;
            }
            case DateParts.year:
                year--;

                if (year < this.getMinYear()) {
                    year = this.getMinYear();
                }

                break;
            default:
        }

        return this.createDate(year, month, day);
    }

    private verticalArrowKeyHandler(keyCode: number): void {
        const value = this.value();

        if (!value) {
            return;
        }

        let changedTime;

        const [modifiedTimePart, selectionStart, selectionEnd] = this.getDateEditMetrics(this.selectionStart as number);

        if (keyCode === UP_ARROW) {
            changedTime = this.incrementDate(value, modifiedTimePart);
        }

        if (keyCode === DOWN_ARROW) {
            changedTime = this.decrementDate(value, modifiedTimePart);
        }

        this.setValue(changedTime);

        this.setSelection(selectionStart, selectionEnd);

        this.cvaOnChange(changedTime);

        this.onChange();
    }

    private changeCaretPosition(keyCode: number): void {
        if (!this.value()) {
            return;
        }

        let cursorPos = this.selectionStart as number;

        if ([HOME, PAGE_UP].includes(keyCode)) {
            cursorPos = 0;
        } else if ([END, PAGE_DOWN].includes(keyCode)) {
            cursorPos = this.viewValue.length;
        } else if (keyCode === LEFT_ARROW) {
            this.fixEmptyDigit();

            cursorPos = cursorPos === 0 ? this.viewValue.length : cursorPos - 1;
        } else if (keyCode === RIGHT_ARROW) {
            this.fixEmptyDigit();

            const nextSeparatorPos: number = this.viewValue.indexOf(this.separator, cursorPos);

            cursorPos = nextSeparatorPos ? nextSeparatorPos + 1 : 0;
        }

        this.selectDigitByCursor(cursorPos);
    }

    private fixEmptyDigit() {
        const hasEmptyDigit = this.viewValue
            .split(this.separator)
            .map((part) => part.length)
            .some((item) => !item);

        const value = this.value();

        if (hasEmptyDigit && value) {
            const year = this.adapter.getYear(value);
            const month = this.adapter.getMonth(value);
            const day = this.adapter.getDate(value);

            this.setValue(this.createDate(year, month, day));
        }
    }

    private selectDigitByCursor(cursorPos: number): void {
        this.defer(() => {
            const [, selectionStart, selectionEnd] = this.getDateEditMetrics(cursorPos);

            this.setSelection(selectionStart, selectionEnd);
        });
    }

    private selectNextDigitByCursor(cursorPos: number): void {
        this.defer(() => {
            const [, , endPositionOfCurrentDigit] = this.getDateEditMetrics(cursorPos);
            const [, selectionStart, selectionEnd] = this.getDateEditMetrics(endPositionOfCurrentDigit + 1);

            this.setSelection(selectionStart, selectionEnd);
        });
    }

    private selectNextDigit(cursorPos: number, cycle: boolean = false): void {
        this.defer(() => {
            const lastValue = cycle ? 0 : cursorPos;
            const nextSeparatorPos: number = this.viewValue.indexOf(this.separator, cursorPos);

            const newCursorPos = nextSeparatorPos > 0 ? nextSeparatorPos + 1 : lastValue;

            const [, selectionStart, selectionEnd] = this.getDateEditMetrics(newCursorPos);

            this.setSelection(selectionStart, selectionEnd);
        });
    }

    /** Runs `work` on a timer, or earlier if the next key comes first. */
    private defer(work: () => void): void {
        const timer = setTimeout(() => {
            this.deferred.delete(timer);
            work();
        });

        this.deferred.set(timer, work);
    }

    /** Runs the work still waiting for its timer, including what that work defers in turn. */
    private runDeferred(): void {
        // A Map iteration also visits the entries added during it.
        for (const [timer, work] of this.deferred) {
            clearTimeout(timer);
            this.deferred.delete(timer);
            work();
        }
    }

    /** Checks whether the input is invalid based on the native validation. */
    private isBadInput(): boolean {
        const validity = (<HTMLInputElement>this.elementRef.nativeElement).validity;

        return validity && validity.badInput;
    }

    /** Whether the input renders no text, read from the element rather than from the last change detection. */
    private isEmpty(): boolean {
        return !this.viewValue && !this.isBadInput();
    }

    private cvaOnChange: (value: any) => void = () => {};

    private validatorOnChange = () => {};

    /** The form control validator for whether the input parses. */
    private parseValidator: ValidatorFn = (): ValidationErrors | null => {
        return this.focused() || this.isEmpty() || this.lastValueValid
            ? null
            : { [parseErrorKey]: { text: this.elementRef.nativeElement.value } };
    };

    /** The form control validator for the min date. */
    private minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        // An unparseable value compares as NaN against any bound, which fails both `<= 0` and
        // `>= 0` and would report the value as simultaneously too early and too late.
        const controlValue = this.getValidDateOrNull(this.adapter.deserialize(control.value));

        return !this.min || !controlValue || this.adapter.compareDateTime(this.min, controlValue) <= 0
            ? null
            : { kbqDatepickerMin: { min: this.min, actual: controlValue } };
    };

    /** The form control validator for the max date. */
    private maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.getValidDateOrNull(this.adapter.deserialize(control.value));

        return !this.max || !controlValue || this.adapter.compareDateTime(this.max, controlValue) >= 0
            ? null
            : { kbqDatepickerMax: { max: this.max, actual: controlValue } };
    };

    /** The form control validator for the date filter. */
    private filterValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.adapter.deserialize(control.value);

        return !this.dateFilter || !controlValue || this.dateFilter(controlValue)
            ? null
            : { kbqDatepickerFilter: true };
    };

    /** Formats a value and sets it on the input element. */
    private formatValue(value: D | null) {
        const formattedValue = value ? this.adapter.format(value, this.dateInputFormat) : '';

        this.setViewValue(formattedValue);
    }

    private setControl(control: AbstractControl) {
        if (this.control) {
            return;
        }

        this.control = control;

        this.control.valueChanges.subscribe((value) => this.valueState.set(value));

        // @TODO resolve types
        this.errorStateTracker.ngControl = { control } as unknown as NgControl;
    }

    /**
     * @param obj The object to check.
     * @returns The given object if it is both a date instance and valid, otherwise null.
     */
    private getValidDateOrNull(obj: any): D | null {
        return this.adapter.isDateInstance(obj) && this.adapter.isValid(obj) ? obj : null;
    }

    private getDigitPositions(format: string) {
        this.firstDigit = this.secondDigit = this.thirdDigit = null;

        const formatInLowerCase = format.toLowerCase();

        formatInLowerCase.split('').reduce(
            ({ prev, length, start }: any, value: string, index: number, arr) => {
                if (value === this.separator || arr.length - 1 === index) {
                    if (!this.firstDigit) {
                        this.firstDigit = new DateDigit(prev, start, length);
                    } else if (!this.secondDigit) {
                        this.secondDigit = new DateDigit(prev, start, length);
                    } else if (!this.thirdDigit) {
                        this.thirdDigit = new DateDigit(prev, start, arr.length - start);
                    }

                    length = 0;
                    start = index + 1;
                } else {
                    length++;
                }

                return { prev: value, length, start };
            },
            { length: 0, start: 0 }
        );

        if (!this.firstDigit || !this.secondDigit || !this.thirdDigit) {
            Error(`Can' t use this format: ${format}`);
        }
    }

    private createDate(year: number, month: number, day: number): D {
        return this.adapter.createDateTime(
            year,
            month,
            day,
            this.adapter.getHours(this.value() as D),
            this.adapter.getMinutes(this.value() as D),
            this.adapter.getSeconds(this.value() as D),
            this.adapter.getMilliseconds(this.value() as D)
        );
    }

    private createDateTime(value: DateTimeObject): D | null {
        if (Object.values(value).some(isNaN)) {
            return null;
        }

        return this.adapter.createDateTime(
            value.year,
            value.month - 1,
            value.date,
            value.hours,
            value.minutes,
            value.seconds,
            value.milliseconds
        );
    }

    // The position to advance from, with a caret that landed just past a separator pulled back onto
    // the digit before it. Returned rather than applied to the field: on the paths where the value
    // cannot be parsed, a moved caret would survive into the next keystroke and change what it does.
    private correctedCursorPosition(): number {
        const position = this.selectionStart ?? 0;

        return this.separatorPositions.includes(position) ? position - 1 : position;
    }
}
