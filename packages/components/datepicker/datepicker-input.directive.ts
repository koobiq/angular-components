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
    InjectionToken,
    Input,
    OnDestroy,
    Optional,
    Output,
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
    DELETE,
    DOWN_ARROW,
    END,
    ESCAPE,
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
    KBQ_DATE_FORMATS,
    KBQ_LOCALE_SERVICE,
    KbqDateFormats,
    KbqErrorStateTracker,
    ruRULocaleData,
    validationTooltipHideDelay,
    validationTooltipShowDelay
} from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import type { KbqWarningTooltipTrigger } from '@koobiq/components/tooltip';
import { Subject, Subscription } from 'rxjs';
import { KbqCalendar } from './calendar.component';
import { createMissingDateImplError } from './datepicker-errors';
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
export const KBQ_DATEPICKER_DEFAULT_CONFIGURATION = ruRULocaleData.datepicker;

/** Injection Token for providing configuration of datepicker */
/** @docs-private */
export const KBQ_DATEPICKER_CONFIGURATION = new InjectionToken('KbqDatepickerConfiguration');

/**
 * @TODO: Remove after kbq-form-field and kbq-form-field-experimental will be merged. (#DS-3463)
 * Used to sync control's errorState and icon's errorState, since now datepicker-input is validating on initial.
 * After merging form-fields, default error-state matcher will be used
 */
@Injectable()
class KbqDatepickerErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null): boolean {
        return !!control?.invalid;
    }
}

/**
 * @TODO: Remove after kbq-form-field and kbq-form-field-experimental will be merged. (#DS-3463)
 * After merging form-fields, default error-state matcher will be used
 */
