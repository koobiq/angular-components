import { coerceBooleanProperty } from '@angular/cdk/coercion';
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
import { FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import { CanUpdateErrorState, ErrorStateMatcher } from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { Subject } from 'rxjs';
import { KBQ_INPUT_VALUE_ACCESSOR } from './input-value-accessor';

let nextUniqueId = 0;

@Directive({
    selector: `input[kbqInputPassword]`,
    exportAs: 'kbqInputPassword',
    host: {
        class: 'kbq-input kbq-input-password',
        // Native input properties that are overwritten by Angular inputs need to be synced with
        // the native input element. Otherwise property bindings for those don't work.
        '[attr.id]': 'id',
        '[attr.type]': 'elementType',
        '[attr.placeholder]': 'placeholder',
        '[attr.disabled]': 'disabled || null',
        '[required]': 'required',
        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)',
        '(input)': 'onInput()'
    },
    providers: [
        {
            provide: KbqFormFieldControl,
            useExisting: KbqInputPassword
        }
    ]
})
export class KbqInputPassword
    implements KbqFormFieldControl<any>, OnChanges, OnDestroy, DoCheck, OnChanges, CanUpdateErrorState
{
    /** Whether the component is in an error state. */
    errorState: boolean = false;

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
    readonly stateChanges = new Subject<any>();

    readonly checkRule = new Subject<void>();

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    controlType: string = 'input-password';

    elementType: string = 'password';

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input() placeholder: string;

    protected uid = `kbq-input-${nextUniqueId++}`;
    protected previousNativeValue: any;

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
            this.stateChanges.next(null);
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

    // this.elementRef.nativeElement.type = this._type;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input()
    get value(): string {
        return this._inputValueAccessor.value;
    }

    set value(value: string) {
        if (value === this.value) {
            return;
        }

        this._inputValueAccessor.value = value;
        this.stateChanges.next(null);
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    get empty(): boolean {
        return !this.elementRef.nativeElement.value && !this.isBadInput();
    }

    private _inputValueAccessor: { value: any };

    constructor(
        protected elementRef: ElementRef<HTMLInputElement>,
        @Optional() @Self() public ngControl: NgControl,
        @Optional() public parentForm: NgForm,
        @Optional() public parentFormGroup: FormGroupDirective,
        public defaultErrorStateMatcher: ErrorStateMatcher,
        @Optional() @Self() @Inject(KBQ_INPUT_VALUE_ACCESSOR) inputValueAccessor: any
    ) {
        // If no input value accessor was explicitly specified, use the element as the input value
        // accessor.
        this._inputValueAccessor = inputValueAccessor || this.elementRef.nativeElement;

        this.previousNativeValue = this.value;

        // Force setter to be called in case id was not specified.
        this.id = this.id;
    }

    ngOnChanges() {
        this.stateChanges.next(null);
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

    updateErrorState() {
        const oldState = this.errorState;
        const parent = this.parentFormGroup || this.parentForm;
        const matcher = this.errorStateMatcher || this.defaultErrorStateMatcher;
        const control = this.ngControl ? (this.ngControl.control as UntypedFormControl) : null;
        const newState = matcher.isErrorState(control, parent);

        if (newState !== oldState) {
            this.errorState = newState;
            this.stateChanges.next(null);
        }
    }

    checkRules() {
        this.checkRule.next();
    }

    toggleType() {
        this.elementType = this.elementType === 'password' ? 'text' : 'password';
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
        if (isFocused === this.focused) {
            return;
        }

        this.focused = isFocused;
        this.stateChanges.next({ focused: this.focused });
    }

    onInput() {
        // This is a noop function and is used to let Angular know whenever the value changes.
        // Angular will run a new change detection each time the `input` event has been dispatched.
        // It's necessary that Angular recognizes the value change, because when floatingLabel
        // is set to false and Angular forms aren't used, the placeholder won't recognize the
        // value changes and will not disappear.
        // Listening to the input event wouldn't be necessary when the input is using the
        // FormsModule or ReactiveFormsModule, because Angular forms also listens to input events.
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
        if (this.previousNativeValue !== this.value) {
            this.previousNativeValue = this.value;
            this.stateChanges.next(null);
        }
    }

    /** Checks whether the input is invalid based on the native validation. */
    protected isBadInput() {
        // The `validity` property won't be present on platform-server.
        return (this.elementRef.nativeElement as HTMLInputElement).validity?.badInput;
    }
}
