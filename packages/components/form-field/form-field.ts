import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentChecked,
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChild,
    contentChildren,
    DestroyRef,
    Directive,
    ElementRef,
    HostAttributeToken,
    inject,
    InjectionToken,
    input,
    model,
    OnDestroy,
    Provider,
    Signal,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import {     KBQ_CONNECTED_OVERLAY_ORIGIN,
    KBQ_FORM_FIELD_REF,
    KbqColorDirective } from '@koobiq/components/core';
import { EMPTY, merge } from 'rxjs';
import { delay, startWith } from 'rxjs/operators';
import { KbqCleaner } from './cleaner';
import { KbqError } from './error';
import { KbqFormFieldControl, kbqSetDescribedByIds } from './form-field-control';
import { KbqHint } from './hint';
import { KbqLabel } from './label';
import { hasPasswordStrengthError, KbqPasswordHint } from './password-hint';
import { KbqPasswordToggle } from './password-toggle';
import { KbqPrefix } from './prefix';
import { KbqReactivePasswordHint } from './reactive-password-hint';
import { KbqNumberInputControl, KbqStepper } from './stepper';
import { KbqSuffix } from './suffix';

/** @docs-private */
export function getKbqFormFieldMissingControlError(): Error {
    return Error('kbq-form-field must contain a KbqFormFieldControl');
}

/** @docs-private */
export function getKbqFormFieldYouCanNotUseCleanerInNumberInputError(): Error {
    return Error(`You can't use kbq-cleaner with input that have type="number"`);
}

/** Error key set on the control by the legacy `KbqPasswordHint` when the password is not strong enough. */
const PASSWORD_STRENGTH_ERROR = 'passwordStrength';

/**
 * Default options for the kbq-form-field that can be configured using the `KBQ_FORM_FIELD_DEFAULT_OPTIONS`
 * injection token.
 */
export type KbqFormFieldDefaultOptions = Partial<{
    /** Disables form field borders and shadows. */
    noBorders: boolean;
    /** Use when KbqFormField is in an overlay container. */
    inOverlay: boolean;
    /** Whether the form field is displayed horizontally. */
    horizontal: boolean;
    /** Additional CSS classes applied to the label element. */
    labelClass: string | string[] | Set<string>;
    /** Additional CSS classes applied to the content wrapper element. */
    contentClass: string | string[] | Set<string>;
}>;

/**
 * Injection token that can be used to configure the default options for all kbq-form-field's.
 */
export const KBQ_FORM_FIELD_DEFAULT_OPTIONS = new InjectionToken<KbqFormFieldDefaultOptions>(
    'KBQ_FORM_FIELD_DEFAULT_OPTIONS'
);

/** Utility provider for `KBQ_FORM_FIELD_DEFAULT_OPTIONS`. */
export const kbqFormFieldDefaultOptionsProvider = (options: KbqFormFieldDefaultOptions): Provider => ({
    provide: KBQ_FORM_FIELD_DEFAULT_OPTIONS,
    useValue: options
});

