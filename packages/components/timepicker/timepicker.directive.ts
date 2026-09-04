import { _IdGenerator } from '@angular/cdk/a11y';
import {
    AfterContentInit,
    booleanAttribute,
    computed,
    Directive,
    DoCheck,
    effect,
    ElementRef,
    forwardRef,
    inject,
    InjectionToken,
    Input,
    input,
    OnDestroy,
    output,
    Provider,
    Renderer2
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
    hasModifierKey,
    HOME,
    isHorizontalMovement,
    isLetterKey,
    isVerticalMovement,
    KbqDateTimezoneService,
    KbqDeepPartial,
    KbqErrorStateTracker,
    kbqInjectLocaleConfiguration,
    kbqLocaleConfigurationOverrideProvider,
    kbqRevealSelection,
    kbqSetSelectionRange,
    KbqTimepickerLocaleConfiguration,
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
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import type { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { noop, Subject } from 'rxjs';

import {
    AM_PM_FORMAT_REGEXP,
    DEFAULT_TIME_FORMAT,
    HOURS_MINUTES_REGEXP,
    HOURS_MINUTES_SECONDS_REGEXP,
    HOURS_ONLY_REGEXP,
    HOURS_PER_DAY,
    MINUTES_PER_HOUR,
    SECONDS_PER_MINUTE,
    TIMEFORMAT_PLACEHOLDERS,
    TimeFormats,
    TimeFormatToLocaleKeys,
    TimeParts
} from './timepicker.constants';

/** @docs-private */
export const KBQ_TIMEPICKER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqTimepicker),
    multi: true
};

/** @docs-private */
export const KBQ_TIMEPICKER_VALIDATORS: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => KbqTimepicker),
    multi: true
};

/** Default configuration of the timepicker.
 * @docs-private */
export const KBQ_TIMEPICKER_DEFAULT_CONFIGURATION: KbqTimepickerLocaleConfiguration = ruRULocaleData.timepicker;

/** Injection token for providing the default configuration of the timepicker.
 * @docs-private */
export const KBQ_TIMEPICKER_CONFIGURATION = new InjectionToken<KbqTimepickerLocaleConfiguration>(
    'KbqTimepickerConfiguration',
    { factory: () => KBQ_TIMEPICKER_DEFAULT_CONFIGURATION }
);

/**
 * Utility provider for `KBQ_TIMEPICKER_CONFIGURATION`. Only the strings you pass are overridden; the rest
 * keep following the active locale.
 */
export const kbqTimepickerLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqTimepickerLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('timepicker', configuration);

const shortFormatSize: number = 5;
const fullFormatSize: number = 8;

/** Maximum number of digits in a single time part */
const timePartLength: number = 2;

/** Coerces a time format, falling back to the default for anything the enum does not name. */
const timeFormatAttribute = (value: unknown): TimeFormats =>
    Object.values(TimeFormats).includes(value as TimeFormats) ? (value as TimeFormats) : DEFAULT_TIME_FORMAT;

