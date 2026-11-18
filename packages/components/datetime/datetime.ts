import { _IdGenerator, FocusMonitor, InputModalityDetector } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    DoCheck,
    effect,
    ElementRef,
    inject,
    Injector,
    input,
    linkedSignal,
    OnChanges,
    OnInit,
    Renderer2,
    signal,
    SimpleChanges,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    FormGroupDirective,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    NgControl,
    NgForm,
    ReactiveFormsModule,
    ValidationErrors,
    Validator
} from '@angular/forms';
import {
    BACKSPACE,
    DateAdapter,
    ErrorStateMatcher,
    hasModifierKey,
    KbqErrorStateTracker,
    KbqFieldSizingContent,
    kbqInjectA11yLocaleConfiguration,
    kbqSetSelectionRange,
    LEFT_ARROW,
    RIGHT_ARROW
} from '@koobiq/components/core';
import { KbqDatepicker, KbqDatepickerInput } from '@koobiq/components/datepicker';
import { KBQ_FORM_FIELD, KbqFormFieldControl } from '@koobiq/components/form-field';
import { DEFAULT_TIME_FORMAT, KbqTimepicker, TimeFormats } from '@koobiq/components/timepicker';

/** A date, a separator of date and time, and a time: `11.11.2026 20:20`, `2026-11-11T20:20:00`. */
const DATETIME_TEXT_REGEXP = /^(\d+\D\d+\D\d+)(?:\s*,\s*|\s+|T)(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

/** Key of the error `KbqDatetime` reports for a text that is not a date and time, or for a single part filled in. */
export const KBQ_DATETIME_PARSE_ERROR = 'kbqDatetimeParse';

/** Key of the error `KbqDatetime` reports for a value before its `min`. */
export const KBQ_DATETIME_MIN_ERROR = 'kbqDatetimeMin';

/** Key of the error `KbqDatetime` reports for a value after its `max`. */
export const KBQ_DATETIME_MAX_ERROR = 'kbqDatetimeMax';

/** Keys of the errors the date and the time inputs report for a text they cannot parse. */
const DATE_PARSE_ERROR = 'kbqDatepickerParse';
const TIME_PARSE_ERROR = 'kbqTimepickerParse';

/** The form field the datetime sits in, handed on to the inputs of its own view. */
const parentFormField = () => inject(KBQ_FORM_FIELD, { optional: true, skipSelf: true });

/**
 * A date and a time in one form field: a date input with a calendar and a time input that share one value.
 *
 * The value is a date of the date adapter, and it is `null` until both parts are filled in.
 */
@Component({
    selector: 'kbq-datetime',
    imports: [ReactiveFormsModule, KbqDatepicker, KbqDatepickerInput, KbqTimepicker, KbqFieldSizingContent],
    template: `
        <input
            class="kbq-datetime__date"
            kbqFieldSizingContent
            [id]="id() + '-date'"
            [kbqDatepicker]="calendar"
            [formControl]="dateControl"
            [min]="minDate()"
            [max]="maxDate()"
            [required]="required()"
            [attr.aria-label]="a11yLocaleConfiguration().date"
            [attr.aria-invalid]="errorState() || null"
        />
        <input
            #timeElement
            class="kbq-datetime__time"
            kbqTimepicker
            [id]="id() + '-time'"
            [formControl]="timeControl"
            [format]="format()"
            [required]="required()"
            [attr.aria-label]="a11yLocaleConfiguration().time"
            [attr.aria-invalid]="errorState() || null"
        />
        <kbq-datepicker #calendar [minDate]="minDate()" [maxDate]="maxDate()" (closed)="onCalendarClosed()" />
    `,
    styleUrl: './datetime.scss',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: KbqDatetime, multi: true },
        { provide: NG_VALIDATORS, useExisting: KbqDatetime, multi: true },
        { provide: KbqFormFieldControl, useExisting: KbqDatetime }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    // The date input anchors its calendar to the form field it finds on its host, which here is the datetime.
    viewProviders: [{ provide: KBQ_FORM_FIELD, useFactory: parentFormField }],
    host: {
        class: 'kbq-datetime',
        role: 'group',
        '[attr.id]': 'id()',
        '[attr.aria-labelledby]': 'formField?.labelId()',
        '[class.kbq-disabled]': 'disabled()',
        '[class.kbq-datetime_seconds]': 'hasSeconds()',
        '(focusin)': 'onFocusIn()',
        '(focusout)': 'onFocusOut($event)'
    },
    exportAs: 'kbqDatetime'
})
export class KbqDatetime<D>
    implements KbqFormFieldControl<D>, ControlValueAccessor, Validator, OnInit, OnChanges, DoCheck, AfterContentInit
{
    private readonly uid = inject(_IdGenerator).getId('kbq-datetime-');
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly injector = inject(Injector);
    private readonly renderer = inject(Renderer2);
    private readonly document = inject(DOCUMENT);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly modalityDetector = inject(InputModalityDetector);
    private readonly adapter = inject<DateAdapter<D>>(DateAdapter, { optional: true })!;

    /** @docs-private */
    protected readonly formField = parentFormField();

    /** @docs-private */
    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    private readonly errorStateTracker = new KbqErrorStateTracker(
        inject(ErrorStateMatcher),
        null,
        inject(FormGroupDirective, { optional: true }),
        inject(NgForm, { optional: true })
    );

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    readonly errorState = this.errorStateTracker.errorState;

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    readonly controlType = 'datetime';

    /**
     * Implemented as part of KbqFormFieldControl: the caption of the form field names the group of two inputs.
     *
     * @docs-private
     */
    readonly isNativeLabelSupported = false;

    /**
     * Implemented as part of KbqFormFieldControl. Each part renders a placeholder of its own.
     *
     * @docs-private
     */
    readonly placeholder = signal(null).asReadonly();

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    ngControl: NgControl | null = null;

    /** Object used to control when error messages are shown. */
    readonly errorStateMatcher = input<ErrorStateMatcher>();

    /** @docs-private */
    readonly idInput = input<string | undefined>(undefined, { alias: 'id' });

    /** Unique id of the element, generated when not provided. */
    readonly id = computed(() => this.idInput() || this.uid);

    /** Whether the control is required. Defaults to `false`. */
    readonly required = input<boolean, boolean | string | null | undefined>(false, { transform: booleanAttribute });

    /** @docs-private */
    readonly disabledInput = input<boolean, boolean | string | null | undefined>(false, {
        alias: 'disabled',
        transform: booleanAttribute
    });

    /** Whether the control is disabled. Also set by the bound form control. Defaults to `false`. */
    readonly disabled = linkedSignal(() => this.disabledInput());

    /** Time format the time part parses and renders. Defaults to `TimeFormats.HHmm`. */
    readonly format = input<TimeFormats>(DEFAULT_TIME_FORMAT);

    /**
     * Earliest date and time the control accepts, reported as `kbqDatetimeMin`. The calendar disables the days
     * before it. Defaults to `null`.
     */
    readonly min = input<D | null>(null);

    /**
     * Latest date and time the control accepts, reported as `kbqDatetimeMax`. The calendar disables the days
     * after it. Defaults to `null`.
     */
    readonly max = input<D | null>(null);

    /** @docs-private */
    protected readonly hasSeconds = computed(() => this.format() === TimeFormats.HHmmss);

    /** @docs-private */
    protected readonly minDate = computed(() => this.validOrNull(this.min()));

    /** @docs-private */
    protected readonly maxDate = computed(() => this.validOrNull(this.max()));

    private readonly valueState = signal<D | null>(null);

    /** The date and time the control holds, `null` until both parts are filled in. */
    readonly value = this.valueState.asReadonly();

    private readonly focusedState = signal(false);

    /**
     * Implemented as part of KbqFormFieldControl. Stays `true` while the focus is in the calendar.
     *
     * @docs-private
     */
    readonly focused = this.focusedState.asReadonly();

    /** The calendar of the date part, for a `kbq-datepicker-toggle-icon` placed in the form field. */
    readonly datepicker = viewChild.required<KbqDatepicker<D>>(KbqDatepicker);

    private readonly dateInput = viewChild<KbqDatepickerInput<D>>(KbqDatepickerInput);
    private readonly timeInput = viewChild<KbqTimepicker<D>>(KbqTimepicker);
    private readonly timeElement = viewChild<ElementRef<HTMLInputElement>>('timeElement');

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    readonly empty = computed(() => (this.dateInput()?.empty() ?? true) && (this.timeInput()?.empty() ?? true));

    /** @docs-private */
    protected readonly dateControl = new FormControl<D | null>(null);

    /** @docs-private */
    protected readonly timeControl = new FormControl<D | null>(null);

    /** What each part reported last: the parts re-emit a value they already gave when only its validity is refreshed. */
    private lastDate: D | null = null;
    private lastTime: D | null = null;

    /** Whether the form control was last told that the parts are unparseable or half filled. */
    private reportedParseError = false;

    /** Set by a day picked for an empty time part: the calendar hands the focus on to the hours. */
    private focusTimeOnClose = false;

    private onChange: (value: D | null) => void = () => {};
    private onTouched: () => void = () => {};
    private validatorOnChange: () => void = () => {};

    constructor() {
        if (!this.adapter) {
            throw Error(
                'KbqDatetime: No provider found for DateAdapter. You must import one of the following modules at ' +
                    'your application root: KbqLuxonDateModule, KbqMomentDateModule, or provide a custom implementation.'
            );
        }

        this.dateControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((date) => this.onDateChange(date));
        this.timeControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((time) => this.onTimeChange(time));

        effect(() => {
            const disabled = this.disabled();

            untracked(() => {
                for (const control of [this.dateControl, this.timeControl]) {
                    if (disabled) {
                        control.disable({ emitEvent: false });
                    } else {
                        control.enable({ emitEvent: false });
                    }
                }
            });
        });

        // In the capture phase: the inputs handle the same keys themselves, and each keeps the caret inside.
        const element = this.elementRef.nativeElement;
        const listeners = [
            this.renderer.listen(element, 'keydown', (event: KeyboardEvent) => this.onKeydown(event), {
                capture: true
            }),
            this.renderer.listen(element, 'paste', (event: ClipboardEvent) => this.onPaste(event), { capture: true }),
            this.renderer.listen(element, 'drop', (event: DragEvent) => this.onDrop(event), { capture: true })
        ];

        inject(DestroyRef).onDestroy(() => listeners.forEach((unlisten) => unlisten()));
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Not in an effect, which runs after the template has read the errors of the form control.
        if (changes['min'] || changes['max']) this.validatorOnChange();
    }

    ngOnInit(): void {
        // Here rather than in the constructor: the form directive is created with this class as its value accessor.
        this.ngControl = this.injector.get(NgControl, null, { self: true, optional: true });
        this.errorStateTracker.ngControl = this.ngControl;
    }

    ngDoCheck(): void {
        if (this.ngControl) this.updateErrorState();
    }

    ngAfterContentInit(): void {
        // The first `ngDoCheck()` runs before the form directive of the same element has validated its control.
        this.updateErrorState();
    }

    /** Focuses the first part left empty, the date part when there is none. */
    focus(options?: FocusOptions): void {
        const dateInput = this.dateInput();
        const timeElement = this.timeElement()?.nativeElement;

        if (!dateInput || !timeElement) return;

        const target = !dateInput.empty() && !timeElement.value ? timeElement : dateInput.elementRef.nativeElement;

        target.focus(options);
    }

    /** Opens the calendar. */
    open(): void {
        this.datepicker().open();
    }

    /** Closes the calendar. */
    close(): void {
        this.datepicker().close();
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    onContainerClick(event: MouseEvent): void {
        if (!this.elementRef.nativeElement.contains(event.target as Node)) this.focus();
    }

    /** @docs-private */
    writeValue(value: D | null): void {
        untracked(() => {
            const newValue = this.validOrNull(value);

            this.valueState.set(newValue);
            this.writeParts(newValue, true);
        });
    }

    /** @docs-private */
    registerOnChange(fn: (value: D | null) => void): void {
        this.onChange = fn;
    }

    /** @docs-private */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /** @docs-private */
    registerOnValidatorChange(fn: () => void): void {
        this.validatorOnChange = fn;
    }

    /** @docs-private */
    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }

    /** @docs-private */
    validate(control: AbstractControl): ValidationErrors | null {
        // Untracked, as `writeValue()`: a form control set from a consumer's `effect()` validates on the spot.
        return untracked(() => {
            const text = this.parseErrorText();

            // Here rather than where a revalidation is asked for: the form control also validates on its own,
            // as on a reset.
            this.reportedParseError = text !== null;

            if (text !== null) return { [KBQ_DATETIME_PARSE_ERROR]: { text } };

            const actual = this.validOrNull(control.value);
            const min = this.minDate();
            const max = this.maxDate();

            if (actual && min && this.adapter.compareDateTime(min, actual) > 0) {
                return { [KBQ_DATETIME_MIN_ERROR]: { min, actual } };
            }

            if (actual && max && this.adapter.compareDateTime(max, actual) < 0) {
                return { [KBQ_DATETIME_MAX_ERROR]: { max, actual } };
            }

            return null;
        });
    }

    /** @docs-private */
    protected onFocusIn(): void {
        this.focusedState.set(true);
    }

    /** @docs-private */
    protected onFocusOut(event: FocusEvent): void {
        if (this.elementRef.nativeElement.contains(event.relatedTarget as Node | null)) return;

        // The focus went into the calendar, which gives it back or reports its own close.
        if (this.datepicker().opened) return;

        this.onBlur();
    }

    /** @docs-private */
    protected onCalendarClosed(): void {
        const timeElement = this.timeElement()?.nativeElement;

        if (this.focusTimeOnClose && timeElement) {
            this.focusTimeOnClose = false;
            this.focusMonitor.focusVia(timeElement, this.modalityDetector.mostRecentModality ?? 'program');
            this.selectHours(timeElement);

            return;
        }

        if (!this.elementRef.nativeElement.contains(this.document.activeElement)) this.onBlur();
    }

    private updateErrorState(): void {
        this.errorStateTracker.errorStateMatcher = this.errorStateMatcher();
        this.errorStateTracker.updateErrorState();
    }

    private onBlur(): void {
        if (!this.focusedState()) return;

        this.focusedState.set(false);
        this.onTouched();

        // The part that was left has reported its text by now: its `blur` comes before this `focusout`.
        this.revalidateOnParseErrorChange();
    }

    private onDateChange(date: D | null): void {
        if (this.sameDateTime(date, this.lastDate)) return;

        this.lastDate = date;

        if (!date) {
            this.commit(null);

            return;
        }

        const time = this.timeControl.value;

        this.focusTimeOnClose = !time && this.datepicker().opened;
        this.commit(this.combine(date, time));
    }

    private onTimeChange(time: D | null): void {
        if (this.sameDateTime(time, this.lastTime)) return;

        this.lastTime = time;

        const date = this.dateControl.value;

        this.commit(date && time ? this.combine(date, time) : null);
    }

    /** Takes a value the user produced: aligns both parts with it and reports it to the form. */
    private commit(value: D | null): void {
        if (value) this.writeParts(value);

        if (!this.sameDateTime(value, this.valueState())) {
            this.valueState.set(value);
            this.onChange(value);
        }

        this.revalidateOnParseErrorChange();
    }

    /**
     * Writes the value to the parts that hold another one. A part holding the same one keeps its text and its caret:
     * it is the one being typed in.
     */
    private writeParts(value: D | null, force: boolean = false): void {
        if (force || !this.sameDateTime(this.dateControl.value, value)) {
            this.dateControl.setValue(value, { emitEvent: false });
        }

        if (force || !this.sameDateTime(this.timeControl.value, value)) {
            this.timeControl.setValue(value, { emitEvent: false });
        }

        this.lastDate = this.lastTime = value;
    }

    /**
     * The day of `date` at the time of `time`, or at midnight when no time is given.
     *
     * Each part fills the half it does not render from the current moment when it starts empty, so the
     * milliseconds are kept only from a value that was already there.
     */
    private combine(date: D, time: D | null): D {
        const current = this.valueState();

        return this.adapter.createDateTime(
            this.adapter.getYear(date),
            this.adapter.getMonth(date),
            this.adapter.getDate(date),
            time ? this.adapter.getHours(time) : 0,
            time ? this.adapter.getMinutes(time) : 0,
            time ? this.adapter.getSeconds(time) : 0,
            current ? this.adapter.getMilliseconds(current) : 0
        );
    }

    /** The text of the parts when it does not make a date and time, `null` when it does or while it is typed. */
    private parseErrorText(): string | null {
        const dateInput = this.dateInput();
        const timeInput = this.timeInput();

        if (!dateInput || !timeInput || this.focusedState()) return null;

        // From the elements: the `empty` signals of the parts follow a text erased by the browser a render later.
        const halfFilled = !dateInput.viewValue !== !timeInput.viewValue;
        const unparsed = this.dateControl.hasError(DATE_PARSE_ERROR) || this.timeControl.hasError(TIME_PARSE_ERROR);

        return halfFilled || unparsed ? `${dateInput.viewValue} ${timeInput.viewValue}`.trim() : null;
    }

    private revalidateOnParseErrorChange(): void {
        if ((this.parseErrorText() !== null) !== this.reportedParseError) this.validatorOnChange();
    }

    private onKeydown(event: KeyboardEvent): void {
        const dateElement = this.dateInput()?.elementRef.nativeElement;
        const timeElement = this.timeElement()?.nativeElement;

        if (!dateElement || !timeElement || hasModifierKey(event)) return;

        const { keyCode, target } = event;

        if (target === dateElement) {
            if (keyCode === RIGHT_ARROW && dateElement.selectionEnd === dateElement.value.length) {
                this.moveFocus(event, timeElement);
                this.selectHours(timeElement);
            } else if (/^\d$/.test(event.key)) {
                this.advanceToTimeOnceDateIsTyped(dateElement, timeElement);
            }
        } else if (target === timeElement) {
            const leavesTime =
                (keyCode === LEFT_ARROW && timeElement.selectionStart === 0) ||
                (keyCode === BACKSPACE && !timeElement.value);

            if (leavesTime) {
                this.moveFocus(event, dateElement);
                kbqSetSelectionRange(dateElement, this.lastPartStart(dateElement.value), dateElement.value.length);
            }
        }
    }

    /** Hands a key over to the other part, keeping it from the part it was pressed in. */
    private moveFocus(event: KeyboardEvent, element: HTMLInputElement): void {
        event.preventDefault();
        event.stopPropagation();
        element.focus();
    }

    /**
     * Moves the focus to the hours when the digit being typed completes the last part of the date.
     *
     * The date input parses the key on a timer and selects the part on another one, set from the first. Three
     * timers from here run after both: each is queued behind the one the date input has set by then.
     */
    private advanceToTimeOnceDateIsTyped(dateElement: HTMLInputElement, timeElement: HTMLInputElement): void {
        const { value, selectionStart } = dateElement;
        const length = this.dateInput()!.dateInputFormat.length;
        const typesLastPart = value.length < length && (selectionStart ?? 0) >= this.lastPartStart(value);

        // Two separators before the caret: the first digits of an empty field are its first part, not its last.
        if (!typesLastPart || value.replace(/\d/g, '').length < 2) return;

        const afterDateInput = (work: () => void) => setTimeout(() => setTimeout(() => setTimeout(work)));

        afterDateInput(() => {
            if (dateElement.value.length !== length || this.document.activeElement !== dateElement) return;

            this.focusMonitor.focusVia(timeElement, this.modalityDetector.mostRecentModality ?? 'program');
            this.selectHours(timeElement);
        });
    }

    private onPaste(event: ClipboardEvent): void {
        this.takeDateTimeText(event, event.clipboardData?.getData('text'));
    }

    private onDrop(event: DragEvent): void {
        if (!this.takeDateTimeText(event, event.dataTransfer?.getData('text'))) return;

        // As the parts do for a drop of their own: a window that is not active, where a drag from another one
        // ends, fires no focus event.
        this.timeElement()?.nativeElement.focus();
        this.onTouched();
    }

    /**
     * Splits a date and time pasted or dropped as one text between the parts. Returns whether the text was taken:
     * anything else is left to the part it lands in.
     */
    private takeDateTimeText(event: Event, text: string | undefined): boolean {
        const dateInput = this.dateInput();
        const match = text?.trim().match(DATETIME_TEXT_REGEXP);

        if (!dateInput || !match || this.disabled()) return false;

        const [, dateText, hours, minutes, seconds] = match;
        const format = dateInput.dateInputFormat;
        const separator = format.match(/[^a-zA-Z]/)?.[0] ?? '';
        const date = this.validOrNull(this.adapter.parse(dateText.replace(/\D/g, separator), format));

        if (!date || +hours > 23 || +minutes > 59 || +(seconds ?? 0) > 59) return false;

        event.preventDefault();
        event.stopPropagation();

        const value = this.adapter.createDateTime(
            this.adapter.getYear(date),
            this.adapter.getMonth(date),
            this.adapter.getDate(date),
            +hours,
            +minutes,
            +(seconds ?? 0),
            0
        );

        // Both parts, whatever they hold: one may show a half edited text over the very value that came.
        this.writeParts(value, true);
        this.commit(value);

        return true;
    }

    private selectHours(timeElement: HTMLInputElement): void {
        const end = timeElement.value.indexOf(':');

        if (end > 0) kbqSetSelectionRange(timeElement, 0, end);
    }

    /** Index the last part of a rendered date starts at: the year of `11.11.2026`, the day of `2026-11-11`. */
    private lastPartStart(text: string): number {
        return text.search(/\d*$/);
    }

    private sameDateTime(first: D | null, second: D | null): boolean {
        return first !== null && second !== null ? this.adapter.compareDateTime(first, second) === 0 : first === second;
    }

    private validOrNull(value: unknown): D | null {
        const date = this.adapter.deserialize(value);

        return date !== null && this.adapter.isDateInstance(date) && this.adapter.isValid(date) ? date : null;
    }
}
