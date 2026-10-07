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
    KbqDateFormats,
    KbqDatepickerLocaleConfiguration,
    KbqDateTimezoneService,
    KbqDeepPartial,
    KbqErrorStateTracker,
    kbqLocaleConfigurationOverrideProvider,
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

class DateDigit {
    maxDays = 31;
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

/** Injection Token for providing configuration of datepicker */
/** @docs-private */
export const KBQ_DATEPICKER_LOCALE_CONFIGURATION = new InjectionToken<KbqDatepickerLocaleConfiguration>(
    'KbqDatepickerLocaleConfiguration',
    { factory: () => KBQ_DATEPICKER_DEFAULT_LOCALE_CONFIGURATION }
);

/**
 * Utility provider for `KBQ_DATEPICKER_LOCALE_CONFIGURATION`. Only the strings you pass are overridden; the rest
 * keep following the active locale.
 */
export const kbqDatepickerLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqDatepickerLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('datepicker', configuration);

/** @deprecated Use {@link KBQ_DATEPICKER_DEFAULT_LOCALE_CONFIGURATION}. */
export const KBQ_DATEPICKER_DEFAULT_CONFIGURATION = KBQ_DATEPICKER_DEFAULT_LOCALE_CONFIGURATION;
/** @deprecated Use {@link KBQ_DATEPICKER_LOCALE_CONFIGURATION}. */
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
        { provide: KbqFormFieldControl, useExisting: KbqDatepickerInput }
    ],
    host: {
        class: 'kbq-input kbq-datepicker',
        '[attr.id]': 'id()',
        '[attr.placeholder]': 'placeholder()',
        '[attr.required]': 'required()',
        '[attr.disabled]': 'disabled() || null',
        '[attr.min]': 'min ? toISO8601(min) : null',
        '[attr.max]': 'max ? toISO8601(max) : null',
        '[attr.autocomplete]': '"off"',
        '(paste)': 'onPaste($event)',
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
        KBQ_DATEPICKER_LOCALE_CONFIGURATION
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

    /** Function that can be used to filter out dates within the datepicker. */
    set kbqDatepickerFilter(value: (date: D | null) => boolean) {
        this.dateFilter = value;
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

    /** The combined form control validator for this input. */
    private readonly validator: ValidatorFn | null;

    private separator: string;

    private firstDigit: DateDigit | null = null;
    private secondDigit: DateDigit | null = null;
    private thirdDigit: DateDigit | null = null;

    private separatorPositions: number[];

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
            untracked(() => {
                this.setFormat(this.dateInputFormat);
                this.setValue(this.valueState());
            });
        });

        this.timezoneService.changes.pipe(takeUntilDestroyed()).subscribe(() => {
            // The rendered text names a wall clock in the zone it was formatted in. Left as it is, the
            // next keystroke re-parses it against the new zone and emits a different instant.
            this.setValue(this.valueState());
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        // A bound input is handed to its member as the decorator input did; unbound, it leaves what code wrote.
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

        if (changes['kbqDatepickerFilterInput']) {
            const filter = this.kbqDatepickerFilterInput();

            if (filter !== undefined) this.kbqDatepickerFilter = filter;
        }

        // A bound `undefined` is handed over too, as an unset bound: it lifts the restriction.
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

        // The rendered text changes without notice: through the keyboard handlers, which write the element.
        this.emptyValue.set(!this.viewValue && !this.isBadInput());
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

        return this.validator ? this.validator(control) : null;
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(value: D): void {
        this.setValue(value);
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

        const keyCode = event.keyCode;

        if (this.isLetterKey(event)) {
            event.preventDefault();

            // TODO: The 'emit' function requires a mandatory void argument
            this.incorrectInput.emit();
        } else if (this.isKeyForOpen(event)) {
            event.preventDefault();

            this.datepicker?.open();
        } else if (this.isKeyForClose(event)) {
            event.preventDefault();

            this.datepicker?.close();
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

                setTimeout(this.onInput);
            } else {
                // TODO: The 'emit' function requires a mandatory void argument
                this.incorrectInput.emit();
            }
        } else {
            setTimeout(this.onInput);
        }
    }

    onInput = () => {
        const cursorPosition = this.correctedCursorPosition();
        const formattedValue = this.replaceSymbols(this.viewValue);

        const newTimeObj = this.getDateFromString(formattedValue);

        this.lastValueValid = !!newTimeObj;

        if (!newTimeObj) {
            if (!this.viewValue) {
                this.lastValueValid = false;
                this.updateValue(newTimeObj as D);
            } else {
                this.control?.updateValueAndValidity();
            }

            return;
        }

        this.setViewValue(this.getTimeStringFromDate(newTimeObj, this.dateInputFormat), true);

        this.selectNextDigitByCursor(cursorPosition);

        this.updateValue(newTimeObj);
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

        if (viewDigits.length !== 3) {
            this.lastValueValid = false;
            this.valueState.set(null);

            return setTimeout(() => this.control?.updateValueAndValidity());
        }

        date[this.firstDigit!.fullName] = this.firstDigit!.parse(firsViewDigit);
        date[this.secondDigit!.fullName] = this.secondDigit!.parse(secondViewDigit);
        date[this.thirdDigit!.fullName] = this.thirdDigit!.parse(thirdViewDigit);

        const [digitWithYear, viewDigitWithYear] = [this.firstDigit, this.secondDigit, this.thirdDigit].reduce(
            (acc: any, digit, index) => (digit!.value === DateParts.year ? [digit, viewDigits[index]] : acc),
            []
        );

        if (viewDigitWithYear.length < 3) {
            date.year += date.year < 30 ? 2000 : 1900;
        } else if (viewDigitWithYear.length < digitWithYear.length) {
            this.lastValueValid = false;
            this.valueState.set(null);

            return setTimeout(() => this.control?.updateValueAndValidity());
        }

        const newTimeObj = this.createDateTime(date);

        if (!newTimeObj) {
            this.lastValueValid = false;
            this.valueState.set(null);
            this.cvaOnChange(null);

            return setTimeout(() => this.control?.updateValueAndValidity());
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
        // Reformat the input only if we have a valid value.
        this.parseOnBlur();

        this.focusChanged(false);

        this.onInput();
    }

    onPaste($event) {
        $event.preventDefault();

        let rawValue = $event.clipboardData.getData('text');

        if (rawValue.match(/^\d\D/)) {
            rawValue = `0${rawValue}`;
        }

        rawValue.replace(/[^A-Za-z0-9]+/g, this.separator);

        if (/[a-z]/gi.test(rawValue)) {
            // TODO: The 'emit' function requires a mandatory void argument
            this.incorrectInput.emit();
        }

        const match: RegExpMatchArray | null = rawValue.match(/^(?<first>\d+)\W(?<second>\d+)\W(?<third>\d+)$/);

        if (!match?.groups?.first || !match?.groups?.second || !match?.groups?.third) {
            this.setViewValue(rawValue);

            return rawValue;
        }

        const value = [match.groups.first, match.groups.second, match.groups.third].join(this.separator);

        const newTimeObj = this.getDateFromString(value);

        if (!newTimeObj) {
            this.setViewValue(value);

            return value;
        }

        this.setViewValue(this.getTimeStringFromDate(newTimeObj, this.dateInputFormat));

        this.updateValue(newTimeObj);
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

        setTimeout(this.onInput);
    }

    private getNewValue(key: string, position: number) {
        return [this.viewValue.slice(0, position), key, this.viewValue.slice(position)].join('');
    }

    private setViewValue(value: string, savePosition: boolean = false) {
        const element = this.elementRef.nativeElement;
        const selectionStart = this.selectionStart ?? 0;
        const selectionEnd = this.selectionEnd ?? 0;

        this.renderer.setProperty(element, 'value', value);

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

            if (this.value() && digitViewValue.month && digitViewValue.month <= this.firstDigit!.maxMonth) {
                dateDigits.forEach(
                    (digit) =>
                        (digit!.maxDays = this.getLastDayFor(
                            digitViewValue.year as number,
                            (digitViewValue.month as number) - 1
                        ))
                );
            }

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
        return this.adapter.getNumDaysInMonth(this.createDate(year, month, 1));
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
        setTimeout(() => {
            const [, selectionStart, selectionEnd] = this.getDateEditMetrics(cursorPos);

            this.setSelection(selectionStart, selectionEnd);
        });
    }

    private selectNextDigitByCursor(cursorPos: number): void {
        setTimeout(() => {
            const [, , endPositionOfCurrentDigit] = this.getDateEditMetrics(cursorPos);
            const [, selectionStart, selectionEnd] = this.getDateEditMetrics(endPositionOfCurrentDigit + 1);

            this.setSelection(selectionStart, selectionEnd);
        });
    }

    private selectNextDigit(cursorPos: number, cycle: boolean = false): void {
        setTimeout(() => {
            const lastValue = cycle ? 0 : cursorPos;
            const nextSeparatorPos: number = this.viewValue.indexOf(this.separator, cursorPos);

            const newCursorPos = nextSeparatorPos > 0 ? nextSeparatorPos + 1 : lastValue;

            const [, selectionStart, selectionEnd] = this.getDateEditMetrics(newCursorPos);

            this.setSelection(selectionStart, selectionEnd);
        });
    }

    /** Checks whether the input is invalid based on the native validation. */
    private isBadInput(): boolean {
        const validity = (<HTMLInputElement>this.elementRef.nativeElement).validity;

        return validity && validity.badInput;
    }

    private cvaOnChange: (value: any) => void = () => {};

    private validatorOnChange = () => {};

    /** The form control validator for whether the input parses. */
    private parseValidator: ValidatorFn = (): ValidationErrors | null => {
        return this.focused() || !this.viewValue || this.isBadInput() || this.lastValueValid
            ? null
            : { kbqDatepickerParse: { text: this.elementRef.nativeElement.value } };
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