@Directive({
    selector: 'input[kbqTimepicker]',
    providers: [
        KBQ_TIMEPICKER_VALIDATORS,
        KBQ_TIMEPICKER_VALUE_ACCESSOR,
        { provide: KbqFormFieldControl, useExisting: KbqTimepicker }
    ],
    host: {
        class: 'kbq-input kbq-timepicker',
        // Native input properties that are overwritten by Angular inputs need to be synced with
        // the native input element. Otherwise property bindings for those don't work.
        '[attr.id]': 'id',
        '[attr.placeholder]': 'placeholder',
        '[attr.disabled]': 'disabled || null',
        '[attr.required]': 'required',
        '[attr.size]': 'getSize()',
        '[attr.autocomplete]': '"off"',
        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)',
        '(paste)': 'onPaste($event)',
        '(keydown)': 'onKeyDown($event)'
    },
    exportAs: 'kbqTimepicker'
})
export class KbqTimepicker<D>
    implements KbqFormFieldControl<D>, ControlValueAccessor, Validator, OnDestroy, DoCheck, AfterContentInit
{
    private readonly uid = inject(_IdGenerator).getId('kbq-timepicker-');

    private elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
    private readonly renderer = inject(Renderer2);
    private dateAdapter = inject<DateAdapter<any>>(DateAdapter, { optional: true })!;
    private readonly timezoneService = inject(KbqDateTimezoneService);
    private readonly configuration = kbqInjectLocaleConfiguration('timepicker', KBQ_TIMEPICKER_CONFIGURATION);
    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    readonly stateChanges: Subject<void> = new Subject<void>();

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    focused: boolean = false;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    controlType: string = 'timepicker';

    /** Object used to control when error messages are shown. */
    // Stays an accessor: `CanUpdateErrorState` declares it as a plain member, and it delegates to the
    // shared `KbqErrorStateTracker`.
    @Input()
    get errorStateMatcher() {
        return this.errorStateTracker.errorStateMatcher;
    }

    set errorStateMatcher(value: ErrorStateMatcher) {
        this.errorStateTracker.errorStateMatcher = value;
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    // Stays an accessor: `KbqFormFieldControl` declares `placeholder` as a plain member, and the setter
    // records that the consumer took it over from the locale-provided default.
    @Input()
    get placeholder(): string {
        return this._placeholder;
    }

    set placeholder(value: string) {
        this._placeholder = value;

        this.defaultPlaceholder = false;
    }

    private _placeholder = TIMEFORMAT_PLACEHOLDERS[DEFAULT_TIME_FORMAT];

    // Stays an accessor: `KbqFormFieldControl` declares `disabled` as a plain member.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;

        // Browsers may not fire the blur event if the input is disabled too quickly.
        // Reset from here to ensure that the element doesn't become stuck.
        if (this.focused) {
            this.focused = false;
        }

        this.stateChanges.next();
    }

    private _disabled: boolean;

    // Stays an accessor: `KbqFormFieldControl` declares `id` as a plain member.
    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this.uid;
    }

    private _id: string = this.uid;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    // Stays an accessor: `KbqFormFieldControl` declares `required` as a plain member.
    @Input({ transform: booleanAttribute })
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = value;
    }

    private _required: boolean;

    /** Time format the input parses and renders. An unsupported value falls back to the default. */
    readonly format = input(DEFAULT_TIME_FORMAT, { transform: timeFormatAttribute });

    /** Earliest time the control accepts. Anything the date adapter cannot read is treated as unset. */
    readonly min = input<D | null>(null);

    /** Latest time the control accepts. Anything the date adapter cannot read is treated as unset. */
    readonly max = input<D | null>(null);

    /** `min` as the date adapter reads it, or null when it cannot. */
    private readonly minDate = computed(() => this.getValidDateOrNull(this.dateAdapter.deserialize(this.min())));

    /** `max` as the date adapter reads it, or null when it cannot. */
    private readonly maxDate = computed(() => this.getValidDateOrNull(this.dateAdapter.deserialize(this.max())));

    // Stays an accessor: `KbqFormFieldControl` declares `value` as a plain member, and the setter is the
    // single place the view is re-rendered from.
    @Input()
    get value(): D | null {
        return this._value;
    }

    set value(value: D | null) {
        const newValue = this.dateAdapter.deserialize(value);

        this.lastValueValid = !newValue || this.dateAdapter.isValid(newValue);

        this._value = this.getValidDateOrNull(newValue);

        this.updateView();
    }

    private _value: D | null;

    /** Tooltip shown for a moment whenever a keystroke is rejected. */
    readonly kbqValidationTooltip = input<KbqTooltipTrigger | undefined>();

    readonly incorrectInput = output<void>();

    get hasSelection(): boolean {
        return this.selectionStart !== this.selectionEnd;
    }

    get isFullFormat(): boolean {
        return this.format() === TimeFormats.HHmmss;
    }

    get isShortFormat(): boolean {
        return this.format() === TimeFormats.HHmm;
    }

    get viewValue(): string {
        return this.elementRef.nativeElement.value;
    }

    get ngControl(): any {
        return this.control;
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    get empty(): boolean {
        return !this.viewValue && !this.isBadInput();
    }

    get selectionStart(): number | null {
        return this.elementRef.nativeElement.selectionStart;
    }

    set selectionStart(value: number | null) {
        this.elementRef.nativeElement.selectionStart = value;

        kbqRevealSelection(this.elementRef.nativeElement);
    }

    get selectionEnd(): number | null {
        return this.elementRef.nativeElement.selectionEnd;
    }

    set selectionEnd(value: number | null) {
        this.elementRef.nativeElement.selectionEnd = value;

        kbqRevealSelection(this.elementRef.nativeElement);
    }

    /** Localized placeholder */
    get timeFormatPlaceholder(): string {
        return (
            this.configuration().placeholder[TimeFormatToLocaleKeys[this.format()]] ||
            TIMEFORMAT_PLACEHOLDERS[this.format()]
        );
    }

    /** @docs-private */
    get errorState(): boolean {
        return this.errorStateTracker.errorState;
    }

    set errorState(value: boolean) {
        this.errorStateTracker.errorState = value;
    }

    private readonly validator: ValidatorFn | null;

    private lastValueValid = false;

    private control?: AbstractControl;

    private defaultPlaceholder = true;
    private separator = ':';

    private onChange: (value: any) => void;
    private onTouched: () => void;

    private readonly errorStateTracker: KbqErrorStateTracker;

    constructor() {
        if (!this.dateAdapter) {
            throw Error(
                `KbqTimepicker: No provider found for DateAdapter. You must import one of the existing ` +
                    `modules at your application root or provide a custom implementation or use exists ones.`
            );
        }

        this.validator = Validators.compose([this.parseValidator, this.minValidator, this.maxValidator]);

        this.onChange = noop;
        this.onTouched = noop;

        this.errorStateTracker = new KbqErrorStateTracker(
            inject(ErrorStateMatcher),
            null,
            inject(FormGroupDirective, { optional: true }),
            inject(NgForm, { optional: true }),
            this.stateChanges
        );

        effect(() => {
            // Read before the guard: an early return that skipped it would leave the effect with nothing
            // to track, and the next locale or format change would never reach the input.
            const placeholder = this.timeFormatPlaceholder;

            if (this.defaultPlaceholder) {
                // Assigned through the private field so the setter does not mark it consumer-provided.
                this._placeholder = placeholder;
            }

            // Re-assigning the value re-runs it through the date adapter, which formats on the new locale
            // and the new format.
            this.value = this._value;
        });

        // `min` and `max` feed the validators, which Angular only re-runs when it is told to.
        effect(() => {
            this.minDate();
            this.maxDate();

            this.validatorOnChange();
        });

        effect((onCleanup) => {
            const tooltip = this.kbqValidationTooltip();

            if (!tooltip) return;

            tooltip.enterDelay = validationTooltipShowDelay;
            tooltip.trigger = 'manual';

            tooltip.initListeners();

            const subscription = this.incorrectInput.subscribe(() => {
                if (tooltip.isOpen) return;

                tooltip.show();

                setTimeout(() => tooltip.hide(), validationTooltipHideDelay);
            });

            onCleanup(() => subscription.unsubscribe());
        });

        this.timezoneService.changes.pipe(takeUntilDestroyed()).subscribe(() => {
            // The rendered text names a wall clock in the zone it was formatted in. Left as it is, the
            // next keystroke re-parses it against the new zone and emits a different instant.
            this.value = this._value;
        });
    }

    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
        }
    }

    ngAfterContentInit() {
        this.updateErrorState();
    }

    ngOnDestroy(): void {
        this.stateChanges.complete();
    }

    getSize(): number {
        return this.isFullFormat ? fullFormatSize : shortFormatSize;
    }

    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    focusChanged(isFocused: boolean): void {
        if (isFocused !== this.focused) {
            this.focused = isFocused;
            this.onTouched();
            this.stateChanges.next();
        }
    }

    onBlur() {
        this.focusChanged(false);

        if (this.viewValue !== this.getTimeStringFromDate(this.value, this.format())) {
            this.setViewValue(this.formatUserPaste(this.viewValue));

            this.onInput();
        }
    }

    onPaste($event) {
        $event.preventDefault();

        const value = this.formatUserPaste($event.clipboardData.getData('text'));

        const newTimeObj = this.getDateFromTimeString(value);

        if (!newTimeObj) {
            return;
        }

        this.setViewValue(this.getTimeStringFromDate(newTimeObj, this.format()));

        this.value = newTimeObj;
        this.onChange(newTimeObj);
        this.stateChanges.next();
    }

    onInput = () => {
        const formattedValue = this.formatUserInput(this.viewValue);

        const newTimeObj = this.getDateFromTimeString(formattedValue);

        this.lastValueValid = !!newTimeObj;

        const selectionStart = this.selectionStart;
        const selectionEnd = this.selectionEnd;
        const nextViewValue = newTimeObj ? this.getTimeStringFromDate(newTimeObj, this.format()) : formattedValue;
        // A complete time is always rewritten, so that the caret keeps walking between the time parts.
        // An incomplete one (e.g. `23:1`) is rewritten only when normalization trimmed it — otherwise
        // the extra digits stay in the input and the value grows unbounded.
        const shouldUpdateView = !!newTimeObj || nextViewValue !== this.viewValue;

        if (shouldUpdateView) {
            this.setViewValue(nextViewValue);

            if (selectionStart !== null) {
                const rangeEnd = newTimeObj ? (selectionEnd ?? selectionStart) : selectionStart;

                this.setSelection(selectionStart, rangeEnd);

                this.createSelectionOfTimeComponentInInput(selectionStart + 1);
            }
        }

        if (!newTimeObj) {
            if (!this.viewValue) {
                this.onChange(null);
            }

            return;
        }

        this.value = newTimeObj;
        this.onChange(newTimeObj);
        this.stateChanges.next();
    };

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    onContainerClick() {
        this.focus();
    }

    onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        if (isLetterKey(event) && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();

            // TODO: The 'emit' function requires a mandatory void argument
            this.incorrectInput.emit();
        } else if (
            (hasModifierKey(event) && (isVerticalMovement(event) || isHorizontalMovement(event))) ||
            event.ctrlKey ||
            event.metaKey ||
            [DELETE, BACKSPACE, TAB].includes(keyCode)
        ) {
            noop();
        } else if (keyCode === SPACE) {
            this.spaceKeyHandler(event);
        } else if ([HOME, PAGE_UP].includes(keyCode)) {
            this.createSelectionOfTimeComponentInInput(0);
        } else if ([END, PAGE_DOWN].includes(keyCode)) {
            this.createSelectionOfTimeComponentInInput(this.viewValue.length);
        } else if ([UP_ARROW, DOWN_ARROW].includes(keyCode)) {
            event.preventDefault();

            this.verticalArrowKeyHandler(keyCode);
        } else if ([LEFT_ARROW, RIGHT_ARROW].includes(keyCode)) {
            this.horizontalArrowKeyHandler(keyCode);
        } else if (/^\D$/.test(event.key)) {
            event.preventDefault();

            const newValue = this.getNewValue(event.key, this.selectionStart as number);
            const formattedValue = this.replaceSymbols(newValue);

            if (newValue !== formattedValue) {
                this.setViewValue(formattedValue);

                setTimeout(this.onInput);
            } else {
                // TODO: The 'emit' function requires a mandatory void argument
                this.incorrectInput.emit();
            }
        } else {
            setTimeout(this.onInput);
        }
    }

    validate(control: AbstractControl): ValidationErrors | null {
        this.setControl(control);

        return this.validator ? this.validator(control) : null;
    }

    registerOnValidatorChange(fn: () => void): void {
        this.validatorOnChange = fn;
    }

    writeValue(value: D | null): void {
        this.value = value;
    }

    registerOnChange(fn: (value: D) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    private formatUserPaste(value: string) {
        if (value.match(AM_PM_FORMAT_REGEXP)) {
            return value;
        }

        const match: RegExpMatchArray | null = value.match(
            /^(\D+)?(?<hours>\d+)?(\D+)?(\D+)?(?<minutes>\d+)?(\D+)?(\D+)?(?<seconds>\d+)?(\D+)?$/
        );

        if (!match?.groups?.hours) {
            this.setViewValue(value);

            return value;
        }

        return this.replaceNumbers(
            Object.values(match.groups)
                .map((group) => (group || '').padStart(2, '0'))
                .join(':')
        );
    }

    private formatUserInput(value: string): string {
        return this.replaceNumbers(this.replaceSymbols(value));
    }

    private replaceSymbols(value: string): string {
        let formattedValue: string = value;

        const match: RegExpMatchArray | null = value.match(/^(\d\d:){0,2}(?<number>[0-9])(?<symbol>\W)(:\d\d){0,2}$/);

        if (match?.groups) {
            const { number, symbol } = match.groups;

            formattedValue = value.replace(number + symbol, `0${number}`);
        }

        return formattedValue;
    }

    private replaceNumbers(value: string): string {
        let formattedValue: string = value;

        const match: RegExpMatchArray | null = value.match(/^(?<hours>\d*):?(?<minutes>\d*):?(?<seconds>\d*)$/);

        if (match?.groups) {
            const { hours, minutes, seconds } = match.groups;

            if (hours.length) {
                formattedValue = formattedValue.replace(hours, this.normalizeTimePart(hours, HOURS_PER_DAY));
            }

            if (minutes.length) {
                formattedValue = formattedValue.replace(minutes, this.normalizeTimePart(minutes, MINUTES_PER_HOUR));
            }

            if (seconds.length) {
                formattedValue = formattedValue.replace(seconds, this.normalizeTimePart(seconds, SECONDS_PER_MINUTE));
            }
        }

        return formattedValue;
    }

    /** Clamps a time part to the allowed maximum and trims it to two digits */
    private normalizeTimePart(part: string, maxValue: number): string {
        if (part.length <= timePartLength && parseInt(part) <= maxValue) {
            return part;
        }

        return `${Math.min(parseInt(part), maxValue)}`.padStart(timePartLength, '0');
    }

    /** Checks whether the input is invalid based on the native validation. */
    private isBadInput(): boolean {
        const validity = (<HTMLInputElement>this.elementRef.nativeElement).validity;

        return validity && validity.badInput;
    }

    private spaceKeyHandler(event: KeyboardEvent) {
        event.preventDefault();

        if (this.selectionStart === this.selectionEnd) {
            const value = this.getNewValue(event.key, this.selectionStart as number);
            const formattedValue = this.replaceSymbols(value);

            if (value !== formattedValue) {
                this.setViewValue(formattedValue);

                setTimeout(this.onInput);
            }
        } else if (this.selectionStart !== this.selectionEnd) {
            let cursorPos = this.selectionStart as number;

            const nextDividerPos: number = this.viewValue.indexOf(':', cursorPos);

            cursorPos = nextDividerPos ? nextDividerPos + 1 : 0;

            this.createSelectionOfTimeComponentInInput(cursorPos);
        }
    }

    private getNewValue(key: string, position: number) {
        return [this.viewValue.slice(0, position), key, this.viewValue.slice(position)].join('');
    }

    private verticalArrowKeyHandler(keyCode: number): void {
        if (!this.value) {
            return;
        }

        let changedTime;

        const newEditParams = this.getTimeEditMetrics(this.selectionStart as number);

        if (keyCode === UP_ARROW) {
            changedTime = this.incrementTime(this.value, newEditParams.modifiedTimePart);
        }

        if (keyCode === DOWN_ARROW) {
            changedTime = this.decrementTime(this.value, newEditParams.modifiedTimePart);
        }

        this.value = changedTime;

        this.setSelection(newEditParams.cursorStartPosition, newEditParams.cursorEndPosition);

        this.onChange(changedTime);
        this.stateChanges.next();
    }

    private fixEmptyDigit() {
        const hasEmptyDigit = this.viewValue
            .split(this.separator)
            .map((part) => part.length)
            .some((item) => !item);

        if (hasEmptyDigit && this.value) {
            this.value = this.dateAdapter.clone(this.value);
        }
    }

    private horizontalArrowKeyHandler(keyCode: number): void {
        if (!this.value) {
            return;
        }

        let cursorPos = this.selectionStart as number;

        if (keyCode === LEFT_ARROW) {
            this.fixEmptyDigit();

            cursorPos = cursorPos === 0 ? this.viewValue.length : cursorPos - 1;
        } else if (keyCode === RIGHT_ARROW) {
            this.fixEmptyDigit();

            const nextDividerPos: number = this.viewValue.indexOf(':', cursorPos);

            cursorPos = nextDividerPos ? nextDividerPos + 1 : 0;
        }

        this.createSelectionOfTimeComponentInInput(cursorPos);
    }

    private createSelectionOfTimeComponentInInput(cursorPos: number): void {
        setTimeout(() => {
            const newEditParams = this.getTimeEditMetrics(cursorPos);

            this.setSelection(newEditParams.cursorStartPosition, newEditParams.cursorEndPosition);
        });
    }

    private incrementTime(dateVal: D, whatToIncrement: TimeParts = TimeParts.seconds): D {
        let hours = this.dateAdapter.getHours(dateVal);
        let minutes = this.dateAdapter.getMinutes(dateVal);
        let seconds = this.dateAdapter.getSeconds(dateVal);

        switch (whatToIncrement) {
            case TimeParts.hours:
                hours++;
                break;
            case TimeParts.minutes:
                minutes++;
                break;
            case TimeParts.seconds:
                seconds++;
                break;
            default:
        }

        if (seconds > SECONDS_PER_MINUTE) {
            seconds = 0;
        }

        if (minutes > MINUTES_PER_HOUR) {
            minutes = 0;
        }

        if (hours > HOURS_PER_DAY) {
            hours = 0;
        }

        return this.dateAdapter.createDateTime(
            this.dateAdapter.getYear(this.value),
            this.dateAdapter.getMonth(this.value),
            this.dateAdapter.getDate(this.value),
            hours,
            minutes,
            seconds,
            this.dateAdapter.getMilliseconds(this.value)
        );
    }

    private decrementTime(dateVal: D, whatToDecrement: TimeParts = TimeParts.seconds): D {
        let hours = this.dateAdapter.getHours(dateVal);
        let minutes = this.dateAdapter.getMinutes(dateVal);
        let seconds = this.dateAdapter.getSeconds(dateVal);

        switch (whatToDecrement) {
            case TimeParts.hours:
                hours--;
                break;
            case TimeParts.minutes:
                minutes--;
                break;
            case TimeParts.seconds:
                seconds--;
                break;
            default:
        }

        if (seconds < 0) {
            seconds = SECONDS_PER_MINUTE;
        }

        if (minutes < 0) {
            minutes = MINUTES_PER_HOUR;
        }

        if (hours < 0) {
            hours = HOURS_PER_DAY;
        }

        return this.dateAdapter.createDateTime(
            this.dateAdapter.getYear(this.value),
            this.dateAdapter.getMonth(this.value),
            this.dateAdapter.getDate(this.value),
            hours,
            minutes,
            seconds,
            this.dateAdapter.getMilliseconds(this.value)
        );
    }

    /**
     * @description Get params for arrow-keys (up/down) time value edit.
     * @param cursorPosition Current cursor position in timeString
     */
    private getTimeEditMetrics(cursorPosition: number): {
        modifiedTimePart: TimeParts;
        cursorStartPosition: number;
        cursorEndPosition: number;
    } {
        const timeString: string = this.viewValue;
        let modifiedTimePart: TimeParts;
        let cursorStartPosition: number;
        let cursorEndPosition: number;

        const hoursIndex = 0;
        const minutesIndex = timeString.indexOf(':', hoursIndex + 1);
        const secondsIndex = minutesIndex !== -1 ? timeString.indexOf(':', minutesIndex + 1) : -1;

        if (secondsIndex !== -1 && cursorPosition > secondsIndex) {
            modifiedTimePart = TimeParts.seconds;
            cursorStartPosition = secondsIndex + 1;
            cursorEndPosition = timeString.length;
        } else if (minutesIndex !== -1 && cursorPosition > minutesIndex) {
            modifiedTimePart = TimeParts.minutes;
            cursorStartPosition = minutesIndex + 1;
            cursorEndPosition = secondsIndex > -1 ? secondsIndex : timeString.length;
        } else {
            modifiedTimePart = TimeParts.hours;
            cursorStartPosition = hoursIndex;
            cursorEndPosition = minutesIndex !== -1 ? minutesIndex : timeString.length;
        }

        return { modifiedTimePart, cursorStartPosition, cursorEndPosition };
    }

    /**
     * @description Create time string for displaying inside input element of UI
     */
    private getTimeStringFromDate(value: D | null, timeFormat: TimeFormats): string {
        if (!value || !this.dateAdapter.isValid(value)) {
            return '';
        }

        return this.dateAdapter.format(value, timeFormat);
    }

    private getDateFromTimeString(timeString: string): D | null {
        if (!timeString) {
            return null;
        }

        const date = this.value || this.dateAdapter.today();

        const HMS = timeString.match(HOURS_MINUTES_SECONDS_REGEXP);
        const HM = timeString.match(HOURS_MINUTES_REGEXP);
        const H = timeString.match(HOURS_ONLY_REGEXP);
        const amPm = timeString.match(AM_PM_FORMAT_REGEXP);

        let hours: number = 0;
        let minutes: number = 0;
        let seconds: number = 0;

        if (amPm) {
            hours = Number(amPm[1]);
            minutes = Number(amPm[2]);

            if (/[p]/i.test(amPm[3]) || (/[a]/i.test(amPm[3]) && hours === 12)) {
                hours += 12;
            }
        } else if (HMS && this.isShortFormat) {
            hours = Number(HMS[1]);
            minutes = Number(HMS[2]);
            seconds = this.dateAdapter.getSeconds(date);
        } else if (HMS) {
            hours = Number(HMS[1]);
            minutes = Number(HMS[2]);
            seconds = Number(HMS[3]);
        } else if (HM) {
            hours = Number(HM[1]);
            minutes = Number(HM[2]);
        } else if (H) {
            hours = Number(H[1]);
        } else {
            return null;
        }

        const resultDate = this.dateAdapter.createDateTime(
            this.dateAdapter.getYear(date),
            this.dateAdapter.getMonth(date),
            this.dateAdapter.getDate(date),
            hours,
            minutes || 0,
            seconds || 0,
            this.dateAdapter.getMilliseconds(date)
        );

        return this.getValidDateOrNull(resultDate);
    }

    private parseValidator: ValidatorFn = (): ValidationErrors | null => {
        return this.focused || this.empty || this.lastValueValid
            ? null
            : { kbqTimepickerParse: { text: this.viewValue } };
    };

    private minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));

        const min = this.minDate();

        return !min || !controlValue || this.dateAdapter.compareDateTime(min, controlValue) <= 0
            ? null
            : { kbqTimepickerLowerThenMin: { min, actual: controlValue } };
    };

    private maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));

        const max = this.maxDate();

        return !max || !controlValue || this.dateAdapter.compareDateTime(max, controlValue) >= 0
            ? null
            : { kbqTimepickerHigherThenMax: { max, actual: controlValue } };
    };

    private getValidDateOrNull(obj: any): D | null {
        return this.dateAdapter.isDateInstance(obj) && this.dateAdapter.isValid(obj) ? obj : null;
    }

    private setViewValue(value: string) {
        const element = this.elementRef.nativeElement;

        this.renderer.setProperty(element, 'value', value);

        // A paste or a model write replaces the whole value, and the offset the previous one was left
        // at has to go with it.
        kbqRevealSelection(element);
    }

    private setSelection(start: number, end: number): void {
        kbqSetSelectionRange(this.elementRef.nativeElement, start, end);
    }

    private updateView() {
        const formattedValue = this.getTimeStringFromDate(this.value, this.format());

        this.setViewValue(formattedValue);
    }

    /** @docs-private */
    updateErrorState() {
        this.errorStateTracker.updateErrorState();
    }

    private setControl(control: AbstractControl) {
        if (this.control) return;

        this.control = control;

        this.control.valueChanges.subscribe((value) => (this._value = value));

        // @TODO resolve types
        this.errorStateTracker.ngControl = { control } as unknown as NgControl;
    }

    private validatorOnChange = () => {};
}
