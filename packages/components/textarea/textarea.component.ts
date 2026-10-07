import { _IdGenerator } from '@angular/cdk/a11y';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import {
    booleanAttribute,
    computed,
    Directive,
    DoCheck,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    input,
    linkedSignal,
    NgZone,
    OnInit,
    Renderer2,
    signal,
    untracked,
    WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import {
    CanUpdateErrorState,
    ErrorStateMatcher,
    KBQ_PARENT_ANIMATION_COMPONENT,
    KBQ_WINDOW,
    kbqInjectAutofilled,
    kbqOptionalNumberAttribute
} from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqNativeScrollbar } from '@koobiq/components/scrollbar';
import { asapScheduler } from 'rxjs';

export const KBQ_TEXTAREA_VALUE_ACCESSOR = new InjectionToken<{ value: any }>('KBQ_TEXTAREA_VALUE_ACCESSOR');

@Directive({
    selector: 'textarea[kbqTextarea]',
    providers: [{ provide: KbqFormFieldControl, useExisting: KbqTextarea }],
    host: {
        class: 'kbq-textarea',
        '[class.kbq-textarea-resizable]': '!growing()',
        '[class.kbq-textarea_max-row-limit-reached]': 'maxRowLimitReached()',
        '[attr.id]': 'id()',
        '[attr.placeholder]': 'placeholder()',
        '[attr.aria-invalid]': 'errorState()',
        '[disabled]': 'disabled()',
        '[required]': 'required()',
        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)',
        '(input)': 'dirtyCheckNativeValue()'
    },
    hostDirectives: [KbqNativeScrollbar],
    exportAs: 'kbqTextarea'
})
export class KbqTextarea implements KbqFormFieldControl<any>, OnInit, DoCheck, CanUpdateErrorState {
    protected elementRef = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);
    readonly ngControl = inject(NgControl, { optional: true, self: true });
    readonly parentForm = inject(NgForm, { optional: true });
    readonly parentFormGroup = inject(FormGroupDirective, { optional: true });
    readonly defaultErrorStateMatcher = inject(ErrorStateMatcher);
    private readonly parent = inject(KBQ_PARENT_ANIMATION_COMPONENT, { optional: true, host: true });
    private readonly ngZone = inject(NgZone);

    private readonly errorStateValue = signal(false);

    /** Whether the component is in an error state. */
    readonly errorState = this.errorStateValue.asReadonly();

    /**
     * Parameter enables or disables the ability to automatically increase the height.
     * If set to false, the textarea becomes vertically resizable.
     */
    readonly canGrow = input(true, { transform: booleanAttribute });

    protected readonly isBrowser = inject(Platform).isBrowser;
    protected readonly renderer = inject(Renderer2);
    private readonly window = inject(KBQ_WINDOW);

    /** Maximum number of lines to which the textarea will grow. Unlimited when unset. */
    readonly maxRows = input<number | undefined, unknown>(undefined, { transform: kbqOptionalNumberAttribute });

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

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    controlType: string = 'textarea';

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

    /** @docs-private */
    readonly placeholderInput = input<string | undefined>(undefined, { alias: 'placeholder' });

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    readonly placeholder = linkedSignal(() => this.placeholderInput());

    /** Distance from the last line to the bottom border. Defaults to a single line height. */
    readonly freeRowsHeight = input<number | undefined, unknown>(undefined, { transform: kbqOptionalNumberAttribute });

    /**
     * Implemented as part of KbqFormFieldControl.
     * @docs-private
     */
    readonly required = input<boolean, boolean | string | null | undefined>(false, { transform: booleanAttribute });

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

    /**
     * Flag that will be set to true when the maximum number of lines is reached.
     * Maximum number of rows can be set using the maxRows input.
     */
    readonly maxRowLimitReached = computed(() => {
        const maxRows = this.maxRows();

        return maxRows !== undefined && this.rowsCount() > maxRows;
    });

    /**
     * Whether the textarea still grows with its content. It stops once `maxRows` is reached, and from
     * there the element keeps its own scrollbar: `kbq-textarea_max-row-limit-reached` sets
     * `resize: unset`, which follows `kbq-textarea-resizable` in the stylesheet and wins on source
     * order, so no native handle appears.
     *
     * @docs-private
     */
    protected readonly growing = computed(() => !this.maxRowLimitReached() && this.canGrow());

    /** Distance from the last line to the bottom border, falling back to the measured line height. */
    private readonly resolvedFreeRowsHeight = computed(() => this.freeRowsHeight() ?? this.lineHeight());

    protected readonly uid = inject(_IdGenerator).getId('kbq-textarea-');

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

        this.value = signal(this.valueAccessor.value);
        this.syncedValue = this.valueAccessor.value;

        // eslint-disable-next-line @angular-eslint/no-lifecycle-call
        this.parent?.animationDone.pipe(takeUntilDestroyed()).subscribe(() => this.ngOnInit());

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
                if (this.valueAccessor.value !== value) {
                    this.valueAccessor.value = value;
                }

                this.syncedValue = value;
                this.emptyValue.set(this.isEmpty());
            });
        });

        // The height follows the content and the inputs that size it, measured once the change is rendered.
        effect(() => {
            this.value();
            this.canGrow();
            this.maxRows();
            this.freeRowsHeight();

            untracked(() => asapScheduler.schedule(() => this.grow()));
        });

        // Browsers may not fire the blur event if the textarea is disabled too quickly.
        // Reset from here to ensure that the element doesn't become stuck.
        effect(() => {
            if (this.disabled()) {
                untracked(() => this.focusedValue.set(false));
            }
        });
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

    /** @docs-private */
    onBlur(): void {
        this.focusChanged(false);
    }

    /**
     * Grow textarea height to avoid vertical scroll.
     *
     * @docs-private
     */
    protected grow(): void {
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
                maxRows !== undefined && this.maxRowLimitReached() ? maxRows * lineHeight : height
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
     * element directly, or by the user typing into a textarea that no form listens to.
     * @docs-private
     */
    dirtyCheckNativeValue() {
        const nativeValue = this.valueAccessor.value;

        // Only a change of the element itself: a value set in code and not yet written must not be overwritten.
        if (nativeValue !== this.syncedValue) {
            this.syncedValue = nativeValue;
            this.value.set(nativeValue);
        }

        this.emptyValue.set(this.isEmpty());
    }

    /** Checks whether the textarea is invalid based on the native validation. */
    protected isBadInput(): boolean {
        // The `validity` property won't be present on platform-server.
        const validity = (this.elementRef.nativeElement as HTMLTextAreaElement).validity;

        return validity && validity.badInput;
    }

    private isEmpty(): boolean {
        return !this.elementRef.nativeElement.value && !this.isBadInput();
    }
}
