import { _IdGenerator } from '@angular/cdk/a11y';
import { getSupportedInputTypes } from '@angular/cdk/platform';
import {
    booleanAttribute,
    computed,
    Directive,
    DoCheck,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
    signal,
    untracked,
    WritableSignal
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import {
    CanUpdateErrorState,
    ErrorStateMatcher,
    KbqErrorStateTracker,
    kbqInjectAutofilled
} from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { getKbqInputUnsupportedTypeError, KBQ_NUMBER_INPUT_UNSUPPORTED_TYPE_MESSAGE } from './input-errors';
import { KbqNumberInput } from './input-number';
import { KBQ_INPUT_VALUE_ACCESSOR } from './input-value-accessor';

// `typeof ngDevMode` is the guard the build optimizer folds away in production bundles.
declare const ngDevMode: boolean | undefined;

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

const KBQ_INPUT_INVALID_TYPES = [
    'button',
    'checkbox',
    'file',
    'hidden',
    'image',
    'radio',
    'range',
    'reset',
    'submit'
];

@Directive({
    selector: `input[kbqInput],input[kbqNumberInput]`,
    providers: [
        {
            provide: KbqFormFieldControl,
            useExisting: KbqInput
        }
    ],
    host: {
        class: 'kbq-input',
        // Native input properties that are overwritten by Angular inputs need to be synced with
        // the native input element. Otherwise property bindings for those don't work.
        '[attr.id]': 'id()',
        '[attr.placeholder]': 'placeholder()',
        '[attr.disabled]': 'disabled() || null',
        '[attr.aria-invalid]': 'errorState()',
        '[required]': 'required()',
        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)',
        '(input)': 'dirtyCheckNativeValue()'
    },
    exportAs: 'kbqInput'
})
export class KbqInput implements KbqFormFieldControl<any>, DoCheck, CanUpdateErrorState {
    protected elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
    ngControl = inject(NgControl, { optional: true, self: true });
    numberInput = inject(KbqNumberInput, { optional: true, self: true });
    parentForm = inject(NgForm, { optional: true });
    parentFormGroup = inject(FormGroupDirective, { optional: true });
    defaultErrorStateMatcher = inject(ErrorStateMatcher);

    private readonly errorStateTracker = new KbqErrorStateTracker(
        this.defaultErrorStateMatcher,
        this.ngControl,
        this.parentFormGroup,
        this.parentForm
    );

    /** Whether the component is in an error state. */
    readonly errorState = this.errorStateTracker.errorState;

    /** An object used to control when error messages are shown. */
    readonly errorStateMatcher = input<ErrorStateMatcher>();

    private readonly focusedValue = signal(false);

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    readonly focused = this.focusedValue.asReadonly();

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    readonly autofilled = kbqInjectAutofilled();

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    controlType: string = this.numberInput ? 'input-number' : 'input';

    /** @docs-private */
    readonly placeholderInput = input<string | undefined>(undefined, { alias: 'placeholder' });

    /**
     * Implemented as part of KbqFormFieldControl. Writable, so that a select search can supply one.
     *
     * @docs-private
     */
    readonly placeholder = linkedSignal(() => this.placeholderInput());

    protected uid = inject(_IdGenerator).getId('kbq-input-');
    protected neverEmptyInputTypes = [
        'date',
        'datetime',
        'datetime-local',
        'month',
        'time',
        'week'
    ].filter((t) => getSupportedInputTypes().has(t));

    /** @docs-private */
    readonly disabledInput = input<boolean, boolean | string | null | undefined>(false, {
        alias: 'disabled',
        transform: booleanAttribute
    });

    /** `disabled` of the bound form control, which takes precedence over the input. */
    private readonly formDisabled = signal<boolean | null>(null);

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    readonly disabled = computed(() => this.formDisabled() ?? this.disabledInput());

    /** @docs-private */
    readonly idInput = input<string | undefined>(undefined, { alias: 'id' });

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    readonly id = computed(() => this.idInput() || this.uid);

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    readonly required = input<boolean, boolean | string | null | undefined>(false, { transform: booleanAttribute });

    /** @docs-private */
    readonly typeInput = input<string | undefined>(undefined, { alias: 'type' });

    /** Input type of the element. */
    get type(): string {
        return this.resolvedType();
    }

    // A native number field runs the value sanitization algorithm on assignment and drops anything that
    // is not a valid floating-point number — which is every value `kbqNumberInput` renders once a group
    // separator or a comma fraction separator is in it. It also reports `selectionStart` as `null`,
    // disabling caret preservation. Reset rather than throw, so an existing consumer keeps working.
    private readonly resolvedType = computed(() => {
        const type = this.typeInput() || 'text';

        return this.numberInput && type === 'number' ? 'text' : type;
    });

    private inputValueAccessor: { value: any };

    /** @docs-private */
    readonly valueInput = input<string | undefined>(undefined, { alias: 'value' });

    /**
     * Implemented as part of KbqFormFieldControl. Follows what the user types; a value bound with `[value]` or set
     * here is written to the element.
     *
     * @docs-private
     */
    readonly value: WritableSignal<string>;

    private readonly emptyValue = signal(true);

