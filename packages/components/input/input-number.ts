import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    Attribute,
    booleanAttribute,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Renderer2
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    BACKSPACE,
    DASH,
    DELETE,
    DOWN_ARROW,
    END,
    ENTER,
    ESCAPE,
    FF_MINUS,
    HOME,
    isCopy,
    isFunctionKey,
    isNumberKey,
    isNumpadKey,
    isSelectAll,
    LEFT_ARROW,
    NUMPAD_MINUS,
    RIGHT_ARROW,
    TAB,
    UP_ARROW,
    V,
    X,
    Z
} from '@koobiq/cdk/keycodes';
import {
    checkAndNormalizeLocalizedNumber,
    formatNumberWithLocale,
    KBQ_DEFAULT_PRECISION_SEPARATOR,
    KBQ_LOCALE_SERVICE,
    KbqLocaleService,
    KbqNumberInputLocaleConfig,
    normalizeNumber,
    ruRUFormattersData
} from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { Subject } from 'rxjs';

export const KBQ_INPUT_NUMBER_DEFAULT_CONFIGURATION = ruRUFormattersData.input.number;

export const BIG_STEP = 10;
export const SMALL_STEP = 1;

export function normalizeSplitter(value: string): string {
    return value ? value.replace(/,/g, KBQ_DEFAULT_PRECISION_SEPARATOR) : value;
}

export function isFloat(value: string): boolean {
    return /^-?\d+\.\d+$/.test(value);
}

export function isInt(value: string): boolean {
    return /^-?\d+$/.test(value);
}

export function isDigit(value: string): boolean {
    return isFloat(value) || isInt(value);
}

export function getPrecision(value: number): number {
    const arr = value.toString().split(KBQ_DEFAULT_PRECISION_SEPARATOR);

    return arr.length === 1 ? 1 : Math.pow(10, arr[1].length);
}

export function add(value1: number, value2: number): number {
    const precision = Math.max(getPrecision(value1), getPrecision(value2));

    return (value1 * precision + value2 * precision) / precision;
}

export const KBQ_NUMBER_INPUT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => KbqNumberInput),
    multi: true
};

@Directive({
    selector: `input[kbqNumberInput]`,
    exportAs: 'kbqNumericalInput',
    providers: [KBQ_NUMBER_INPUT_VALUE_ACCESSOR],
    host: {
        '(blur)': 'focusChanged(false)',
        '(focus)': 'focusChanged(true)',
        '(paste)': 'onPaste($event)',
        '(keydown)': 'onKeyDown($event)',
        '(input)': 'onInput($event)'
    }
})
export class KbqNumberInput implements KbqFormFieldControl<any>, ControlValueAccessor, OnDestroy {
    /** Emits when the value changes (either due to user input or programmatic change). */
    valueChange = new EventEmitter<number | null>();

    /** Emits when the disabled state has changed */
    disabledChange = new EventEmitter<boolean>();

    readonly stateChanges: Subject<void> = new Subject<void>();

    id: string;

    placeholder: string;

    empty: boolean;

    required: boolean;

    errorState: boolean;

    controlType?: string | undefined;

    /**
     * Allows input and pasting of integers only.
     */
    @Input({ transform: booleanAttribute })
    integer: boolean = false;

    @Input()
    bigStep: number;

    @Input()
    step: number;

    @Input()
    min: number;

    @Input()
    max: number;

    @Input({ transform: booleanAttribute })
    withThousandSeparator: boolean = true;

    /**
     * Include thousand separator from custom index. For example, it will be useful in tables.
     */
    @Input()
    startFormattingFrom?: number;

    @Input()
    get value(): number | null {
        return this._value;
    }

    set value(value: number | null) {
        const oldValue = this.value;

        this._value = value;

        if (oldValue !== value) {
            this.setViewValue(this.formatNumber(value));

            this.valueChange.emit(value);
        }
    }

    private _value: number | null;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        const newValue = coerceBooleanProperty(value);
        const element = this.nativeElement;

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

    focused: boolean = false;

    get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    get viewValue(): string {
        return this.nativeElement.value;
    }

    get ngControl(): any {
        return this.control;
    }

    protected get fractionSeparator(): KbqNumberInputLocaleConfig['fractionSeparator'] {
        return this.config.fractionSeparator;
    }

    protected get groupSeparator(): KbqNumberInputLocaleConfig['groupSeparator'] {
        return this.config.groupSeparator;
    }

    private control: AbstractControl;

    private config: KbqNumberInputLocaleConfig;

    private valueFromPaste: number | null;

