import { coerceNumberProperty, NumberInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    InjectionToken,
    Input,
    input,
    NgZone,
    OnDestroy,
    Provider,
    Renderer2,
    untracked
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    BACKSPACE,
    checkAndNormalizeLocalizedNumber,
    DASH,
    DELETE,
    DOWN_ARROW,
    END,
    ENTER,
    ESCAPE,
    FF_MINUS,
    formatNumberWithLocale,
    HOME,
    isCopy,
    isFunctionKey,
    isNumberKey,
    isNumpadKey,
    isSelectAll,
    KBQ_DEFAULT_LOCALE_ID,
    KBQ_DEFAULT_PRECISION_SEPARATOR,
    KBQ_LOCALE_SERVICE,
    KbqDeepPartial,
    KbqInputLocaleConfiguration,
    KbqInputNumberLocaleConfiguration,
    kbqLocaleConfigurationOverrideProvider,
    KbqLocaleOverridesDirective,
    KbqLocaleService,
    LEFT_ARROW,
    normalizeNumber,
    NUMPAD_MINUS,
    RIGHT_ARROW,
    ruRUFormattersData,
    TAB,
    UP_ARROW,
    V,
    X,
    Z
} from '@koobiq/components/core';
import { Subject } from 'rxjs';

/**
 * @deprecated Use {@link KBQ_INPUT_DEFAULT_LOCALE_CONFIGURATION}, which carries the whole `input`
 * locale section rather than just its `number` slice.
 */
export const KBQ_INPUT_NUMBER_DEFAULT_CONFIGURATION = ruRUFormattersData.input.number;

/**
 * Default configuration of `KbqNumberInput`: the whole `input` locale section, of which the number input
 * reads `number`.
 */
export const KBQ_INPUT_DEFAULT_LOCALE_CONFIGURATION: KbqInputLocaleConfiguration = ruRUFormattersData.input;

/** Injection token for providing the default configuration of `KbqNumberInput`. */
export const KBQ_INPUT_LOCALE_CONFIGURATION = new InjectionToken<KbqInputLocaleConfiguration>(
    'KbqInputLocaleConfiguration',
    { factory: () => KBQ_INPUT_DEFAULT_LOCALE_CONFIGURATION }
);

/**
 * Utility provider for `KBQ_INPUT_LOCALE_CONFIGURATION`. Only the values you pass are overridden; the rest
 * keep following the active locale.
 */
export const kbqInputLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqInputLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('input', configuration);

/**
 * Default of `bigStep`.
 * @docs-private
 */
export const BIG_STEP = 10;

/**
 * Default of `step`.
 * @docs-private
 */
export const SMALL_STEP = 1;

/**
 * The locale id handed to `Intl.NumberFormat`, which is not always the active one.
 *
 * `es-LA` is not a real BCP-47 tag — `LA` is the region code for Laos — so what `Intl` makes of it is
 * up to the ICU data of whatever engine is running: today's Node resolves it to plain `es`, another
 * build may fall back somewhere else entirely. Pinning it to a tag every ICU build carries is a
 * deliberate workaround, not a leftover: it takes that variance out of the rendered number. Remove it
 * only when the locale is renamed to a real tag such as `es-419`.
 */
function resolveIntlLocale(localeId: string | undefined): string {
    return !localeId || localeId === 'es-LA' ? KBQ_DEFAULT_LOCALE_ID : localeId;
}

/**
 * Transform for the numeric inputs: coerces the static attribute form (`min="3"`) and anything a
 * binding produces, falling back to `fallback` for a value that is not a number.
 */
const numberAttribute =
    (fallback: number) =>
    (value: NumberInput): number =>
        coerceNumberProperty(value, fallback);

/**
 * Rewrites every `,` as the canonical `.` decimal point.
 * @docs-private
 */
export function normalizeSplitter(value: string): string {
    return value ? value.replace(/,/g, KBQ_DEFAULT_PRECISION_SEPARATOR) : value;
}

/** @docs-private */
export function isFloat(value: string): boolean {
    return /^-?\d+\.\d+$/.test(value);
}

/** @docs-private */
export function isInt(value: string): boolean {
    return /^-?\d+$/.test(value);
}

/** @docs-private */
export function isDigit(value: string): boolean {
    return isFloat(value) || isInt(value);
}

