import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    Directive,
    DoCheck,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    Inject,
    Injectable,
    Input,
    OnDestroy,
    Optional,
    Output,
    Provider,
    Renderer2
} from '@angular/core';
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
    DELETE,
    DOWN_ARROW,
    END,
    hasModifierKey,
    HOME,
    isHorizontalMovement,
    isLetterKey,
    isVerticalMovement,
    LEFT_ARROW,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    SPACE,
    TAB,
    UP_ARROW
} from '@koobiq/cdk/keycodes';
import {
    DateAdapter,
    ErrorStateMatcher,
    KBQ_LOCALE_SERVICE,
    KbqErrorStateTracker,
    KbqLocaleService,
    validationTooltipHideDelay,
    validationTooltipShowDelay
} from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import type { KbqWarningTooltipTrigger } from '@koobiq/components/tooltip';
import { noop, Subject, Subscription } from 'rxjs';

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

@Injectable()
class KbqTimepickerErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null): boolean {
        return !!control?.invalid;
    }
}

const KBQ_TIMEPICKER_ERROR_STATE_MATCHER: Provider = {
    provide: ErrorStateMatcher,
    useClass: KbqTimepickerErrorStateMatcher
};

let uniqueComponentIdSuffix: number = 0;

const shortFormatSize: number = 5;
const fullFormatSize: number = 8;

