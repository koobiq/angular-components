import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import {
    booleanAttribute,
    Directive,
    DoCheck,
    ElementRef,
    EventEmitter,
    Host,
    inject,
    Inject,
    InjectionToken,
    Input,
    NgZone,
    numberAttribute,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Renderer2,
    Self
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import {
    CanUpdateErrorState,
    ErrorStateMatcher,
    KBQ_PARENT_ANIMATION_COMPONENT,
    KBQ_WINDOW
} from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { Subject, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

export const KBQ_TEXTAREA_VALUE_ACCESSOR = new InjectionToken<{ value: any }>('KBQ_TEXTAREA_VALUE_ACCESSOR');

let nextUniqueId = 0;

@Directive({
    selector: 'textarea[kbqTextarea]',
    exportAs: 'kbqTextarea',
    host: {
        class: 'kbq-textarea kbq-scrollbar',
        '[class.kbq-textarea-resizable]': '!canGrow',
        '[class.kbq-textarea_max-row-limit-reached]': 'maxRowLimitReached',

        '[attr.id]': 'id',
        '[attr.placeholder]': 'placeholder',
        '[attr.aria-invalid]': 'errorState',
        '[disabled]': 'disabled',
        '[required]': 'required',

        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)',
        '(paste)': 'stateChanges.next()'
    },
    providers: [{ provide: KbqFormFieldControl, useExisting: KbqTextarea }]
})
export class KbqTextarea
    implements KbqFormFieldControl<any>, OnInit, OnChanges, OnDestroy, DoCheck, CanUpdateErrorState
{
    /** Whether the component is in an error state. */
    errorState: boolean = false;

    /** Parameter enables or disables the ability to automatically increase the height.
     * If set to false, the textarea becomes vertically resizable. */
    @Input({ transform: booleanAttribute })
    get canGrow(): boolean {
        return !this.maxRowLimitReached && this._canGrow;
    }

    set canGrow(value: boolean) {
        this._canGrow = value;
    }

    protected readonly isBrowser = inject(Platform).isBrowser;
    protected readonly renderer = inject(Renderer2);
    private readonly window = inject(KBQ_WINDOW);

    private _canGrow: boolean = true;

    /** Maximum number of lines to which the textarea will grow. Default unlimited */
    @Input() maxRows: number;

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
    controlType: string = 'textarea';

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

        if (this.focused) {
            this.focused = false;
            this.stateChanges.next();
        }
    }

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

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input() placeholder: string;

    /** Distance from the last line to the bottom border */
    @Input({ transform: numberAttribute }) freeRowsHeight: number;

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

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    @Input()
    get value(): string {
        return this.valueAccessor.value;
    }

    set value(value: string) {
        if (value !== this.value) {
            this.valueAccessor.value = value;
            this.stateChanges.next();
        }
    }

    /** Flag that will be set to true when the maximum number of lines is reached.
     * Maximum number of rows can be set using the maxRows input. */
    get maxRowLimitReached(): boolean {
        return this.rowsCount > this.maxRows;
    }

    protected uid = `kbq-textarea-${nextUniqueId++}`;
    protected previousNativeValue: any;
    private _disabled = false;
    private _id: string;
    private _required = false;

    private valueAccessor: { value: any };
    private growSubscription: Subscription;

    private lineHeight: number = 0;
    private minHeight: number = 0;
    private rowsCount: number;

    constructor(
        protected elementRef: ElementRef<HTMLTextAreaElement>,
        @Optional() @Self() public ngControl: NgControl,
        @Optional() public parentForm: NgForm,
        @Optional() public parentFormGroup: FormGroupDirective,
        public defaultErrorStateMatcher: ErrorStateMatcher,
        @Optional() @Self() @Inject(KBQ_TEXTAREA_VALUE_ACCESSOR) inputValueAccessor: any,
        @Optional() @Host() @Inject(KBQ_PARENT_ANIMATION_COMPONENT) private parent: any,
        private ngZone: NgZone
    ) {
        // If no input value accessor was explicitly specified, use the element as the textarea value
        // accessor.
        this.valueAccessor = inputValueAccessor || this.elementRef.nativeElement;

        this.previousNativeValue = this.value;

        // Force setter to be called in case id was not specified.
        this.id = this.id;

        // eslint-disable-next-line @angular-eslint/no-lifecycle-call
        this.parent?.animationDone.subscribe(() => this.ngOnInit());

        this.growSubscription = this.stateChanges.pipe(delay(0)).subscribe(this.grow);
    }

    ngOnInit() {
        if (!this.isBrowser) return;

        Promise.resolve().then(() => {
            this.lineHeight = parseInt(this.window.getComputedStyle(this.elementRef.nativeElement).lineHeight!, 10);

            const paddingTop = parseInt(this.window.getComputedStyle(this.elementRef.nativeElement).paddingTop!, 10);
            const paddingBottom = parseInt(
                this.window.getComputedStyle(this.elementRef.nativeElement).paddingBottom!,
                10
            );

            this.minHeight = this.lineHeight + paddingTop + paddingBottom;
            this.freeRowsHeight = this.freeRowsHeight ?? this.lineHeight;
        });

        setTimeout(this.grow, 0);
    }

    ngOnChanges() {
        this.stateChanges.next();
    }

    ngOnDestroy() {
        this.stateChanges.complete();
        this.growSubscription.unsubscribe();
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
            this.stateChanges.next();
        }
    }

    onBlur(): void {
        this.focusChanged(false);

        if (this.ngControl?.control) {
            const control = this.ngControl.control;

            control.updateValueAndValidity({ emitEvent: false });
            (control.statusChanges as EventEmitter<string>).emit(control.status);
        }
    }

    /** Grow textarea height to avoid vertical scroll  */
    grow = () => {
        if (!this.isBrowser || !this._canGrow) return;

        this.ngZone.runOutsideAngular(() => {
            const textarea = this.elementRef.nativeElement;

            const clone = textarea.cloneNode(false) as HTMLTextAreaElement;

            this.renderer.appendChild(this.renderer.parentNode(textarea), clone);

            const outerHeight = parseInt(this.window.getComputedStyle(textarea).height!, 10);
            const diff = outerHeight - +textarea.clientHeight;

            clone.style.minHeight = '0'; // this line is important to height recalculation

            const height = Math.max(this.minHeight, +clone.scrollHeight + diff + this.freeRowsHeight);

            clone.remove();

            this.rowsCount = Math.floor(height / this.lineHeight);

            if (!this.maxRowLimitReached) {
                textarea.style.minHeight = `${height}px`;
            } else if (!textarea.style.minHeight && this.lineHeight) {
                // need for first initialization when value above maxRows
                textarea.style.minHeight = `${this.maxRows * this.lineHeight}px`;
            }
        });
    };

    /** Focuses the textarea. */
    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    /** Callback for the cases where the focused state of the textarea changes. */
    focusChanged(isFocused: boolean) {
        if (isFocused !== this.focused) {
            this.focused = isFocused;
            this.stateChanges.next();
        }
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    get empty(): boolean {
        return !this.elementRef.nativeElement.value && !this.isBadInput();
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    onContainerClick() {
        this.focus();
    }

    /** Does some manual dirty checking on the native textarea `value` property. */
    protected dirtyCheckNativeValue() {
        const newValue = this.value;

        if (this.previousNativeValue !== newValue) {
            this.previousNativeValue = newValue;
            this.stateChanges.next();
        }
    }

    /** Checks whether the textarea is invalid based on the native validation. */
    protected isBadInput(): boolean {
        // The `validity` property won't be present on platform-server.
        const validity = (this.elementRef.nativeElement as HTMLTextAreaElement).validity;

        return validity && validity.badInput;
    }
}
