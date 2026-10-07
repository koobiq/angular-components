import { _IdGenerator } from '@angular/cdk/a11y';
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
    OnDestroy,
    signal,
    untracked,
    WritableSignal
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import { CanUpdateErrorState, ErrorStateMatcher, kbqInjectAutofilled } from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { Subject } from 'rxjs';
import { KBQ_INPUT_VALUE_ACCESSOR } from './input-value-accessor';

@Directive({
    selector: `input[kbqInputPassword]`,
    providers: [
        {
            provide: KbqFormFieldControl,
            useExisting: KbqInputPassword
        }
    ],
    host: {
        class: 'kbq-input kbq-input-password',
        // Native input properties that are overwritten by Angular inputs need to be synced with
        // the native input element. Otherwise property bindings for those don't work.
        '[attr.id]': 'id()',
        '[attr.type]': 'elementType()',
        '[attr.placeholder]': 'placeholder()',
        '[attr.disabled]': 'disabled() || null',
        '[attr.aria-invalid]': 'errorState()',
        '[required]': 'required()',
        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)',
        '(input)': 'dirtyCheckNativeValue()'
    },
    exportAs: 'kbqInputPassword'
})
export class KbqInputPassword implements KbqFormFieldControl<any>, OnDestroy, DoCheck, CanUpdateErrorState {
    protected elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
    ngControl = inject(NgControl, { optional: true, self: true });
    parentForm = inject(NgForm, { optional: true });
    parentFormGroup = inject(FormGroupDirective, { optional: true });
    defaultErrorStateMatcher = inject(ErrorStateMatcher);

    private readonly errorStateValue = signal(false);

    /** Whether the component is in an error state. */
    readonly errorState = this.errorStateValue.asReadonly();

    /** An object used to control when error messages are shown. */
    readonly errorStateMatcher = input<ErrorStateMatcher>();

    private readonly focusedValue = signal(false);

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    readonly focused = this.focusedValue.asReadonly();

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    readonly autofilled = kbqInjectAutofilled();

    /** Emits when the password hints are asked to re-run their rules. */
    readonly checkRule = new Subject<void>();

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    controlType: string = 'input-password';

    private readonly elementTypeValue = signal<'text' | 'password'>('password');

    /** Type of the native input: `password` while the password is hidden, `text` while it is shown. */
    readonly elementType = this.elementTypeValue.asReadonly();

    /** @docs-private */
    readonly placeholderInput = input<string | undefined>(undefined, { alias: 'placeholder' });

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    readonly placeholder = linkedSignal(() => this.placeholderInput());

    // Own namespace: sharing `kbq-input-` with `KbqInput` produced duplicate ids on any page holding both
    // controls, and the form field's `<label for>` then resolved to the wrong control.
    protected uid = inject(_IdGenerator).getId('kbq-input-password-');

    /** @docs-private */
    readonly disabledInput = input<boolean, boolean | string | null | undefined>(false, {
        alias: 'disabled',
        transform: booleanAttribute
    });

    /** `disabled` of the bound form control, which takes precedence over the input. */
    private readonly formDisabled = signal<boolean | null>(null);

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    readonly disabled = computed(() => this.formDisabled() ?? this.disabledInput());

    /** @docs-private */
    readonly idInput = input<string | undefined>(undefined, { alias: 'id' });

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    readonly id = computed(() => this.idInput() || this.uid);

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    readonly required = input<boolean, boolean | string | null | undefined>(false, { transform: booleanAttribute });

    private inputValueAccessor: { value: any };

    /** @docs-private */
    readonly valueInput = input<string | undefined>(undefined, { alias: 'value' });

    /**
     * Implemented as part of KbqFormFieldControl. Follows what the user types; a value bound with `[value]` or set
     * here is written to the element.
     * @docs-private
     */
    readonly value: WritableSignal<string>;

    private readonly emptyValue = signal(true);

    /** The value the element and `value` last agreed on. */
    private syncedValue: unknown;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    readonly empty = this.emptyValue.asReadonly();

    constructor() {
        const inputValueAccessor = inject(KBQ_INPUT_VALUE_ACCESSOR, { optional: true, self: true });

        // If no input value accessor was explicitly specified, use the element as the input value
        // accessor.
        this.inputValueAccessor = inputValueAccessor || this.elementRef.nativeElement;

        this.value = signal(this.inputValueAccessor.value);
        this.syncedValue = this.inputValueAccessor.value;

        // A bound value replaces the current one whenever the binding changes.
        effect(() => {
            const value = this.valueInput();

            if (value !== undefined) {
                untracked(() => this.value.set(value));
            }
        });

        // A value set in code is written to the element on the next change detection.
        effect(() => {
            const value = this.value();

            untracked(() => {
                if (this.inputValueAccessor.value !== value) {
                    this.inputValueAccessor.value = value;
                }

                this.syncedValue = value;
                this.emptyValue.set(this.isEmpty());
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

    ngOnDestroy() {
        this.checkRule.complete();
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
        const parent = this.parentFormGroup || this.parentForm;
        const matcher = this.errorStateMatcher() || this.defaultErrorStateMatcher;
        const control = this.ngControl ? (this.ngControl.control as UntypedFormControl) : null;

        this.errorStateValue.set(matcher.isErrorState(control, parent));
    }

    /** Asks every `kbq-password-hint` in the form field to re-run its rule against the current value. */
    checkRules() {
        this.checkRule.next();
    }

    /** Toggles the native input type between password and text. */
    toggleType(): void {
        this.elementTypeValue.update((type) => (type === 'password' ? 'text' : 'password'));
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
     * @docs-private
     */
    onContainerClick() {
        this.focus();
    }

    /**
     * Reads the native value back, since it changes without notice: through the forms API, which writes the
     * element directly, or by the user typing into an input that no form listens to.
     * @docs-private
     */
    dirtyCheckNativeValue() {
        const nativeValue = this.inputValueAccessor.value;

        // Only a change of the element itself: a value set in code and not yet written must not be overwritten.
        if (nativeValue !== this.syncedValue) {
            this.syncedValue = nativeValue;
            this.value.set(nativeValue);
        }

        this.emptyValue.set(this.isEmpty());
    }

    /** Checks whether the input is invalid based on the native validation. */
    protected isBadInput() {
        // The `validity` property won't be present on platform-server.
        return (this.elementRef.nativeElement as HTMLInputElement).validity?.badInput;
    }

    private isEmpty(): boolean {
        return !this.elementRef.nativeElement.value && !this.isBadInput();
    }
}