const KBQ_DATEPICKER_ERROR_STATE_MATCHER: Provider = {
    provide: ErrorStateMatcher,
    useClass: KbqDatepickerErrorStateMatcher
};

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
        this.value = this.target.value;
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
    exportAs: 'kbqDatepickerInput',
    providers: [
        KBQ_DATEPICKER_VALUE_ACCESSOR,
        KBQ_DATEPICKER_VALIDATORS,
        KBQ_DATEPICKER_ERROR_STATE_MATCHER,
        { provide: KbqFormFieldControl, useExisting: KbqDatepickerInput }],
    host: {
        class: 'kbq-input kbq-datepicker',
        '[attr.placeholder]': 'placeholder',
        '[attr.required]': 'required',
        '[attr.disabled]': 'disabled || null',
        '[attr.min]': 'min ? toISO8601(min) : null',
        '[attr.max]': 'max ? toISO8601(max) : null',
        '[attr.autocomplete]': '"off"',
        '(paste)': 'onPaste($event)',
        '(change)': 'onChange()',
        '(focus)': 'focusChanged(true)',
        '(blur)': 'onBlur()',
        '(keydown)': 'onKeyDown($event)'
    }
})
export class KbqDatepickerInput<D>
    implements KbqFormFieldControl<D>, ControlValueAccessor, Validator, OnDestroy, DoCheck, AfterContentInit
{
    /** @docs-private */
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });

    protected readonly externalConfiguration = inject(KBQ_DATEPICKER_CONFIGURATION, { optional: true });

    protected configuration;

    readonly stateChanges: Subject<void> = new Subject<void>();

    controlType: string = 'datepicker';

    focused: boolean = false;

    datepicker: KbqDatepicker<D>;
    calendar: KbqCalendar<D>;

    dateFilter: (date: D | null) => boolean;

    /** Emits when the value changes (either due to user input or programmatic change). */
    valueChange = new EventEmitter<D | null>();

    /** Emits when the disabled state has changed */
    disabledChange = new EventEmitter<boolean>();

    /** Object used to control when error messages are shown. */
    @Input()
    get errorStateMatcher() {
        return this.errorStateTracker.errorStateMatcher;
    }

    set errorStateMatcher(value: ErrorStateMatcher) {
        this.errorStateTracker.errorStateMatcher = value;
    }

    @Input()
    get placeholder(): string {
        return this._placeholder || this.configuration.placeholder;
    }

    set placeholder(value: string) {
        this._placeholder = value;
    }

    private _placeholder: string;

    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = coerceBooleanProperty(value);
    }

    private _required: boolean;

    /** The datepicker that this input is associated with. */
    @Input()
    set kbqDatepicker(value: KbqDatepicker<D>) {
        if (!value) {
            return;
        }

        this.datepicker = value;
        this.datepicker.registerInput(this);
        this.datepickerSubscription.unsubscribe();

        this.datepickerSubscription = this.datepicker.selectedChanged.subscribe((selected: D) => {
            const newValue = this.saveTimePart(selected);

            this.value = newValue;
            this.cvaOnChange(newValue);
            this.onTouched();
            this.dateChange.emit(new KbqDatepickerInputEvent(this, this.elementRef.nativeElement));
        });
    }

    /** The calendar that this input is associated with. */
    @Input()
    set kbqCalendar(value: KbqCalendar<D>) {
        if (!value) {
            return;
        }

        this.calendar = value;
        this.calendar.registerInput(this);
    }

    /** Function that can be used to filter out dates within the datepicker. */
    @Input()
    set kbqDatepickerFilter(value: (date: D | null) => boolean) {
        this.dateFilter = value;
        this.validatorOnChange();
    }

    /** The value of the input. */
    @Input()
    get value(): D | null {
        return this._value;
    }

    set value(value: D | null) {
        let newValue = this.adapter.deserialize(value);

        this.lastValueValid = !newValue || this.adapter.isValid(newValue);

        newValue = this.getValidDateOrNull(newValue);

        const oldDate = this.value;

        this._value = newValue;
        this.formatValue(newValue);

        if (!this.adapter.sameDate(oldDate, newValue)) {
            this.valueChange.emit(newValue);
        }
    }

    private _value: D | null;

    /** The minimum valid date. */
    @Input()
    get min(): D | null {
        return this._min;
    }

    set min(value: D | null) {
        this._min = this.adapter.deserialize(value);
        this.validatorOnChange();
    }

    private _min: D | null;

    /** The maximum valid date. */
    @Input()
    get max(): D | null {
        return this._max;
    }

    set max(value: D | null) {
        this._max = this.adapter.deserialize(value);
        this.validatorOnChange();
    }

    private _max: D | null;

    /** Whether the datepicker-input is disabled. */
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        const newValue = coerceBooleanProperty(value);
        const element = this.elementRef.nativeElement;

        if (this._disabled !== newValue) {
            this._disabled = newValue;
            this.disabledChange.emit(newValue);
        }

        // We need to null check the `blur` method, because it's undefined during SSR.
        if (newValue && element.blur) {
            // Normally, native input elements automatically blur if they turn disabled. This behavior
            // is problematic, because it would mean that it triggers another change detection cycle,
            // which then causes a changed after checked error if the input element was focused before.
            element.blur();
        }
    }

    private _disabled: boolean = false;

    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this.uid;
    }

    private _id: string;

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

    /** Emits when a `change` event is fired on this `<input>`. */
    @Output() readonly dateChange = new EventEmitter<KbqDatepickerInputEvent<D>>();

    /** Emits when an `input` event is fired on this `<input>`. */
    @Output() readonly dateInput = new EventEmitter<KbqDatepickerInputEvent<D>>();

    get empty(): boolean {
        return !this.viewValue && !this.isBadInput();
    }

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

    get errorState() {
        return this.errorStateTracker.errorState;
    }

    set errorState(value: boolean) {
        this.errorStateTracker.errorState = value;
    }

    private get readyForParse(): boolean {
        return !!(this.firstDigit && this.secondDigit && this.thirdDigit);
    }

    private get selectionStart(): number | null {
        return this.elementRef.nativeElement.selectionStart;
    }

    private set selectionStart(value: number | null) {
        this.elementRef.nativeElement.selectionStart = value;
    }

    private get selectionEnd(): number | null {
        return this.elementRef.nativeElement.selectionEnd;
    }

    private set selectionEnd(value: number | null) {
        this.elementRef.nativeElement.selectionEnd = value;
    }

    private control: AbstractControl;
    private readonly uid = `kbq-datepicker-${uniqueComponentIdSuffix++}`;

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

    private errorStateTracker: KbqErrorStateTracker;

    constructor(
        public elementRef: ElementRef<HTMLInputElement>,
        private readonly renderer: Renderer2,
        @Optional() readonly adapter: DateAdapter<D>,
        @Optional() @Inject(KBQ_DATE_FORMATS) private readonly dateFormats: KbqDateFormats
    ) {
        this.validator = Validators.compose([
            this.parseValidator,
            this.minValidator,
            this.maxValidator,
            this.filterValidator
        ]);

        if (!this.adapter) {
            throw createMissingDateImplError('DateAdapter');
        }

        this.errorStateTracker = new KbqErrorStateTracker(
            inject(ErrorStateMatcher),
            // update ngControl later, so it will be initialized
            null,
            inject(FormGroupDirective, { optional: true }),
            inject(NgForm, { optional: true }),
            this.stateChanges
        );

        this.setFormat(this.dateInputFormat);

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.initDefaultParams();
        }
    }

    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
        }
    }

    onContainerClick() {
        this.focus();
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
        this.value = value;
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
        this.disabled = isDisabled;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.isReadOnly) {
            return;
        }

        const keyCode = event.keyCode;

        if (this.isLetterKey(event)) {
            event.preventDefault();

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
                this.incorrectInput.emit();
            }
        } else {
            setTimeout(this.onInput);
        }
    }

    onInput = () => {
        this.correctCursorPosition();
        const formattedValue = this.replaceSymbols(this.viewValue);

        const newTimeObj = this.getDateFromString(formattedValue);

        this.lastValueValid = !!newTimeObj;

        if (!newTimeObj) {
            if (!this.viewValue) {
                this.lastValueValid = false;
                this.updateValue(newTimeObj as D);
            } else {
                this.control.updateValueAndValidity();
            }

            return;
        }

        this.setViewValue(this.getTimeStringFromDate(newTimeObj, this.dateInputFormat), true);

        this.selectNextDigitByCursor(this.selectionStart as number);

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
            this._value = null;

            return setTimeout(() => this.control.updateValueAndValidity());
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
            this._value = null;

            return setTimeout(() => this.control.updateValueAndValidity());
        }

        const newTimeObj = this.createDateTime(date);

        if (!newTimeObj) {
            this.lastValueValid = false;
            this._value = null;
            this.cvaOnChange(null);

            return setTimeout(() => this.control.updateValueAndValidity());
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

        if (this.control) {
            this.control.updateValueAndValidity({ emitEvent: false });
            (this.control.statusChanges as EventEmitter<string>).emit(this.control.status);
        }
    }

    onPaste($event) {
        $event.preventDefault();

        let rawValue = $event.clipboardData.getData('text');

        if (rawValue.match(/^\d\D/)) {
            rawValue = `0${rawValue}`;
        }

        rawValue.replace(/[^A-Za-z0-9]+/g, this.separator);

        if (/[a-z]/gi.test(rawValue)) {
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
        this.errorStateTracker.updateErrorState();
    }

    private saveTimePart(selected: D) {
        if (!this.value) {
            return selected;
        }

        const years = this.adapter.getYear(selected);
        const month = this.adapter.getMonth(selected);
        const day = this.adapter.getDate(selected);

        const hours = this.adapter.getHours(this.value);
        const minutes = this.adapter.getMinutes(this.value);
        const seconds = this.adapter.getSeconds(this.value);
        const milliseconds = this.adapter.getMilliseconds(this.value);

        return this.adapter.createDateTime(years, month, day, hours, minutes, seconds, milliseconds);
    }

    private updateLocaleParams = () => {
        this.setFormat(this.dateInputFormat);

        this.configuration = this.externalConfiguration || this.localeService?.getParams('datepicker');

        this.value = this.value;
    };

    private initDefaultParams() {
        this.configuration = this.externalConfiguration || KBQ_DATEPICKER_DEFAULT_CONFIGURATION;
    }

    private setFormat(format: string): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.separator = format.match(/[aA-zZ]+(?<separator>\W|\D)[aA-zZ]+/).groups.separator;

        this.separatorPositions = format
            .split('')
            .reduce((acc: any, item, index: number) => (this.separator === item ? [...acc, index + 1] : acc), []);

        this.getDigitPositions(format);
    }

    private updateValue(newValue: D) {
        if (!this.adapter.sameDate(newValue, this.value)) {
            this._value = newValue;
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

        if (this.selectionStart === this.selectionEnd) {
            const value = this.getNewValue(event.key, this.selectionStart as number);

            this.setViewValue(value);

            setTimeout(this.onInput);
        } else if (this.selectionStart !== this.selectionEnd) {
            this.selectNextDigit(this.selectionStart as number, true);
        }
    }

    private getNewValue(key: string, position: number) {
        return [this.viewValue.slice(0, position), key, this.viewValue.slice(position)].join('');
    }

    private setViewValue(value: string, savePosition: boolean = false) {
        if (savePosition) {
            const selectionStart = this.selectionStart;
            const selectionEnd = this.selectionEnd;

            this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);

            this.selectionStart = selectionStart;
            this.selectionEnd = selectionEnd;
        } else {
            this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
        }
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

            if (this.value && digitViewValue.month && digitViewValue.month <= this.firstDigit!.maxMonth) {
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
        const defaultValue = this.value || this.adapter.today();

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
        if (this.datepicker?.maxDate && this.isMaxYear(date) && this.isMaxMonth(date)) {
            return this.adapter.getDate(this.datepicker.maxDate);
        }

        return this.adapter.getNumDaysInMonth(date);
    }

    private getMinDate(date: D): number {
        if (this.datepicker?.minDate && this.isMinYear(date) && this.isMinMonth(date)) {
            return this.adapter.getDate(this.datepicker.minDate);
        }

        return 1;
    }

    private getMaxMonth(date: D): number {
        if (this.datepicker?.maxDate && this.isMaxYear(date)) {
            return this.adapter.getMonth(this.datepicker.maxDate);
        }

        return 11;
    }

    private getMinMonth(date: D): number {
        if (this.datepicker?.minDate && this.isMinYear(date)) {
            return this.adapter.getMonth(this.datepicker.minDate);
        }

        return 0;
    }

    private getMaxYear(): number {
        if (this.datepicker?.maxDate) {
            return this.adapter.getYear(this.datepicker.maxDate);
        }

        return MAX_YEAR;
    }

    private getMinYear(): number {
        if (this.datepicker?.minDate) {
            return this.adapter.getYear(this.datepicker.minDate);
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
        if (!this.value) {
            return;
        }

        let changedTime;

        const [modifiedTimePart, selectionStart, selectionEnd] = this.getDateEditMetrics(this.selectionStart as number);

        if (keyCode === UP_ARROW) {
            changedTime = this.incrementDate(this.value, modifiedTimePart);
        }

        if (keyCode === DOWN_ARROW) {
            changedTime = this.decrementDate(this.value, modifiedTimePart);
        }

        this.value = changedTime;

        this.selectionStart = selectionStart;
        this.selectionEnd = selectionEnd;

        this.cvaOnChange(changedTime);

        this.onChange();
        this.stateChanges.next();
    }

    private changeCaretPosition(keyCode: number): void {
        if (!this.value) {
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

        if (hasEmptyDigit && this.value) {
            const year = this.adapter.getYear(this.value);
            const month = this.adapter.getMonth(this.value);
            const day = this.adapter.getDate(this.value);

            this.value = this.createDate(year, month, day);
        }
    }

    private selectDigitByCursor(cursorPos: number): void {
        setTimeout(() => {
            const [, selectionStart, selectionEnd] = this.getDateEditMetrics(cursorPos);

            this.selectionStart = selectionStart;
            this.selectionEnd = selectionEnd;
        });
    }

    private selectNextDigitByCursor(cursorPos: number): void {
        setTimeout(() => {
            const [, , endPositionOfCurrentDigit] = this.getDateEditMetrics(cursorPos);
            const [, selectionStart, selectionEnd] = this.getDateEditMetrics(endPositionOfCurrentDigit + 1);

            this.selectionStart = selectionStart;
            this.selectionEnd = selectionEnd;
        });
    }

    private selectNextDigit(cursorPos: number, cycle: boolean = false): void {
        setTimeout(() => {
            const lastValue = cycle ? 0 : cursorPos;
            const nextSeparatorPos: number = this.viewValue.indexOf(this.separator, cursorPos);

            const newCursorPos = nextSeparatorPos > 0 ? nextSeparatorPos + 1 : lastValue;

            const [, selectionStart, selectionEnd] = this.getDateEditMetrics(newCursorPos);

            this.selectionStart = selectionStart;
            this.selectionEnd = selectionEnd;
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
        return this.focused || this.empty || this.lastValueValid
            ? null
            : { kbqDatepickerParse: { text: this.elementRef.nativeElement.value } };
    };

    /** The form control validator for the min date. */
    private minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.adapter.deserialize(control.value);

        return !this.min || !controlValue || this.adapter.compareDateTime(this.min, controlValue) <= 0
            ? null
            : { kbqDatepickerMin: { min: this.min, actual: controlValue } };
    };

    /** The form control validator for the max date. */
    private maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const controlValue = this.adapter.deserialize(control.value);

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

        this.control.valueChanges.subscribe((value) => (this._value = value));

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
            this.adapter.getHours(this.value as D),
            this.adapter.getMinutes(this.value as D),
            this.adapter.getSeconds(this.value as D),
            this.adapter.getMilliseconds(this.value as D)
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

    private correctCursorPosition() {
        if (this.selectionStart && this.separatorPositions.includes(this.selectionStart)) {
            this.selectionStart = this.selectionStart - 1;
        }
    }
}
