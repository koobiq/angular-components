import {
    booleanAttribute,
    Directive,
    DoCheck,
    ElementRef,
    Inject,
    InjectionToken,
    Input,
    OnChanges,
    OnDestroy,
    Optional,
    Self
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm, Validators } from '@angular/forms';
import { CanUpdateErrorState, ErrorStateMatcher, mixinErrorState } from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { Subject } from 'rxjs';

/** Interface for KBQ_TEXT_FIELD_VALUE_ACCESSOR token. */
export type KbqTextFieldValueAccessor = { value: any };

/**
 * This token is used to inject the object whose value should be set into `KbqTextField`. If none is provided, the native
 * `HTMLInputElement`/`HTMLTextAreaElement` is used.
 */
export const KBQ_TEXT_FIELD_VALUE_ACCESSOR = new InjectionToken<KbqTextFieldValueAccessor>(
    'KBQ_TEXT_FIELD_VALUE_ACCESSOR'
);

/** List of inputs that can be used to apply hostDirectives.  */
export const KBQ_TEXT_FIELD_INPUTS: Array<keyof KbqTextField> = [
    'errorStateMatcher',
    'placeholder',
    'name',
    'disabled',
    'required',
    'readonly',
    'id',
    'value'
];

let nextUniqueId = 0;

const KbqTextFieldErrorState = mixinErrorState(
    class {
        /**
         * Emits whenever the component state changes and should cause the parent `KbqFormField` to update.
         * Implemented as part of `KbqFormFieldControl`.
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
);

/** Directive that allows a native input/textarea element to work inside a `KbqFormField`. */
@Directive({
    standalone: true,
    host: {
        class: 'kbq-text-field',
        '[class.kbq-text-field_focused]': 'focused',

        '[attr.id]': 'id',
        '[attr.name]': 'name',
        '[attr.placeholder]': 'placeholder',
        '[disabled]': 'disabled',
        '[required]': 'required',
        '[readonly]': 'readonly',

        '(blur)': 'onBlur()',
        '(focus)': 'onFocus(true)',
        '(input)': 'onInput()'
    },
    providers: [{ provide: KbqFormFieldControl, useExisting: KbqTextField }]
})
export class KbqTextField
    extends KbqTextFieldErrorState
    implements KbqFormFieldControl<any>, CanUpdateErrorState, OnChanges, OnDestroy, DoCheck, OnChanges
{
    /** An object used to control when error messages are shown. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    get focused(): boolean {
        return this._focused;
    }

    private _focused: boolean = false;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    readonly stateChanges: Subject<void> = new Subject<void>();

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    readonly controlType: string = 'text-field';

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input() placeholder: string;

    /**
     * Name of the element.
     * @docs-private
     */
    @Input() name: string;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input({ transform: booleanAttribute })
    set disabled(value: boolean) {
        this._disabled = value;

        // Browsers may not fire the blur event if the input is disabled too quickly.
        // Reset from here to ensure that the element doesn't become stuck.
        if (this._focused) {
            this.onFocus(false);
        }
    }

    get disabled(): boolean {
        return this._disabled;
    }

    private _disabled = false;

    /** Unique id of the element. */
    private readonly uniqueID = `kbq-${this.controlType}-${nextUniqueId++}`;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input()
    set id(value: string) {
        this._id = value || this.uniqueID;
    }

    get id(): string {
        return this._id;
    }

    private _id: string = this.uniqueID;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input({ transform: booleanAttribute })
    set required(value: boolean) {
        this._required = value;
    }

    get required(): boolean {
        return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
    }

    private _required: boolean | undefined;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input()
    set value(value: string) {
        if (value !== this.value) {
            this.valueAccessor.value = value;
            this.stateChanges.next();
        }
    }

    get value(): string {
        return this.valueAccessor.value;
    }

    /** Whether the element is readonly. */
    @Input({ transform: booleanAttribute })
    set readonly(value: boolean) {
        this._readonly = value;
    }

    get readonly(): boolean {
        return this._readonly;
    }

    private _readonly: boolean = false;

    private previousNativeValue: any;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    get empty(): boolean {
        return !this.elementRef.nativeElement.value && !this.elementRef.nativeElement.validity?.badInput;
    }

    private readonly valueAccessor: KbqTextFieldValueAccessor;

    constructor(
        readonly elementRef: ElementRef<HTMLInputElement | HTMLTextAreaElement>,
        @Optional() @Self() readonly ngControl: NgControl,
        @Optional() readonly parentForm: NgForm,
        @Optional() readonly parentFormGroup: FormGroupDirective,
        readonly defaultErrorStateMatcher: ErrorStateMatcher,
        @Optional() @Self() @Inject(KBQ_TEXT_FIELD_VALUE_ACCESSOR) readonly _valueAccessor: KbqTextFieldValueAccessor
    ) {
        super(defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);

        // If no input value accessor was explicitly specified, use the element as the input value accessor.
        this.valueAccessor = _valueAccessor || this.elementRef.nativeElement;

        this.previousNativeValue = this.value;

        // Force setter to be called in case id was not specified.
        this.id = this.id;
    }

    ngOnChanges(): void {
        this.stateChanges.next();
    }

    ngOnDestroy(): void {
        this.stateChanges.complete();
    }

    ngDoCheck(): void {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some error triggers that
            // we can't subscribe to (e.g. parent form submissions). This means that whatever logic is in here has to be
            // super lean or we risk destroying the performance.
            this.updateErrorState();

            // Since the input isn't a `ControlValueAccessor`, we don't have a good way of knowing when  the disabled
            // state has changed. We can't use the `ngControl.statusChanges`, because it won't fire if the input is
            // disabled with `emitEvents = false`, despite the input becoming disabled.
            if (this.ngControl.disabled !== null && this.ngControl.disabled !== this.disabled) {
                this.disabled = this.ngControl.disabled;
                this.stateChanges.next();
            }
        }

        // We need to check the native element's value, because there are some cases where we won't be notified when it
        // changes (e.g. the consumer isn't using forms or they're updating the value using `emitEvent: false`).
        this.checkNativeValue();
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    focus(options?: FocusOptions): void {
        this.elementRef.nativeElement.focus(options);
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    onContainerClick(): void {
        if (!this._focused) {
            this.focus();
        }
    }

    /** Handles input events on the input. */
    protected onInput(): void {
        // This is a noop function and is used to let Angular know whenever the value changes. Angular will run a new
        // change detection each time the `input` event has been dispatched.
    }

    /** Handles focus events on the input. */
    protected onFocus(isFocused: boolean): void {
        if (this._focused !== isFocused) {
            this._focused = isFocused;
            this.stateChanges.next();
        }
    }

    /** Handles blur events on the input. */
    protected onBlur(): void {
        this.onFocus(false);
    }

    /** Check native input element value. */
    private checkNativeValue(): void {
        const newValue = this.value;

        if (this.previousNativeValue !== newValue) {
            this.previousNativeValue = newValue;
            this.stateChanges.next();
        }
    }
}
