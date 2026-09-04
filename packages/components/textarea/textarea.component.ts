import { _IdGenerator } from '@angular/cdk/a11y';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import {
    booleanAttribute,
    computed,
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
    Renderer2,
    signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import {
    CanUpdateErrorState,
    ErrorStateMatcher,
    KBQ_PARENT_ANIMATION_COMPONENT,
    KBQ_WINDOW,
    kbqInjectAutofilled
} from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqNativeScrollbar } from '@koobiq/components/scrollbar';
import { asapScheduler, observeOn, Subject } from 'rxjs';

export const KBQ_TEXTAREA_VALUE_ACCESSOR = new InjectionToken<{ value: any }>('KBQ_TEXTAREA_VALUE_ACCESSOR');

/** Coerces an optional numeric input, keeping `undefined` distinguishable from `0`. */
const optionalNumberAttribute = (value: unknown): number | undefined =>
    value == null ? undefined : numberAttribute(value);

@Directive({
    selector: 'textarea[kbqTextarea]',
    providers: [{ provide: KbqFormFieldControl, useExisting: KbqTextarea }],
    host: {
        class: 'kbq-textarea',
        '[class.kbq-textarea-resizable]': '!growing()',
        '[class.kbq-textarea_max-row-limit-reached]': 'maxRowLimitReached()',
        '[attr.id]': 'id',
        '[attr.placeholder]': 'placeholder',
        '[attr.aria-invalid]': 'errorState',
        '[disabled]': 'disabled',
        '[required]': 'required',
        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)',
        '(input)': 'dirtyCheckNativeValue()'
    },
    hostDirectives: [KbqNativeScrollbar],
    exportAs: 'kbqTextarea'
})
export class KbqTextarea
    implements KbqFormFieldControl<any>, OnInit, OnChanges, OnDestroy, DoCheck, CanUpdateErrorState
{
    protected elementRef = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);
    readonly ngControl = inject(NgControl, { optional: true, self: true });
    readonly parentForm = inject(NgForm, { optional: true });
    readonly parentFormGroup = inject(FormGroupDirective, { optional: true });
    readonly defaultErrorStateMatcher = inject(ErrorStateMatcher);
    private readonly parent = inject(KBQ_PARENT_ANIMATION_COMPONENT, { optional: true, host: true });
    private readonly ngZone = inject(NgZone);

    /** Whether the component is in an error state. */
    errorState: boolean = false;

    /**
     * Parameter enables or disables the ability to automatically increase the height.
     * If set to false, the textarea becomes vertically resizable.
     */
    readonly canGrow = input(true, { transform: booleanAttribute });

    protected readonly isBrowser = inject(Platform).isBrowser;
    protected readonly renderer = inject(Renderer2);
    private readonly window = inject(KBQ_WINDOW);

    /** Maximum number of lines to which the textarea will grow. Unlimited when unset. */
    readonly maxRows = input<number | undefined, unknown>(undefined, { transform: optionalNumberAttribute });

    /** An object used to control when error messages are shown. */
    // Stays a plain member: `KbqFormFieldControl` declares it as one, and the form field reads it
    // through that interface.
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
    readonly autofilled = kbqInjectAutofilled();

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
    // Stays an accessor: `KbqFormFieldControl` declares `disabled` as a plain member, and the getter
    // has to defer to the bound `NgControl` when there is one.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        if (this.ngControl && this.ngControl.disabled !== null) {
            return this.ngControl.disabled;
        }

        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;

        if (this.focused) {
            this.focused = false;
            this.stateChanges.next();
        }
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    // Stays an accessor: `KbqFormFieldControl` declares `id` as a plain member.
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
    // Stays a plain member: `KbqFormFieldControl` declares it as one, and the form field reads it
    // through that interface.
    @Input() placeholder: string;

    /** Distance from the last line to the bottom border. Defaults to a single line height. */
    readonly freeRowsHeight = input<number | undefined, unknown>(undefined, { transform: optionalNumberAttribute });

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    // Stays an accessor: `KbqFormFieldControl` declares `required` as a plain member.
    @Input({ transform: booleanAttribute })
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = value;
    }

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    // Stays an accessor: `KbqFormFieldControl` declares `value` as a plain member, and it reads and
    // writes the native element rather than storing anything.
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

    /**
     * Flag that will be set to true when the maximum number of lines is reached.
     * Maximum number of rows can be set using the maxRows input.
     */
    readonly maxRowLimitReached = computed(() => {
        const maxRows = this.maxRows();

        return maxRows !== undefined && this.rowsCount() > maxRows;
    });

    /**
     * Whether the textarea still grows with its content. It stops once `maxRows` is reached, which is
     * when the native resize handle takes over.
     *
     * @docs-private
     */
    protected readonly growing = computed(() => !this.maxRowLimitReached() && this.canGrow());

    /** Distance from the last line to the bottom border, falling back to the measured line height. */
    private readonly resolvedFreeRowsHeight = computed(() => this.freeRowsHeight() ?? this.lineHeight());

    protected readonly uid = inject(_IdGenerator).getId('kbq-textarea-');
    protected previousNativeValue: any;
    private _disabled = false;
    private _id: string = this.uid;
    private _required = false;

    private valueAccessor: { value: any };

    /** Measured once the textarea has been rendered; the growth arithmetic is in terms of these. */
    private readonly lineHeight = signal(0);
    private readonly minHeight = signal(0);
    private readonly rowsCount = signal(0);

    constructor() {
        const inputValueAccessor = inject(KBQ_TEXTAREA_VALUE_ACCESSOR, { optional: true, self: true });

        // If no input value accessor was explicitly specified, use the element as the textarea value
        // accessor.
        this.valueAccessor = inputValueAccessor || this.elementRef.nativeElement;

        this.previousNativeValue = this.value;

        // eslint-disable-next-line @angular-eslint/no-lifecycle-call
        this.parent?.animationDone.pipe(takeUntilDestroyed()).subscribe(() => this.ngOnInit());

        this.stateChanges.pipe(observeOn(asapScheduler), takeUntilDestroyed()).subscribe(() => this.grow());
    }

    ngOnInit() {
        if (!this.isBrowser) return;

        Promise.resolve().then(() => {
            const styles = this.window.getComputedStyle(this.elementRef.nativeElement);
            const lineHeight = parseInt(styles.lineHeight!, 10);

            this.lineHeight.set(lineHeight);
            this.minHeight.set(lineHeight + parseInt(styles.paddingTop!, 10) + parseInt(styles.paddingBottom!, 10));
        });

        setTimeout(() => this.grow(), 0);
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

    /** @docs-private */
    onBlur(): void {
        this.focusChanged(false);
    }

    /**
     * Grow textarea height to avoid vertical scroll.
     *
     * @docs-private
     */
    grow(): void {
        if (!this.isBrowser || !this.canGrow()) return;

        this.ngZone.runOutsideAngular(() => {
            const textarea = this.elementRef.nativeElement;

            const clone = textarea.cloneNode(false) as HTMLTextAreaElement;

            this.renderer.appendChild(this.renderer.parentNode(textarea), clone);

            const outerHeight = parseInt(this.window.getComputedStyle(textarea).height!, 10);
            const diff = outerHeight - +textarea.clientHeight;

            clone.style.minHeight = '0'; // this line is important to height recalculation

            const lineHeight = this.lineHeight();
            const height = Math.max(this.minHeight(), +clone.scrollHeight + diff + this.resolvedFreeRowsHeight());

            clone.remove();

            this.rowsCount.set(lineHeight > 0 ? Math.floor(height / lineHeight) : 0);

            const maxRows = this.maxRows();

            textarea.style.minHeight = coerceCssPixelValue(
                this.maxRowLimitReached() && maxRows !== undefined ? maxRows * lineHeight : height
            );
        });
    }

    /** Focuses the textarea. */
    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    /**
     * Callback for the cases where the focused state of the textarea changes.
     *
     * @docs-private
     */
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
