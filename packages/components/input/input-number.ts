import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    Attribute,
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
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    A,
    BACKSPACE,
    C,
    DASH,
    DELETE,
    DOWN_ARROW,
    END,
    ENTER,
    ESCAPE,
    FF_MINUS,
    HOME,
    isFunctionKey,
    isNumberKey,
    isNumpadKey,
    LEFT_ARROW,
    NUMPAD_MINUS,
    RIGHT_ARROW,
    TAB,
    UP_ARROW,
    V,
    X,
    Z
} from '@koobiq/cdk/keycodes';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { Subject, Subscription } from 'rxjs';

export const BIG_STEP = 10;
export const SMALL_STEP = 1;

export function normalizeSplitter(value: string): string {
    return value ? value.replace(/,/g, '.') : value;
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
    const arr = value.toString().split('.');

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

interface NumberLocaleConfig {
    groupSeparator: string[];
    fractionSeparator: string;
    startFormattingFrom?: number;
}

@Directive({
    selector: `input[kbqInput][type="number"]`,
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
export class KbqNumberInput implements KbqFormFieldControl<any>, ControlValueAccessor, AfterContentInit, OnDestroy {
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

    @Input()
    bigStep: number;

    @Input()
    step: number;

    @Input()
    min: number;

    @Input()
    max: number;

    @Input()
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

    private control: AbstractControl;

    private readonly allNumberLocaleConfigs: { id: string; config: NumberLocaleConfig }[];

    private numberLocaleConfig: NumberLocaleConfig;

    private valueFromPaste: number | null;

    private localeSubscription = Subscription.EMPTY;

    constructor(
        private elementRef: ElementRef,
        private readonly renderer: Renderer2,
        @Attribute('step') step: string,
        @Attribute('big-step') bigStep: string,
        @Attribute('min') min: string,
        @Attribute('max') max: string,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService
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

        this.allNumberLocaleConfigs = this.localeService?.locales.items.map(
            (localeItem: { id: string; name: string }) => {
                return { id: localeItem.id, config: this.localeService.locales[localeItem.id].input.number };
            }
        );

        this.localeSubscription = this.localeService?.changes.subscribe(this.updateLocaleParams);
    }

    ngAfterContentInit(): void {
        this.renderer.setProperty(this.nativeElement, 'type', 'text');
    }

    ngOnDestroy(): void {
        this.localeSubscription.unsubscribe();
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
    }

    onTouched = () => {};

    onKeyDown(event: KeyboardEvent) {
        const keyCode = event.keyCode;

        const isCtrlA = (e) => e.keyCode === A && (e.ctrlKey || e.metaKey);
        const isCtrlC = (e) => e.keyCode === C && (e.ctrlKey || e.metaKey);
        const isCtrlV = (e) => e.keyCode === V && (e.ctrlKey || e.metaKey);
        const isCtrlX = (e) => e.keyCode === X && (e.ctrlKey || e.metaKey);
        const isCtrlZ = (e) => e.keyCode === Z && (e.ctrlKey || e.metaKey);

        const isPeriod = (e) =>
            this.numberLocaleConfig.groupSeparator.includes(e.key) ||
            [this.numberLocaleConfig.fractionSeparator, '.'].includes(e.key);

        const minuses = [NUMPAD_MINUS, DASH, FF_MINUS];
        const serviceKeys = [DELETE, BACKSPACE, TAB, ESCAPE, ENTER];
        const arrows = [LEFT_ARROW, RIGHT_ARROW];
        const allowedKeys = [HOME, END].concat(arrows).concat(serviceKeys).concat(minuses);

        if (minuses.includes(keyCode) && (this.viewValue.includes(event.key) || this.min >= 0)) {
            event.preventDefault();

            return;
        }

        if (isPeriod(event)) {
            if (
                event.key === this.numberLocaleConfig.fractionSeparator &&
                this.viewValue.indexOf(this.numberLocaleConfig.fractionSeparator) !== -1
            ) {
                event.preventDefault();

                return;
            }
        }

        if (allowedKeys.indexOf(keyCode) !== -1 || [
                isCtrlA,
                isCtrlC,
                isCtrlV,
                isCtrlX,
                isCtrlZ,
                isFunctionKey,
                isPeriod
            ].some((fn) => fn(event))) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is not a number and stop the keypress
        if (event.shiftKey || (!isNumberKey(event) && !isNumpadKey(event))) {
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

        setTimeout(() => {
            const fromPaste = event.inputType === 'insertFromPaste';
            let formattedValue: string | null;
            if (fromPaste) {
                formattedValue = this.formatNumber(this.valueFromPaste);
            } else {
                /*this.viewValue is raw and should be reformatted to localized number */
                formattedValue = this.formatViewValue();

                const offsetWhenSeparatorAdded = 2;

                Promise.resolve().then(() => {
                    if (Math.abs(this.viewValue.length - currentValueLength) === offsetWhenSeparatorAdded) {
                        const cursorPosition = Math.max(
                            0,
                            (this.nativeElement.selectionStart || 0) +
                                Math.sign(this.viewValue.length - currentValueLength)
                        );

                        this.renderer.setProperty(this.nativeElement, 'selectionStart', cursorPosition);
                        this.renderer.setProperty(this.nativeElement, 'selectionEnd', cursorPosition);
                    }
                });
            }
            this.setViewValue(formattedValue, !fromPaste);
            this.viewToModelUpdate(formattedValue);
        });
    }

    onPaste(event: ClipboardEvent) {
        this.valueFromPaste = this.checkAndNormalizeLocalizedNumber(event.clipboardData?.getData('text'));
        if (this.valueFromPaste === null) {
            event.preventDefault();
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
        const normalizedValue = newValue === null ? null : +this.normalizeNumber(newValue);

        if (normalizedValue !== this.value) {
            this._value = normalizedValue;
            this.cvaOnChange(normalizedValue);
            this.valueChange.emit(normalizedValue);
        }

        this.ngControl?.updateValueAndValidity({ emitEvent: false });
    }

    private formatViewValue(): string | null {
        if (this.viewValue === null || this.viewValue === '' || Number.isNaN(+this.normalizeNumber(this.viewValue))) {
            return null;
        }

        const separator =
            this.numberLocaleConfig.groupSeparator.includes(' ') && this.numberLocaleConfig.fractionSeparator === ','
                ? /[,.]/
                : this.numberLocaleConfig.fractionSeparator;

        const [intPart, fractionPart] = this.viewValue
            .split(separator)
            .map((valuePart) => this.normalizeNumber(valuePart));

        return this.createLocalizedNumberFromParts(+intPart, fractionPart);
    }

    private formatNumber(value: number | null | undefined): string | null {
        if (value === null || value === undefined) {
            return null;
        }

        const [intPart, fractionPart] = value.toString().split('.');

        return this.createLocalizedNumberFromParts(+intPart, fractionPart);
    }

    private createLocalizedNumberFromParts(intPart: number, fractionPart?: string): string {
        const formatOptions = {
            useGrouping: this.withThousandSeparator,
            maximumFractionDigits: 20
        };

        if (this.withThousandSeparator && this.numberLocaleConfig.startFormattingFrom) {
            formatOptions.useGrouping = intPart >= Math.pow(10, this.numberLocaleConfig.startFormattingFrom);
        }

        const localeId = this.localeService.id === 'es-LA' ? 'ru-RU' : this.localeService.id;

        const formatter = new Intl.NumberFormat(localeId, formatOptions);
        const formattedFractionPart = fractionPart
            ?.split('')
            .map((numChar) => formatter.format(+numChar))
            .join('');

        return formattedFractionPart === undefined
            ? formatter.format(intPart)
            : `${formatter.format(intPart)}${this.numberLocaleConfig.fractionSeparator}${formattedFractionPart}`;
    }

    /**
     * Method that returns a string representation of a number without localized separators
     */
    private normalizeNumber(value: string | null | undefined, customConfig?: NumberLocaleConfig): string {
        if (value === null || value === undefined) {
            return '';
        }

        const { groupSeparator, fractionSeparator } = customConfig || this.numberLocaleConfig;
        const groupSeparatorRegexp = new RegExp(`[${groupSeparator.join('')}]`, 'g');
        const fractionSeparatorRegexp = new RegExp(`\\${fractionSeparator}`, 'g');

        return value.toString().replace(groupSeparatorRegexp, '').replace(fractionSeparatorRegexp, '.');
    }

    private updateLocaleParams = (id: string) => {
        this.numberLocaleConfig = this.localeService.locales[id].input.number;

        this.setViewValue(this.formatNumber(this.value));
    };

    private checkAndNormalizeLocalizedNumber(num: string | null | undefined): number | null {
        if (num === null || num === undefined) {
            return null;
        }

        /* if some locale input config satisfies pasted number, try to normalize with selected locale config */
        let numberOutput: number | null = null;
        for (const { config } of this.allNumberLocaleConfigs) {
            const normalized = +this.normalizeNumber(num, config);
            if (!Number.isNaN(normalized)) {
                numberOutput = normalized;
                break;
            }
        }

        return numberOutput;
    }
}