    /** The value the element and `value` last agreed on, and the text the element showed then. */
    private syncedValue: unknown;
    private syncedText: string;

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    readonly empty = this.emptyValue.asReadonly();

    constructor() {
        const inputValueAccessor = inject(KBQ_INPUT_VALUE_ACCESSOR, { optional: true, self: true });

        // If no input value accessor was explicitly specified, use the element as the input value accessor.
        this.inputValueAccessor = inputValueAccessor || this.elementRef.nativeElement;

        // A static `type` is on the element before any directive runs, while the effect below runs after a reactive
        // form has written its value from `ngOnChanges`: a number field would sanitize that value away by then.
        if (this.numberInput && this.elementRef.nativeElement.type === 'number') {
            this.elementRef.nativeElement.type = 'text';
        }

        // Read once: a custom accessor may build a new value on every read.
        const initialValue = this.inputValueAccessor.value;

        this.value = signal(initialValue);
        this.syncedValue = initialValue;
        this.syncedText = this.elementRef.nativeElement.value;

        // A binding of `type` no longer reaches the element on its own: the directive takes the input. Textarea
        // elements don't support the type property or attribute.
        effect(() => {
            const type = this.resolvedType();

            untracked(() => {
                this.validateType();

                if (getSupportedInputTypes().has(type)) {
                    this.elementRef.nativeElement.type = type;
                }
            });
        });

        // A bound value replaces the current one whenever the binding changes. The number input takes the same
        // binding and renders it in the locale format, so it owns the element's value.
        effect(() => {
            const value = this.valueInput();

            if (value !== undefined && !this.numberInput) {
                untracked(() => this.value.set(value));
            }
        });

        // A value set in code is written to the element on the next change detection. The one the element last agreed
        // on is not written back: the element may have changed since, as when the number input renders a bound value.
        effect(() => {
            const value = this.value();

            untracked(() => {
                if (value !== this.syncedValue) {
                    if (this.inputValueAccessor.value !== value) {
                        this.inputValueAccessor.value = value;
                    }

                    this.syncedValue = value;
                    this.syncedText = this.elementRef.nativeElement.value;
                }

                this.dirtyCheckNativeValue();
            });
        });

        // Browsers may not fire the blur event if the input is disabled too quickly.
        // Reset from here to ensure that the element doesn't become stuck.
        effect(() => {
            if (this.disabled()) {
                untracked(() => this.focusedValue.set(false));
            }
        });
    }

    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
            this.formDisabled.set(this.ngControl.disabled);
        }

        // We need to dirty-check the native element's value, because there are some cases where
        // we won't be notified when it changes (e.g. the consumer isn't using forms or they're
        // updating the value using `emitEvent: false`).
        this.dirtyCheckNativeValue();
    }

    updateErrorState() {
        this.errorStateTracker.errorStateMatcher = this.errorStateMatcher();
        this.errorStateTracker.updateErrorState();
    }

    /** Focuses the input. */
    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    onBlur(): void {
        this.focusChanged(false);
    }

    /** Callback for the cases where the focused state of the input changes. */
    focusChanged(isFocused: boolean) {
        this.focusedValue.set(isFocused);
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     *
     * @docs-private
     */
    onContainerClick() {
        this.focus();
    }

    /**
     * Reads the native value back, since it changes without notice: through the forms API, which writes the
     * element directly, or by the user typing into an input that no form listens to.
     *
     * @docs-private
     */
    dirtyCheckNativeValue() {
        const nativeValue = this.inputValueAccessor.value;
        const text = this.elementRef.nativeElement.value;

        // Only a change of the element itself: a value set in code and not yet written must not be overwritten. An
        // object counts as changed only with the text, as a custom accessor may build a new one on every read.
        if (nativeValue !== this.syncedValue && (!isObject(nativeValue) || text !== this.syncedText)) {
            this.syncedValue = nativeValue;
            this.syncedText = text;
            this.value.set(nativeValue);
        }

        this.emptyValue.set(this.isEmpty());
    }

    /** Make sure the input is a supported type. */
    protected validateType() {
        const type = this.typeInput() || 'text';

        if (KBQ_INPUT_INVALID_TYPES.indexOf(type) > -1) {
            throw getKbqInputUnsupportedTypeError(type);
        }

        if (this.numberInput && type === 'number' && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            // eslint-disable-next-line no-console
            console.warn(KBQ_NUMBER_INPUT_UNSUPPORTED_TYPE_MESSAGE);
        }
    }

    /** Checks whether the input type is one of the types that are never empty. */
    protected isNeverEmpty() {
        return this.neverEmptyInputTypes.indexOf(this.type) > -1;
    }

    /** Checks whether the input is invalid based on the native validation. */
    protected isBadInput() {
        // The `validity` property won't be present on platform-server.
        const validity = (this.elementRef.nativeElement as HTMLInputElement).validity;

        return validity?.badInput;
    }

    private isEmpty(): boolean {
        return !this.isNeverEmpty() && !this.elementRef.nativeElement.value && !this.isBadInput();
    }
}

@Directive({
    selector: 'input[kbqInputMonospace]',
    host: { class: 'kbq-input_monospace' },
    exportAs: 'kbqInputMonospace, KbqInputMonospace'
})
export class KbqInputMono {}
