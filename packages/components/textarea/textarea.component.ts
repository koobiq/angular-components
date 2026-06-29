import { coerceBooleanProperty, coerceCssPixelValue } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import {
    booleanAttribute,
    Directive,
    DoCheck,
    ElementRef,
    inject,
    InjectionToken,
    Input,
    input,
    NgZone,
    numberAttribute,
    OnChanges,
    OnDestroy,
    OnInit,
    Renderer2
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import {
    CanUpdateErrorState,
    ErrorStateMatcher,
    KBQ_PARENT_ANIMATION_COMPONENT,
    KBQ_WINDOW
} from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { asapScheduler, observeOn, Subject } from 'rxjs';

export const KBQ_TEXTAREA_VALUE_ACCESSOR = new InjectionToken<{ value: any }>('KBQ_TEXTAREA_VALUE_ACCESSOR');

let nextUniqueId = 0;

@Directive({
    selector: 'textarea[kbqTextarea]',
    providers: [{ provide: KbqFormFieldControl, useExisting: KbqTextarea }],
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
        '(input)': 'dirtyCheckNativeValue()'
    },
    exportAs: 'kbqTextarea'
})
export class KbqTextarea
    implements KbqFormFieldControl<any>, OnInit, OnChanges, OnDestroy, DoCheck, CanUpdateErrorState
{
    protected elementRef = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);
    ngControl = inject(NgControl, { optional: true, self: true });
    parentForm = inject(NgForm, { optional: true });
    parentFormGroup = inject(FormGroupDirective, { optional: true });
    defaultErrorStateMatcher = inject(ErrorStateMatcher);
    private parent = inject(KBQ_PARENT_ANIMATION_COMPONENT, { optional: true, host: true });
    private ngZone = inject(NgZone);

    /** Whether the component is in an error state. */
    errorState: boolean = false;

    /** Parameter enables or disables the ability to automatically increase the height.
     * If set to false, the textarea becomes vertically resizable. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
    readonly maxRows = input<number>(undefined!);

    /** An object used to control when error messages are shown. */
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
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
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
    // TODO: Skipped for migration because:
    //  This input overrides a field from a superclass, while the superclass field
    //  is not migrated.
    @Input() placeholder: string;

    /** Distance from the last line to the bottom border */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ transform: numberAttribute }) freeRowsHeight: number;

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
        return this.rowsCount > this.maxRows();
    }

    protected uid = `kbq-textarea-${nextUniqueId++}`;
    protected previousNativeValue: any;
    private _disabled = false;
    private _id: string;
    private _required = false;

    private valueAccessor: { value: any };

    private lineHeight: number = 0;
    private minHeight: number = 0;
    private rowsCount: number;

    constructor() {
        const inputValueAccessor = inject(KBQ_TEXTAREA_VALUE_ACCESSOR, { optional: true, self: true });

        // If no input value accessor was explicitly specified, use the element as the textarea value
        // accessor.
        this.valueAccessor = inputValueAccessor || this.elementRef.nativeElement;

        this.previousNativeValue = this.value;

        // Force setter to be called in case id was not specified.
        this.id = this.id;

        // eslint-disable-next-line @angular-eslint/no-lifecycle-call
        this.parent?.animationDone.subscribe(() => this.ngOnInit());

        this.stateChanges.pipe(observeOn(asapScheduler), takeUntilDestroyed()).subscribe(() => this.grow());
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

            textarea.style.minHeight = coerceCssPixelValue(
                this.maxRowLimitReached ? this.maxRows() * this.lineHeight : height
            );
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