/** Container for form controls that applies styling and behavior. */
@Component({
    selector: 'kbq-form-field',
    imports: [],
    templateUrl: 'form-field.html',
    styleUrls: [
        'form-field.scss',
        'form-field-tokens.scss',
        // The controls below are directives, and directives can't declare styles. The form field is the only
        // component they are always rendered inside of, so it carries their styles on their behalf.
        // Keep every entry paired with the control that owns it; removing one silently unstyles that control.
        // KbqInput
        '../input/input.scss',
        '../input/input-tokens.scss',
        // KbqTimepicker
        '../timepicker/timepicker.scss',
        // KbqDatepickerInput
        '../datepicker/datepicker-input.scss',
        // KbqTextarea
        '../textarea/textarea.scss',
        // KbqTagInput
        '../tags/tag-input-tokens.scss'
    ],
    providers: [{ provide: KBQ_FORM_FIELD_REF, useExisting: KbqFormField }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    // Every component of this package renders unencapsulated, on purpose: the `kbq-form-field__*` and
    // `kbq-hint*` classes are a public contract that themes, the controls projected into the field and
    // consumer stylesheets all target. Renaming or nesting them is a breaking change.
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-form-field',

        '[class.kbq-form-field_invalid]': 'invalid',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-form-field_no-borders]': 'noBorders()',
        '[class.kbq-form-field_in-overlay]': 'inOverlay()',
        '[class.kbq-form-field_horizontal]': 'horizontal()',

        '[class.ng-untouched]': 'shouldForward("untouched")',
        '[class.ng-touched]': 'shouldForward("touched")',
        '[class.ng-pristine]': 'shouldForward("pristine")',
        '[class.ng-dirty]': 'shouldForward("dirty")',
        '[class.ng-valid]': 'shouldForward("valid")',
        '[class.ng-invalid]': 'shouldForward("invalid")',
        '[class.ng-pending]': 'shouldForward("pending")',

        '(keydown)': 'onKeyDown($event)',
        '(mouseenter)': 'onHoverChanged(true)',
        '(mouseleave)': 'onHoverChanged(false)'
    },
    exportAs: 'kbqFormField'
})
export class KbqFormField
    extends KbqColorDirective
    implements AfterContentInit, AfterViewInit, OnDestroy, AfterContentChecked
{
    private readonly destroyRef = inject(DestroyRef);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly defaultOptions = inject(KBQ_FORM_FIELD_DEFAULT_OPTIONS, { optional: true });
    private readonly customOverlayOrigin = inject(KBQ_CONNECTED_OVERLAY_ORIGIN, { optional: true });
    /**
     * @docs-private
     */
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /** Disables form field borders and shadows. */
    readonly noBorders = input(this.defaultOptions?.noBorders, { transform: booleanAttribute });

    /** Use when KbqFormField is in an overlay container. */
    readonly inOverlay = model(this.defaultOptions?.inOverlay);

    /** Whether the form field is displayed horizontally. */
    readonly horizontal = input(this.defaultOptions?.horizontal, { transform: booleanAttribute });

    /** Additional CSS classes applied to the label element. */
    readonly labelClass = input(this.defaultOptions?.labelClass);

    /** Additional CSS classes applied to the content wrapper element. */
    readonly contentClass = input(this.defaultOptions?.contentClass);

    /**
     * The form field control.
     *
     * @docs-private
     */
    readonly control = contentChild.required(KbqFormFieldControl);
    /**
     * @docs-private
     */
    readonly stepper = contentChild(KbqStepper);
    /**
     * @docs-private
     */
    readonly cleaner = contentChild(KbqCleaner, { descendants: false });
    /**
     * @docs-private
     */
    readonly passwordToggle = contentChild(KbqPasswordToggle);
    /**
     * @docs-private
     */
    readonly hint = contentChildren(KbqHint);
    /**
     * @docs-private
     */
    readonly passwordHints = contentChildren(KbqPasswordHint);
    /**
     * @docs-private
     */
    readonly suffix = contentChildren(KbqSuffix);
    /**
     * @docs-private
     */
    readonly prefix = contentChildren(KbqPrefix);
    /**
     * @docs-private
     */
    readonly connectionContainerRef = viewChild.required<ElementRef>('connectionContainer');

    /** Host element of the control, used as the `aria-describedby` target. */
    private readonly controlElementRef: Signal<ElementRef<HTMLElement>> = contentChild.required(KbqFormFieldControl, {
        read: ElementRef
    });

    private readonly reactivePasswordHint = contentChildren(KbqReactivePasswordHint);
    private readonly error = contentChildren(KbqError);
    private readonly label = contentChild(KbqLabel);

    /**
     * @docs-private
     */
    hovered: boolean = false;

    /**
     * @docs-private
     */
    canCleanerClearByEsc: boolean = true;

    /** Whether the form field is invalid. */
    get invalid(): boolean {
        return !!this.control()?.errorState;
    }

    /**
     * Whether the form field control has an reactive password hint.
     *
     * @docs-private
     */
    protected readonly hasReactivePasswordHint = computed(() => this.reactivePasswordHint().length > 0);

    /**
     * Whether the form-field contains kbq-error.
     *
     * @docs-private
     */
    protected readonly hasError = computed(() => this.error().length > 0);

    /**
     * Whether the form-field contains kbq-label.
     *
     * @docs-private
     */
    protected readonly hasLabel = computed(() => !!this.label());

    /**
     * Whether the form-field contains kbq-password-hint.
     *
     * @docs-private
     */
    readonly hasPasswordHint = computed(() => this.passwordHints().length > 0);

    /**
     * Whether the form-field contains kbq-hint.
     *
     * @docs-private
     */
    readonly hasHint = computed(() => this.hint().length > 0);

    /**
     * Whether the form-field contains kbqSuffix.
     *
     * @docs-private
     */
    readonly hasSuffix = computed(() => this.suffix().length > 0);

    /**
     * Whether the form-field contains kbqPrefix.
     *
     * @docs-private
     */
    readonly hasPrefix = computed(() => this.prefix().length > 0);

    /**
     * Whether the form-field contains kbq-cleaner.
     *
     * @docs-private
     */
    readonly hasCleaner = computed(() => !!this.cleaner());

    /**
     * Whether the form-field contains kbq-stepper.
     *
     * @docs-private
     */
    readonly hasStepper = computed(() => !!this.stepper());

    /**
     * Whether the form-field contains kbq-password-toggle.
     *
     * @docs-private
     */
    readonly hasPasswordToggle = computed(() => !!this.passwordToggle());

    /**
     * Current focus origin state.
     *
     * @docs-private
     */
    get focusOrigin(): FocusOrigin {
        return this._focusOrigin;
    }

    private _focusOrigin: FocusOrigin;

    /**
     * @docs-private
     */
    get hasFocus(): boolean {
        return !!this.control()?.focused;
    }

    /**
     * Whether the cleaner can be displayed: it requires a projected `kbq-cleaner`, an enabled control
     * and a value that is not empty.
     *
     * @docs-private
     */
    get canShowCleaner(): boolean {
        const ngControl = this.control()?.ngControl;

        if (!this.hasCleaner() || !ngControl) {
            return false;
        }

        const { value } = ngControl;

        return value !== null && value !== undefined && value !== '' && !this.disabled;
    }

    /** Whether the form field is disabled. */
    get disabled(): boolean {
        return !!this.control()?.disabled;
    }

    /** Ids last written to the control's `aria-describedby`, to skip redundant DOM writes. */
    private appliedDescribedByIds: string = '';

    ngAfterContentInit(): void {
        this.validateControlChild();

        if (this.numberInput() && this.hasCleaner()) {
            throw getKbqFormFieldYouCanNotUseCleanerInNumberInputError();
        }

        // Subscribe to changes in the child control state in order to update the form field UI.
        this.control()
            .stateChanges.pipe(startWith(), delay(0), takeUntilDestroyed(this.destroyRef))
            .subscribe((state) => {
                const focused = (state as { focused?: boolean } | undefined)?.focused;

                if (this.passwordHints().length && !focused && hasPasswordStrengthError(this.passwordHints())) {
                    this.setPasswordStrengthError();
                }
            });

        if (this.hasStepper()) {
            this.stepper()!.connectTo(this.numberInput()!);
        }

        this.initializeControl();
    }

    ngAfterContentChecked(): void {
        this.validateControlChild();
        this.updateDescribedByIds();
    }

    ngAfterViewInit(): void {
        this.runFocusMonitor();

        this.changeDetectorRef.markForCheck();
    }

    ngOnDestroy(): void {
        this.stopFocusMonitor();
    }

    /** Focuses the control. */
    focus(options?: FocusOptions): void {
        this.control().focus(options);
    }

    /**
     * @docs-private
     */
    clearValue(event: Event): void {
        event.stopPropagation();

        // Keyboard activation of the cleaner must not also scroll the page (Space) or submit the form (Enter).
        if (event.type === 'keydown') {
            event.preventDefault();
        }

        const control = this.control();

        control?.ngControl?.reset();
        control?.focus();
    }

    /**
     * Handles a click on the control's container.
     *
     * @docs-private
     */
    onContainerClick(event: MouseEvent): void {
        const control = this.control();

        if (control?.onContainerClick) {
            control.onContainerClick(event);
        }
    }

    /**
     * Handles keydown events.
     *
     * @docs-private
     */
    onKeyDown(event: KeyboardEvent): void {
        const control = this.control();

        if (control.controlType === 'input-password' && event.altKey && event.key === 'F8') {
            (control as unknown as { toggleType(): void }).toggleType();
        }

        if (this.canCleanerClearByEsc && event.key === 'Escape' && control.focused && this.hasCleaner()) {
            control?.ngControl?.reset();

            event.preventDefault();
        }
    }

    /**
     * @docs-private
     */
    onHoverChanged(isHovered: boolean): void {
        if (isHovered !== this.hovered) {
            this.hovered = isHovered;
            this.changeDetectorRef.markForCheck();
        }
    }

    /**
     * Gets an ElementRef for the element that a overlay attached to the form-field should be positioned relative to.
     */
    getConnectedOverlayOrigin(): ElementRef {
        return (
            this.customOverlayOrigin?.getConnectedOverlayOrigin() ?? this.connectionContainerRef() ?? this.elementRef
        );
    }

    /**
     * Determines whether a class from the NgControl should be forwarded to the host element.
     *
     * @docs-private
     */
    shouldForward(prop: keyof NgControl): boolean {
        return !!this.control()?.ngControl?.[prop];
    }

    /**
     * Runs the focus monitor for the form field.
     *
     * @docs-private
     */
    runFocusMonitor = () => {
        this.focusMonitor
            .monitor(this.elementRef.nativeElement, true)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((origin) => (this._focusOrigin = origin));
    };

    /**
     * Stops the focus monitor for the form field.
     *
     * @docs-private
     */
    stopFocusMonitor(): void {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    /**
     * Throws an error if the form-field control is missing.
     *
     * @docs-private
     */
    protected validateControlChild() {
        let control: KbqFormFieldControl<unknown> | undefined;

        try {
            control = this.control();
        } catch {
            throw getKbqFormFieldMissingControlError();
        }

        if (!control) {
            throw getKbqFormFieldMissingControlError();
        }
    }

    /** Resolves the number input hosted by the control, `null` when the control is not a `kbqNumberInput`. */
    private numberInput(): KbqNumberInputControl | null {
        return (this.control() as unknown as { numberInput?: KbqNumberInputControl }).numberInput || null;
    }

    /**
     * Links the hints and the error rendered by the form field to the control via `aria-describedby`,
     * so assistive technology announces them when the control gets focused.
     */
    private updateDescribedByIds(): void {
        const ids = [
            // The error is rendered only while the control is invalid, and `aria-describedby` must not
            // reference elements that are not in the DOM.
            ...(this.invalid ? this.error() : []),
            ...this.hint(),
            ...this.passwordHints(),
            ...this.reactivePasswordHint()
        ].map((hint) => hint.id());
        const joinedIds = ids.join(' ');

        if (joinedIds === this.appliedDescribedByIds) {
            return;
        }

        this.appliedDescribedByIds = joinedIds;

        const control = this.control();

        if (control.setDescribedByIds) {
            control.setDescribedByIds(ids);
        } else {
            kbqSetDescribedByIds(this.controlElementRef().nativeElement, ids);
        }
    }

    /**
     * Adds the password strength error to the control, keeping the errors set by the other validators:
     * `setErrors` replaces the whole errors object.
     */
    private setPasswordStrengthError(): void {
        const control = this.control().ngControl?.control;

        control?.setErrors({ ...control.errors, [PASSWORD_STRENGTH_ERROR]: true });
    }

    /** Initializes the form field control. */
    private initializeControl(): void {
        const control = this.control();

        if (control.controlType) {
            this.elementRef.nativeElement.classList.add(`kbq-form-field-type-${control.controlType}`);
        }

        merge(control.stateChanges, control.ngControl?.valueChanges || EMPTY)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.changeDetectorRef.markForCheck());
    }
}