@Directive({
    selector: 'input[kbqTimepicker]',
    exportAs: 'kbqTimepicker',
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
    providers: [
        KBQ_TIMEPICKER_VALIDATORS,
        KBQ_TIMEPICKER_VALUE_ACCESSOR,
        KBQ_TIMEPICKER_ERROR_STATE_MATCHER,
        { provide: KbqFormFieldControl, useExisting: KbqTimepicker }]
})
export class KbqTimepicker<D>
    implements KbqFormFieldControl<D>, ControlValueAccessor, Validator, OnDestroy, DoCheck, AfterContentInit
{
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
    @Input()
    get placeholder(): string {
        return this._placeholder;
    }

    set placeholder(value: string) {
        this._placeholder = value;

        this.defaultPlaceholder = false;
    }

    private _placeholder = TIMEFORMAT_PLACEHOLDERS[DEFAULT_TIME_FORMAT];

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);

        // Browsers may not fire the blur event if the input is disabled too quickly.
        // Reset from here to ensure that the element doesn't become stuck.
        if (this.focused) {
            this.focused = false;
        }

        this.stateChanges.next();
    }

    private _disabled: boolean;

    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this.uid;
    }

    private _id: string;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = coerceBooleanProperty(value);
    }

    private _required: boolean;

    @Input()
    get format(): TimeFormats {
        return this._format;
    }

    set format(formatValue: TimeFormats) {
        this._format =
            Object.keys(TimeFormats)
                .map((timeFormatKey) => TimeFormats[timeFormatKey])
                .indexOf(formatValue) > -1
                ? formatValue
                : DEFAULT_TIME_FORMAT;

        if (this.defaultPlaceholder) {
            this._placeholder = this.timeFormatPlaceholder;
        }

        if (this.value) {
            this.updateView();
        }
    }

    private _format: TimeFormats = DEFAULT_TIME_FORMAT;

    @Input()
    get min(): D | null {
        return this._min;
    }

    set min(value: D | null) {
        this._min = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
        this.validatorOnChange();
    }

    private _min: D | null = null;

    @Input()
    get max(): D | null {
        return this._max;
    }

    set max(value: D | null) {
        this._max = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
        this.validatorOnChange();
    }

    private _max: D | null = null;

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

    @Input()
    set kbqValidationTooltip(tooltip: KbqWarningTooltipTrigger) {
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

    @Output() readonly incorrectInput = new EventEmitter<void>();

    get hasSelection(): boolean {
        return this.selectionStart !== this.selectionEnd;
    }

    get isFullFormat(): boolean {
        return this.format === TimeFormats.HHmmss;
    }

    get isShortFormat(): boolean {
        return this.format === TimeFormats.HHmm;
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
    }

    get selectionEnd(): number | null {
        return this.elementRef.nativeElement.selectionEnd;
    }

    set selectionEnd(value: number | null) {
        this.elementRef.nativeElement.selectionEnd = value;
    }

    /** Localized placeholder */
    get timeFormatPlaceholder(): string {
        return (
            this.localeService?.getParams('timepicker')?.placeholder[TimeFormatToLocaleKeys[this.format]] ||
            TIMEFORMAT_PLACEHOLDERS[this.format]
        );
    }

    /** @docs-private */
    get errorState(): boolean {
        return this.errorStateTracker.errorState;
    }

    set errorState(value: boolean) {
        this.errorStateTracker.errorState = value;
    }

    private readonly uid = `kbq-timepicker-${uniqueComponentIdSuffix++}`;

    private readonly validator: ValidatorFn | null;

    private lastValueValid = false;

    private control: AbstractControl;

    private defaultPlaceholder = true;
    private separator = ':';

    private onChange: (value: any) => void;
    private onTouched: () => void;

    private localeSubscription = Subscription.EMPTY;

    private errorStateTracker: KbqErrorStateTracker;

    constructor(
        private elementRef: ElementRef<HTMLInputElement>,
        private renderer: Renderer2,
        @Optional() private dateAdapter: DateAdapter<any>,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService?: KbqLocaleService
    ) {
        if (!this.dateAdapter) {
            throw Error(
                `KbqTimepicker: No provider found for DateAdapter. You must import one of the existing ` +
                    `modules at your application root or provide a custom implementation or use exists ones.`
            );
        }

        this.validator = Validators.compose([this.parseValidator, this.minValidator, this.maxValidator]);

        this.onChange = noop;

        // Force setter to be called in case id was not specified.
        this.id = this.id;

        this.errorStateTracker = new KbqErrorStateTracker(
            inject(ErrorStateMatcher),
            null,
            inject(FormGroupDirective, { optional: true }),
            inject(NgForm, { optional: true }),
            this.stateChanges
        );

        this.localeSubscription = dateAdapter.localeChanges.subscribe(this.updateLocaleParams);
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
        this.localeSubscription.unsubscribe();
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

        if (this.viewValue === this.getTimeStringFromDate(this.value, this.format)) {
            return;
        }

        this.setViewValue(this.formatUserPaste(this.viewValue));

        this.onInput();
    }

    onPaste($event) {
        $event.preventDefault();

        const value = this.formatUserPaste($event.clipboardData.getData('text'));

        const newTimeObj = this.getDateFromTimeString(value);

        if (!newTimeObj) {
            return;
        }

        this.setViewValue(this.getTimeStringFromDate(newTimeObj, this.format));

        this.value = newTimeObj;
        this.onChange(newTimeObj);
        this.stateChanges.next();
    }

    onInput = () => {
        const formattedValue = this.formatUserInput(this.viewValue);

        const newTimeObj = this.getDateFromTimeString(formattedValue);

        this.lastValueValid = !!newTimeObj;

        if (!newTimeObj) {
            if (!this.viewValue) {
                this.onChange(null);
            } else {
                this.control.updateValueAndValidity();
            }

            return;
        }

        const selectionStart = this.selectionStart;
        const selectionEnd = this.selectionEnd;

        this.setViewValue(this.getTimeStringFromDate(newTimeObj, this.format));

        this.selectionStart = selectionStart;
        this.selectionEnd = selectionEnd;

        this.createSelectionOfTimeComponentInInput((selectionStart as number) + 1);

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

        const match: RegExpMatchArray | null = value.match(
            /^(?<hours>\d{0,4}):?(?<minutes>\d{0,4}):?(?<seconds>\d{0,4})$/
        );

        if (match?.groups) {
            const { hours, minutes, seconds } = match.groups;

            if (hours.length && parseInt(hours) > HOURS_PER_DAY) {
                formattedValue = formattedValue.replace(hours, HOURS_PER_DAY.toString());
            }

            if (minutes.length && parseInt(minutes) > MINUTES_PER_HOUR) {
                formattedValue = formattedValue.replace(minutes, MINUTES_PER_HOUR.toString());
            }

            if (seconds.length && parseInt(seconds) > SECONDS_PER_MINUTE) {
                formattedValue = formattedValue.replace(seconds, SECONDS_PER_MINUTE.toString());
            }
        }

        return formattedValue;
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

        this.selectionStart = newEditParams.cursorStartPosition;
        this.selectionEnd = newEditParams.cursorEndPosition;

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

            this.selectionStart = newEditParams.cursorStartPosition;
            this.selectionEnd = newEditParams.cursorEndPosition;
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

        return !this.min || !controlValue || this.dateAdapter.compareDateTime(this.min, controlValue) <= 0
            ? null
            : { kbqTimepickerLowerThenMin: { min: this.min, actual: controlValue } };
    };

    private maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));

        return !this.max || !controlValue || this.dateAdapter.compareDateTime(this.max, controlValue) >= 0
            ? null
            : { kbqTimepickerHigherThenMax: { max: this.max, actual: controlValue } };
    };

    private getValidDateOrNull(obj: any): D | null {
        return this.dateAdapter.isDateInstance(obj) && this.dateAdapter.isValid(obj) ? obj : null;
    }

    private setViewValue(value: string) {
        this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
    }

    private updateView() {
        const formattedValue = this.getTimeStringFromDate(this.value, this.format);

        this.setViewValue(formattedValue);
    }

    /** @docs-private */
    updateErrorState() {
        this.errorStateTracker.updateErrorState();
    }

    private setControl(control: AbstractControl) {
        if (this.control) {
            return;
        }

        this.control = control;

        this.control.valueChanges.subscribe((value) => (this._value = value));

        // @TODO resolve types
        this.errorStateTracker.ngControl = { control } as unknown as NgControl;
    }

    private validatorOnChange = () => {};

    private updateLocaleParams = () => {
        if (!this.defaultPlaceholder) return;

        // update via private property instead of setter to save it as default placeholder
        this._placeholder = this.timeFormatPlaceholder;
        // update value so view value will be also updated
        this.value = this._value;
    };
}