/**
 * Number of digits after the decimal point. Exponent-aware, so `1e-7` reports `7` rather than the
 * `0` that reading `'1e-7'.split('.')` would give.
 */
function getFractionDigits(value: number): number {
    const [mantissa, negativeExponent] = value.toString().split(/e-/i);
    const digits = mantissa.split(KBQ_DEFAULT_PRECISION_SEPARATOR)[1]?.length ?? 0;

    return negativeExponent ? digits + Number(negativeExponent) : digits;
}

/**
 * Decimal scale of `value`: `10 ** <number of fraction digits>`.
 * @docs-private
 */
export function getPrecision(value: number): number {
    return Math.pow(10, getFractionDigits(value));
}

/**
 * Adds two decimal numbers without IEEE-754 drift: both operands are rounded into integer space at
 * the larger of the two scales, added there, and scaled back.
 * @docs-private
 */
export function add(value1: number, value2: number): number {
    const precision = Math.max(getPrecision(value1), getPrecision(value2));

    return (Math.round(value1 * precision) + Math.round(value2 * precision)) / precision;
}

export const KBQ_NUMBER_INPUT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqNumberInput),
    multi: true
};

@Directive({
    selector: `input[kbqNumberInput]`,
    providers: [KBQ_NUMBER_INPUT_VALUE_ACCESSOR],
    host: {
        role: 'spinbutton',
        '[attr.inputmode]': "integer() ? 'numeric' : 'decimal'",
        '[attr.aria-valuenow]': 'value',
        // The formatted, locale-correct string, so the grouped value is announced rather than the raw number.
        '[attr.aria-valuetext]': 'viewValue || null',
        '[attr.aria-valuemin]': 'ariaValueMin()',
        '[attr.aria-valuemax]': 'ariaValueMax()',
        '(blur)': 'focusChanged(false)',
        '(focus)': 'focusChanged(true)',
        '(paste)': 'onPaste($event)',
        '(keydown)': 'onKeyDown($event)',
        '(input)': 'onInput($event)'
    },
    hostDirectives: [
        { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
    ],
    exportAs: 'kbqNumberInput, kbqNumericalInput'
})
export class KbqNumberInput implements ControlValueAccessor, OnDestroy {
    private elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
    private readonly renderer = inject(Renderer2);
    private readonly ngZone = inject(NgZone);
    private readonly destroyRef = inject(DestroyRef);
    private localeService = inject<KbqLocaleService>(KBQ_LOCALE_SERVICE, { optional: true });
    /** Emits when the value changes (either due to user input or programmatic change). */
    readonly valueChange = new Subject<number | null>();

    /** Emits when the disabled state has changed */
    readonly disabledChange = new Subject<boolean>();

    /** Emits whenever the focused or disabled state of the directive changes. */
    readonly stateChanges: Subject<void> = new Subject<void>();

    /**
     * Discriminator read by `kbq-stepper` to find the control it drives.
     * @docs-private
     */
    controlType: string = 'input-number';

    /**
     * Allows input and pasting of integers only.
     */
    readonly integer = input<boolean, unknown>(false, { transform: booleanAttribute });

    /** Step applied when `Shift` is held. */
    readonly bigStep = input<number, NumberInput>(BIG_STEP, { transform: numberAttribute(BIG_STEP) });

    /** Step applied by the arrow keys and by `kbq-stepper`. */
    readonly step = input<number, NumberInput>(SMALL_STEP, { transform: numberAttribute(SMALL_STEP) });

    /** Lower bound the value is clamped to when stepping. */
    readonly min = input<number, NumberInput>(-Infinity, { transform: numberAttribute(-Infinity) });

    /** Upper bound the value is clamped to when stepping. */
    readonly max = input<number, NumberInput>(Infinity, { transform: numberAttribute(Infinity) });

    readonly withThousandSeparator = input<boolean, unknown>(true, { transform: booleanAttribute });

    /**
     * Adds the thousand separator only from this power of ten. For example, `4` keeps `1234`
     * un-grouped and groups `12345`. Defaults to the active locale's own value.
     */
    readonly startFormattingFrom = input<number>();

    // Deliberately an accessor, not a `model()`: the setter reformats the field and notifies the
    // `ControlValueAccessor`, and a `ModelSignal` cannot intercept a write, so an external `[(value)]`
    // would silently skip both.
    @Input()
    get value(): number | null {
        return this._value;
    }

    set value(value: number | null) {
        const oldValue = this.value;

        this._value = value;

        if (oldValue !== value) {
            this.setViewValue(this.formatNumber(value));

            this.valueChange.next(value);
        }
    }

    private _value: number | null;

    // Deliberately an accessor, for the same reason as `value`: the setter blurs the element so a
    // field disabled while focused does not leave the browser stuck without a `blur` event.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        const newValue = value;
        const element = this.nativeElement;

        if (this._disabled !== newValue) {
            this._disabled = newValue;
            this.disabledChange.next(newValue);
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

    focused: boolean = false;

    get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    get viewValue(): string {
        return this.nativeElement.value;
    }

    /**
     * Locale-aware numeric read of the field: parsed straight from `nativeElement.value`, so `"1 234,5"`
     * reads back as `1234.5` where the native `valueAsNumber` of a `type="text"` input reports `NaN`.
     * Computed on every read rather than cached off the committed model, so it never lags behind a
     * keystroke the way `value` can while `onInput`'s reformat is still pending in its `setTimeout(0)` —
     * safe to read from a consumer's own `(input)` handler. An in-progress `"-"` reads as `null`, same as
     * an empty field, rather than the last committed number.
     */
    get valueAsNumber(): number | null {
        if (this.viewValue === '' || this.viewValue === '-') return null;

        const parsed = Number(normalizeNumber(this.viewValue, this.config));

        return Number.isNaN(parsed) ? null : parsed;
    }

    /**
     * An unbounded end reports no `aria-value*`: `Infinity` is not a valid ARIA attribute value.
     * A `computed()` rather than a getter so the value is cached between checks — the host binding
     * itself lives in the declaring view and repaints either way.
     */
    protected readonly ariaValueMin = computed(() => (Number.isFinite(this.min()) ? this.min() : null));

    /** @see ariaValueMin */
    protected readonly ariaValueMax = computed(() => (Number.isFinite(this.max()) ? this.max() : null));

    protected get fractionSeparator(): KbqInputNumberLocaleConfiguration['fractionSeparator'] {
        return this.config.fractionSeparator;
    }

    protected get groupSeparator(): KbqInputNumberLocaleConfiguration['groupSeparator'] {
        return this.config.groupSeparator;
    }

    private get config() {
        return this.localeConfiguration().number;
    }

    private readonly localeConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'input',
        KBQ_INPUT_LOCALE_CONFIGURATION
    );

    private valueFromPaste: number | null;

    /** Pending `onInput` reformats, cancelled on destroy. */
    private readonly pendingReformats = new Set<ReturnType<typeof setTimeout>>();

    constructor() {
        // Re-render the value in the separators of the new locale. `untracked` keeps the configuration the
        // only dependency: formatting also reads the `withThousandSeparator` input, which must not rewrite
        // what the user is typing on its own.
        effect(() => {
            this.localeConfiguration();

            untracked(() => this.setViewValue(this.formatNumber(this.value)));
        });

        this.destroyRef.onDestroy(() => {
            this.pendingReformats.forEach(clearTimeout);
            this.pendingReformats.clear();
        });
    }

    ngOnDestroy(): void {
        this.valueChange.complete();
        this.disabledChange.complete();
        this.stateChanges.complete();
    }

    onContainerClick(): void {
        this.focus();
    }

    focus(): void {
        this.nativeElement.focus();
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(value: number | null): void {
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

    focusChanged(isFocused: boolean) {
        if (isFocused !== this.focused) {
            this.focused = isFocused;
            this.stateChanges.next();
        }

        if (!isFocused) this.onTouched();
    }

    /**
     * Called when the control is blurred. Needed to properly implement `ControlValueAccessor`.
     * @docs-private
     */
    onTouched = () => {};

    onKeyDown(event: KeyboardEvent) {
        const keyCode = event.keyCode;
        const minuses = [NUMPAD_MINUS, DASH, FF_MINUS];
        const serviceKeys = [DELETE, BACKSPACE, TAB, ESCAPE, ENTER];
        const arrows = [LEFT_ARROW, RIGHT_ARROW];
        const allowedKeys = [HOME, END].concat(arrows).concat(serviceKeys).concat(minuses);

        // should parse normalized fractionSeparator
        const viewValueToBeChecked = normalizeNumber(this.viewValue, this.config);

        const shouldSkipForIntegerMode = this.integer() && this.isPeriod(event);
        const shouldBlockMinus = minuses.includes(keyCode) && (this.viewValue.includes(event.key) || this.min() >= 0);
        const isSignAndFractionSepAlreadyExists =
            this.isPeriod(event) &&
            [this.fractionSeparator, KBQ_DEFAULT_PRECISION_SEPARATOR].includes(event.key) &&
            viewValueToBeChecked.indexOf(KBQ_DEFAULT_PRECISION_SEPARATOR) !== -1;

        if (shouldSkipForIntegerMode || shouldBlockMinus || isSignAndFractionSepAlreadyExists) {
            event.preventDefault();

            return;
        }

        if (allowedKeys.indexOf(keyCode) !== -1 || [
                isSelectAll,
                isCopy,
                this.isCtrlV,
                this.isCtrlX,
                this.isCtrlZ,
                isFunctionKey,
                this.isPeriod
            ].some((fn) => fn(event))) {
            // let it happen, don't do anything
            return;
        }

        const isLetter = !isNumberKey(event) && !isNumpadKey(event);

        // Ensure that it is not a number and stop the keypress
        if (event.shiftKey || isLetter) {
            event.preventDefault();

            // process steps
            const step = event.shiftKey ? this.bigStep() : this.step();

            if (keyCode === UP_ARROW) {
                this.stepUp(step);
            }

            if (keyCode === DOWN_ARROW) {
                this.stepDown(step);
            }
        }
    }

    onInput(event: InputEvent) {
        const currentValueLength = this.formatNumber(this.value)?.length || 0;
        const previousSelectionStart = this.nativeElement.selectionStart || 0;

        // Deferred so the browser has applied the keystroke to the native value before it is reformatted.
        // The handle is tracked and cleared on destroy: a directive torn down between the keystroke and the
        // timeout must not write to a detached node nor push a change into a control the view no longer owns.
        const handle = setTimeout(() => {
            this.pendingReformats.delete(handle);

            const fromPaste = event.inputType === 'insertFromPaste';
            let formattedValue: string | null;

            if (fromPaste) {
                formattedValue = this.formatNumber(this.valueFromPaste);
            } else {
                /*this.viewValue is raw and should be reformatted to localized number */
                formattedValue = this.formatViewValue();

                if (this.withThousandSeparator()) {
                    this.correctCaretForSeparator(currentValueLength, previousSelectionStart);
                }
            }

            this.setViewValue(formattedValue, !fromPaste);

            if (this.viewValue !== '-') {
                this.viewToModelUpdate(formattedValue);
            }
        });

        this.pendingReformats.add(handle);
    }

    onPaste(event: ClipboardEvent) {
        this.valueFromPaste = checkAndNormalizeLocalizedNumber(
            event.clipboardData?.getData('text'),
            this.localeService?.id
        );

        if (this.valueFromPaste === null || isNaN(this.valueFromPaste)) {
            event.preventDefault();
        } else if (this.integer() && isFloat(this.valueFromPaste.toString())) {
            event.preventDefault();

            const parsedValue = Number.parseInt(this.valueFromPaste.toString());

            this.setViewValue(this.formatNumber(parsedValue));
            this.viewToModelUpdate(parsedValue.toString());
        }
    }

    stepUp(step: number) {
        this.nativeElement.focus();

        const res = Math.max(Math.min(add(this.value || 0, step), this.max()), this.min());

        this.setViewValue(this.formatNumber(res));

        this._value = res;
        this.cvaOnChange(res);
        this.valueChange.next(res);
    }

    stepDown(step: number) {
        this.nativeElement.focus();

        const res = Math.min(Math.max(add(this.value || 0, -step), this.min()), this.max());

        this.setViewValue(this.formatNumber(res));

        this._value = res;
        this.cvaOnChange(res);
        this.valueChange.next(res);
    }

    private isCtrlV = (event: KeyboardEvent) => {
        return event.keyCode === V && (event.ctrlKey || event.metaKey);
    };

    private isCtrlX = (event: KeyboardEvent) => {
        return event.keyCode === X && (event.ctrlKey || event.metaKey);
    };

    private isCtrlZ = (event: KeyboardEvent) => {
        return event.keyCode === Z && (event.ctrlKey || event.metaKey);
    };

    private isPeriod = (event: KeyboardEvent) => {
        return (
            this.groupSeparator.includes(event.key) ||
            [this.fractionSeparator, KBQ_DEFAULT_PRECISION_SEPARATOR].includes(event.key)
        );
    };

    private cvaOnChange: (value: any) => void = () => {};

    /**
     * Moves the caret one position when a group separator was inserted or removed by the reformat, so it
     * stays next to the same digit. Runs outside the zone: it only writes the selection, which no view or
     * model reads back, and each keystroke would otherwise cost an extra application-wide check.
     */
    private correctCaretForSeparator(previousValueLength: number, previousSelectionStart: number): void {
        const offsetWhenSeparatorAdded = 2;

        this.ngZone.runOutsideAngular(() =>
            Promise.resolve().then(() => {
                const lengthDelta = this.viewValue.length - previousValueLength;

                if (this.value && Math.abs(this.value) >= 1000 && Math.abs(lengthDelta) === offsetWhenSeparatorAdded) {
                    const cursorPosition = Math.max(0, previousSelectionStart + Math.sign(lengthDelta));

                    this.renderer.setProperty(this.nativeElement, 'selectionStart', cursorPosition);
                    this.renderer.setProperty(this.nativeElement, 'selectionEnd', cursorPosition);
                }
            })
        );
    }

    private setViewValue(value: string | null, savePosition: boolean = false) {
        const cursorPosition = this.nativeElement.selectionStart;

        this.renderer.setProperty(this.nativeElement, 'value', value);

        if (savePosition) {
            this.renderer.setProperty(this.nativeElement, 'selectionStart', cursorPosition);
            this.renderer.setProperty(this.nativeElement, 'selectionEnd', cursorPosition);
        }
    }

    private viewToModelUpdate(newValue: string | null) {
        const normalizedValue = newValue === null ? null : +normalizeNumber(newValue, this.config);

        if (normalizedValue !== this.value) {
            this._value = normalizedValue;
            // `cvaOnChange` routes through `FormControl.setValue`, which re-runs the validators itself.
            this.cvaOnChange(normalizedValue);
            this.valueChange.next(normalizedValue);
        }
    }

    private formatViewValue(): string | null {
        // we just need to skip the minus sign and not do any formatting
        if (this.viewValue === '-') return this.viewValue;

        if (
            this.viewValue === null ||
            this.viewValue === '' ||
            Number.isNaN(+normalizeNumber(this.viewValue, this.config))
        ) {
            return null;
        }

        const separator =
            this.groupSeparator.includes(' ') && this.fractionSeparator === ',' ? /[,.]/ : this.fractionSeparator;

        const [intPart, fractionPart] = this.viewValue
            .split(separator)
            .map((valuePart) => normalizeNumber(valuePart, this.config));

        return this.createLocalizedNumberFromParts(+intPart, fractionPart);
    }

    private formatNumber(value: number | null | undefined): string | null {
        if (value === null || value === undefined) return null;

        const [intPart, fractionPart] = value.toString().split(KBQ_DEFAULT_PRECISION_SEPARATOR);

        return this.createLocalizedNumberFromParts(+intPart, fractionPart);
    }

    private createLocalizedNumberFromParts(intPart: number, fractionPart?: string): string {
        const formatOptions = {
            useGrouping: this.withThousandSeparator(),
            maximumFractionDigits: 20
        };

        const startFormattingFrom = this.startFormattingFrom() ?? this.config.startFormattingFrom;

        if (this.withThousandSeparator() && startFormattingFrom != null) {
            formatOptions.useGrouping = intPart >= Math.pow(10, startFormattingFrom);
        }

        const formatter = new Intl.NumberFormat(resolveIntlLocale(this.localeService?.id), formatOptions);

        const formattedIntPart = formatNumberWithLocale(intPart, formatter, this.config);

        if (fractionPart === undefined) {
            return formattedIntPart;
        }

        let formattedFractionPart: string = '';

        for (const numChar of fractionPart) {
            formattedFractionPart += formatter.format(+numChar);
        }

        return `${formattedIntPart}${this.fractionSeparator}${formattedFractionPart}`;
    }
}