/**
 * Trims the value of `kbqInput` and `kbqTextarea` before it reaches the model.
 *
 * The value displayed in the control is left untouched, so trimming never fights the user while they
 * are typing. Add the `no-trim` attribute to the control to keep the value as is. `kbqInputPassword`
 * is not matched by this directive, so passwords keep their leading and trailing whitespace.
 *
 * @docs-private
 */
@Directive({
    selector: '[kbqInput], [kbqTextarea]',
    host: { class: 'kbq-trim' },
    exportAs: 'KbqTrim'
})
export class KbqTrim {
    private readonly noTrim = coerceBooleanProperty(inject(new HostAttributeToken('no-trim'), { optional: true }));
    private ngControl = inject(NgControl, { optional: true, self: true })!;

    private original: (fn: (value: unknown) => void) => void;

    constructor() {
        if (this.noTrim || !this.ngControl?.valueAccessor) {
            return;
        }

        this.original = this.ngControl.valueAccessor.registerOnChange;

        this.ngControl.valueAccessor.registerOnChange = this.registerOnChange;
    }

    /**
     * Trims the value when it is a string, other values are passed through as is.
     *
     * @docs-private
     */
    trim(value: unknown): unknown {
        if (this.noTrim) {
            return value;
        }

        return typeof value === 'string' ? value.trim() : value;
    }

    private registerOnChange = (fn: (value: unknown) => void) => {
        return this.original.call(this.ngControl.valueAccessor, (value: unknown) => fn(this.trim(value)));
    };
}