    constructor(
        private elementRef: ElementRef<HTMLInputElement>,
        private readonly renderer: Renderer2,
        @Attribute('step') step: string,
        @Attribute('big-step') bigStep: string,
        @Attribute('min') min: string,
        @Attribute('max') max: string,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService?: KbqLocaleService
    ) {
        this.step = isDigit(step) ? parseFloat(step) : SMALL_STEP;
        this.bigStep = isDigit(bigStep) ? parseFloat(bigStep) : BIG_STEP;
        this.min = isDigit(min) ? parseFloat(min) : -Infinity;
        this.max = isDigit(max) ? parseFloat(max) : Infinity;

        if ('valueAsNumber' in this.nativeElement) {
            Object.defineProperty(Object.getPrototypeOf(this.nativeElement), 'valueAsNumber', {
                get() {
                    const res = parseFloat(normalizeSplitter(this.value));

                    return isNaN(res) ? null : res;
                }
            });
        }

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!localeService) {
            this.initDefaultParams();
        }
    }

    ngOnDestroy(): void {
        this.valueChange.complete();
        this.disabledChange.complete();
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

    onTouched = () => {};

    onKeyDown(event: KeyboardEvent) {
        const keyCode = event.keyCode;
        const minuses = [NUMPAD_MINUS, DASH, FF_MINUS];
        const serviceKeys = [DELETE, BACKSPACE, TAB, ESCAPE, ENTER];
        const arrows = [LEFT_ARROW, RIGHT_ARROW];
        const allowedKeys = [HOME, END].concat(arrows).concat(serviceKeys).concat(minuses);

        // should parse normalized fractionSeparator
        const viewValueToBeChecked = normalizeNumber(this.viewValue, this.config);

        const shouldSkipForIntegerMode = this.integer && this.isPeriod(event);
        const isMinusAllowed = minuses.includes(keyCode) && (this.viewValue.includes(event.key) || this.min >= 0);
        const isSignAndFractionSepAlreadyExists =
            this.isPeriod(event) &&
            [this.fractionSeparator, KBQ_DEFAULT_PRECISION_SEPARATOR].includes(event.key) &&
            viewValueToBeChecked.indexOf(KBQ_DEFAULT_PRECISION_SEPARATOR) !== -1;

        if (shouldSkipForIntegerMode || isMinusAllowed || isSignAndFractionSepAlreadyExists) {
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
            const step = event.shiftKey ? this.bigStep : this.step;

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

        setTimeout(() => {
            const fromPaste = event.inputType === 'insertFromPaste';
            let formattedValue: string | null;

            if (fromPaste) {
                formattedValue = this.formatNumber(this.valueFromPaste);
            } else {
                /*this.viewValue is raw and should be reformatted to localized number */
                formattedValue = this.formatViewValue();

                if (this.withThousandSeparator) {
                    const offsetWhenSeparatorAdded = 2;

                    Promise.resolve().then(() => {
                        if (
                            this.value &&
                            Math.abs(this.value) >= 1000 &&
                            Math.abs(this.viewValue.length - currentValueLength) === offsetWhenSeparatorAdded
                        ) {
                            // move selection to the left/right if separator was added/removed
                            const cursorPosition = Math.max(
                                0,
                                previousSelectionStart + Math.sign(this.viewValue.length - currentValueLength)
                            );

                            this.renderer.setProperty(this.nativeElement, 'selectionStart', cursorPosition);
                            this.renderer.setProperty(this.nativeElement, 'selectionEnd', cursorPosition);
                        }
                    });
                }
            }

            this.setViewValue(formattedValue, !fromPaste);

            if (this.viewValue !== '-') {
                this.viewToModelUpdate(formattedValue);
            }
        });
    }

    onPaste(event: ClipboardEvent) {
        this.valueFromPaste = checkAndNormalizeLocalizedNumber(
            event.clipboardData?.getData('text'),
            this.localeService?.id
        );

        if (this.valueFromPaste === null || isNaN(this.valueFromPaste)) {
            event.preventDefault();
        } else if (this.integer && isFloat(this.valueFromPaste.toString())) {
            event.preventDefault();

            const parsedValue = Number.parseInt(this.valueFromPaste.toString());

            this.setViewValue(this.formatNumber(parsedValue));
            this.viewToModelUpdate(parsedValue.toString());
        }
    }

    stepUp(step: number) {
        this.nativeElement.focus();

        const res = Math.max(Math.min(add(this.value || 0, step), this.max), this.min);

        this.setViewValue(this.formatNumber(res));

        this._value = res;
        this.cvaOnChange(res);
        this.valueChange.emit(res);
    }

    stepDown(step: number) {
        this.nativeElement.focus();

        const res = Math.min(Math.max(add(this.value || 0, -step), this.min), this.max);

        this.setViewValue(this.formatNumber(res));

        this._value = res;
        this.cvaOnChange(res);
        this.valueChange.emit(res);
    }

    private initDefaultParams() {
        this.config = KBQ_INPUT_NUMBER_DEFAULT_CONFIGURATION;
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
            this.cvaOnChange(normalizedValue);
            this.valueChange.emit(normalizedValue);
        }

        this.ngControl?.updateValueAndValidity({ emitEvent: false });
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
            useGrouping: this.withThousandSeparator,
            maximumFractionDigits: 20
        };

        if (this.withThousandSeparator && this.config.startFormattingFrom) {
            formatOptions.useGrouping = intPart >= Math.pow(10, this.config.startFormattingFrom);
        }

        const localeId = !this.localeService || this.localeService.id === 'es-LA' ? 'ru-RU' : this.localeService.id;

        const formatter = new Intl.NumberFormat(localeId, formatOptions);

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

    private updateLocaleParams = () => {
        this.config = this.localeService!.getParams('input').number;

        this.setViewValue(this.formatNumber(this.value));
    };
}
