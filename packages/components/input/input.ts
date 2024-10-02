import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { getSupportedInputTypes } from '@angular/cdk/platform';
import {
    Directive,
    DoCheck,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    Optional,
    Self
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import {
    CanUpdateErrorState,
    CanUpdateErrorStateCtor,
    ErrorStateMatcher,
    mixinErrorState
} from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { Subject } from 'rxjs';
import { getKbqInputUnsupportedTypeError } from './input-errors';
import { KbqNumberInput } from './input-number';
import { KBQ_INPUT_VALUE_ACCESSOR } from './input-value-accessor';

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

let nextUniqueId = 0;

/** @docs-private */
export class KbqInputBase {
    /**
     * Emits whenever the component state changes and should cause the parent
     * form-field to update. Implemented as part of `KbqFormFieldControl`.
     * @docs-private
     */
    readonly stateChanges = new Subject<void>();

    constructor(
        public defaultErrorStateMatcher: ErrorStateMatcher,
        public parentForm: NgForm,
        public parentFormGroup: FormGroupDirective,
        public ngControl: NgControl
    ) {}
}

/** @docs-private */
export const KbqInputMixinBase: CanUpdateErrorStateCtor & typeof KbqInputBase = mixinErrorState(KbqInputBase);

@Directive({
    selector: `input[kbqInput],input[kbqNumberInput]`,
    exportAs: 'kbqInput',
    host: {
        class: 'kbq-input',
        // Native input properties that are overwritten by Angular inputs need to be synced with
        // the native input element. Otherwise property bindings for those don't work.
        '[attr.id]': 'id',
        '[attr.placeholder]': 'placeholder',
        '[attr.disabled]': 'disabled || null',
        '[required]': 'required',
        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)'
    },
    providers: [
        {
            provide: KbqFormFieldControl,
            useExisting: KbqInput
        }
    ]
})
export class KbqInput
    extends KbqInputMixinBase
    implements KbqFormFieldControl<any>, OnChanges, OnDestroy, DoCheck, CanUpdateErrorState, OnChanges
{
    /** An object used to control when error messages are shown. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    focused: boolean = false;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    readonly stateChanges: Subject<void> = new Subject<void>();

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    controlType: string = 'input';

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input() placeholder: string;

    protected uid = `kbq-input-${nextUniqueId++}`;
    protected previousNativeValue: any;
    protected neverEmptyInputTypes = [
        'date',
        'datetime',
        'datetime-local',
        'month',
        'time',
        'week'
    ].filter((t) => getSupportedInputTypes().has(t));

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input()
    get disabled(): boolean {
        if (this.ngControl && this.ngControl.disabled !== null) {
            return this.ngControl.disabled;
        }

        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);

        // Browsers may not fire the blur event if the input is disabled too quickly.
        // Reset from here to ensure that the element doesn't become stuck.
        if (this.focused) {
            this.focused = false;
            this.stateChanges.next();
        }
    }

    private _disabled = false;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
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

    private _required = false;

    /** Input type of the element. */
    @Input()
    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._type = value || 'text';
        this.validateType();

        // When using Angular inputs, developers are no longer able to set the properties on the native
        // input element. To ensure that bindings for `type` work, we need to sync the setter
        // with the native property. Textarea elements don't support the type property or attribute.
        if (getSupportedInputTypes().has(this._type)) {
            this.elementRef.nativeElement.type = this._type;
        }
    }

    private _type = 'text';

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input()
    get value(): string {
        return this.inputValueAccessor.value;
    }

    set value(value: string) {
        if (value !== this.value) {
            this.inputValueAccessor.value = value;
            this.stateChanges.next();
        }
    }

    private inputValueAccessor: { value: any };

    constructor(
        protected elementRef: ElementRef,
        @Optional() @Self() ngControl: NgControl,
        @Optional() @Self() public numberInput: KbqNumberInput,
        @Optional() parentForm: NgForm,
        @Optional() parentFormGroup: FormGroupDirective,
        defaultErrorStateMatcher: ErrorStateMatcher,
        @Optional() @Self() @Inject(KBQ_INPUT_VALUE_ACCESSOR) inputValueAccessor: any
    ) {
        super(defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);

        // If no input value accessor was explicitly specified, use the element as the input value accessor.
        this.inputValueAccessor = inputValueAccessor || this.elementRef.nativeElement;

        this.previousNativeValue = this.value;

        // Force setter to be called in case id was not specified.
        this.id = this.id;
    }

    ngOnChanges() {
        this.stateChanges.next();
    }

    ngOnDestroy() {
        this.stateChanges.complete();
    }

    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
        }

        // We need to dirty-check the native element's value, because there are some cases where
        // we won't be notified when it changes (e.g. the consumer isn't using forms or they're
        // updating the value using `emitEvent: false`).
        this.dirtyCheckNativeValue();
    }

    /** Focuses the input. */
    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    onBlur(): void {
        this.focusChanged(false);

        if (this.ngControl?.control) {
            const control = this.ngControl.control;

            control.updateValueAndValidity({ emitEvent: false });
            (control.statusChanges as EventEmitter<string>).emit(control.status);
        }
    }

    /** Callback for the cases where the focused state of the input changes. */
    focusChanged(isFocused: boolean) {
        if (this.focused !== isFocused) {
            this.focused = isFocused;
            this.stateChanges.next();
        }
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    get empty(): boolean {
        return !this.isNeverEmpty() && !this.elementRef.nativeElement.value && !this.isBadInput();
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    onContainerClick() {
        this.focus();
    }

    /** Does some manual dirty checking on the native input `value` property. */
    protected dirtyCheckNativeValue() {
        const newValue = this.value;

        if (this.previousNativeValue !== newValue) {
            this.previousNativeValue = newValue;
            this.stateChanges.next();
        }
    }

    /** Make sure the input is a supported type. */
    protected validateType() {
        if (KBQ_INPUT_INVALID_TYPES.indexOf(this._type) > -1) {
            throw getKbqInputUnsupportedTypeError(this._type);
        }
    }

    /** Checks whether the input type is one of the types that are never empty. */
    protected isNeverEmpty() {
        return this.neverEmptyInputTypes.indexOf(this._type) > -1;
    }

    /** Checks whether the input is invalid based on the native validation. */
    protected isBadInput() {
        // The `validity` property won't be present on platform-server.
        const validity = (this.elementRef.nativeElement as HTMLInputElement).validity;

        return validity?.badInput;
    }
}

@Directive({
    selector: 'input[kbqInputMonospace]',
    exportAs: 'KbqInputMonospace',
    host: { class: 'kbq-input_monospace' }
})
export class KbqInputMono {}
