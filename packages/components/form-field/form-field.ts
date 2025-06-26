import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    AfterViewInit,
    Attribute,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChild,
    ContentChild,
    contentChildren,
    ContentChildren,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    InjectionToken,
    Input,
    OnDestroy,
    Optional,
    Provider,
    QueryList,
    Self,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import { ESCAPE, F8 } from '@koobiq/cdk/keycodes';
import { KBQ_FORM_FIELD_REF, KbqColorDirective } from '@koobiq/components/core';
import { merge } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { KbqCleaner } from './cleaner';
import { KbqError } from './error';
import { KbqFormFieldControl } from './form-field-control';
import { KbqHint } from './hint';
import { KbqLabel } from './label';
import { hasPasswordStrengthError, KbqPasswordHint } from './password-hint';
import { KbqPasswordToggle } from './password-toggle';
import { KbqPrefix } from './prefix';
import { KbqReactivePasswordHint } from './reactive-password-hint';
import { KbqStepper } from './stepper';
import { KbqSuffix } from './suffix';

/** @docs-private */
export const getKbqFormFieldMissingControlError = (): Error => {
    return Error('kbq-form-field must contain a KbqFormFieldControl');
};

const getKbqFormFieldYouCanNotUseCleanerInNumberInputError = (): Error => {
    return Error(`You can't use kbq-cleaner with input that have type="number"`);
};

/**
 * Default options for the kbq-form-field that can be configured using the `KBQ_FORM_FIELD_DEFAULT_OPTIONS`
 * injection token.
 */
export type KbqFormFieldDefaultOptions = Partial<{
    /** Disables form field borders and shadows. */
    noBorders: boolean;
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

@Component({
    standalone: true,
    selector: 'kbq-form-field',
    exportAs: 'kbqFormField',
    templateUrl: 'form-field.html',
    styleUrls: [
        'form-field.scss',
        'form-field-tokens.scss',
        // KbqInput is a directive and can't have styles, so we need to include its styles here.
        // The KbqInput styles are fairly minimal so it shouldn't be a big deal for people who aren't using KbqInput.
        '../input/input.scss',
        '../input/input-tokens.scss',
        '../timepicker/timepicker.scss',
        '../datepicker/datepicker-input.scss',
        '../textarea/textarea.scss',
        '../tags/tag-input-tokens.scss'
    ],
    host: {
        class: 'kbq-form-field',
        '[class.kbq-form-field_invalid]': 'invalid',
        '[class.kbq-form-field_disabled]': 'disabled',
        '[class.kbq-form-field_no-borders]': 'noBorders',

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
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: KBQ_FORM_FIELD_REF, useExisting: KbqFormField }]
})
export class KbqFormField extends KbqColorDirective implements AfterContentInit, AfterViewInit, OnDestroy {
    private readonly destroyRef = inject(DestroyRef);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly defaultOptions = inject(KBQ_FORM_FIELD_DEFAULT_OPTIONS, { optional: true });
    /**
     * @docs-private
     */
    readonly elementRef = inject(ElementRef);

    /** Disables form field borders and shadows. */
    @Input({ transform: booleanAttribute }) noBorders: boolean | undefined = this.defaultOptions?.noBorders;
    /**
     * @docs-private
     */
    @ContentChild(KbqStepper) readonly stepper: KbqStepper;
    /**
     * @docs-private
     *
     * @TODO Should be readonly (#DS-3883)
     */
    @ContentChild(KbqCleaner) cleaner: KbqCleaner | null;
    /**
     * @docs-private
     */
    @ContentChild(KbqPasswordToggle) readonly passwordToggle: KbqPasswordToggle | null;
    /**
     * @docs-private
     */
    @ContentChildren(KbqHint) readonly hint: QueryList<KbqHint>;
    /**
     * @docs-private
     */
    @ContentChildren(KbqPasswordHint) readonly passwordHints: QueryList<KbqPasswordHint>;
    /**
     * @docs-private
     */
    @ContentChildren(KbqSuffix) readonly suffix: QueryList<KbqSuffix>;
    /**
     * @docs-private
     */
    @ContentChildren(KbqPrefix) readonly prefix: QueryList<KbqPrefix>;
    /**
     * @docs-private
     */
    @ViewChild('connectionContainer', { static: true }) readonly connectionContainerRef: ElementRef;

    @ContentChild(KbqFormFieldControl) private readonly _control: KbqFormFieldControl<unknown>;

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

    /** The form field control. */
    get control(): KbqFormFieldControl<unknown> {
        if (!this._control) {
            throw getKbqFormFieldMissingControlError();
        }

        return this._control;
    }

    /** Whether the form field is invalid. */
    get invalid(): boolean {
        return !!this.control?.errorState;
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
    get hasPasswordHint(): boolean {
        return this.passwordHints?.length > 0;
    }

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
        return this.control?.focused;
    }

    /**
     * Whether the form-field contains kbq-hint.
     *
     * @docs-private
     */
    get hasHint(): boolean {
        return this.hint?.length > 0;
    }

    /**
     * Whether the form-field contains kbqSuffix.
     *
     * @docs-private
     */
    get hasSuffix(): boolean {
        return this.suffix?.length > 0;
    }

    /**
     * Whether the form-field contains kbqPrefix.
     *
     * @docs-private
     */
    get hasPrefix(): boolean {
        return this.prefix?.length > 0;
    }

    /**
     * Whether the form-field contains kbq-cleaner.
     *
     * @docs-private
     */
    get hasCleaner(): boolean {
        return !!this.cleaner;
    }

    /**
     * Whether the form-field contains kbq-stepper.
     *
     * @docs-private
     */
    get hasStepper(): boolean {
        return !!this.stepper;
    }

    /**
     * Whether the form-field contains kbq-password-toggle.
     *
     * @docs-private
     */
    get hasPasswordToggle(): boolean {
        return !!this.passwordToggle;
    }

    /**
     * @docs-private
     */
    get canShowCleaner(): boolean {
        return this.hasCleaner && this.control?.ngControl ? this.control.ngControl.value && !this.disabled : false;
    }

    /** Whether the form field is disabled. */
    get disabled(): boolean {
        return this.control?.disabled;
    }

    /**
     * @deprecated stepper should be always visible when provided, so this parameter is redundant,
     * use `hasStepper` instead
     *
     * @docs-private
     */
    canShowStepper = true;

    ngAfterContentInit(): void {
        if ((this.control as any).numberInput && this.hasCleaner) {
            this.cleaner = null;
            throw getKbqFormFieldYouCanNotUseCleanerInNumberInputError();
        }

        // Subscribe to changes in the child control state in order to update the form field UI.
        this.control.stateChanges.pipe(startWith()).subscribe((state: any) => {
            if (this.passwordHints.length && !state?.focused && hasPasswordStrengthError(this.passwordHints)) {
                this.control.ngControl?.control?.setErrors({ passwordStrength: true });
            }
        });

        if (this.hasStepper) {
            this.stepper.connectTo((this.control as any).numberInput);
        }

        this.initializeControl();
        this.initializePrefixAndSuffix();
        this.initializeHint();
    }

    ngAfterViewInit(): void {
        this.runFocusMonitor();

        // Because the above changes a value used in the template after it was checked, we need
        // to trigger CD or the change might not be reflected if there is no other CD scheduled.
        this.changeDetectorRef.detectChanges();
    }

    ngOnDestroy(): void {
        this.stopFocusMonitor();
    }

    /** Focuses the control. */
    focus(options?: FocusOptions): void {
        this.control.focus(options);
    }

    /**
     * @deprecated Use `focus` instead.
     *
     * @docs-private
     */
    focusViaKeyboard(options?: FocusOptions): void {
        this.control.focus(options);
    }

    /**
     * @docs-private
     */
    clearValue(event: Event): void {
        event.stopPropagation();

        this.control?.ngControl?.reset();
        this.control?.focus();
    }

    /**
     * Handles a click on the control's container.
     *
     * @docs-private
     */
    onContainerClick(event: MouseEvent): void {
        if (this.control?.onContainerClick) {
            this.control.onContainerClick(event);
        }
    }

    /**
     * Handles keydown events.
     *
     * @docs-private
     */
    onKeyDown(event: KeyboardEvent): void {
        if (this.control.controlType === 'input-password' && event.altKey && event.keyCode === F8) {
            (this.control as unknown as { toggleType(): void }).toggleType();
        }

        if (this.canCleanerClearByEsc && event.keyCode === ESCAPE && this.control.focused && this.hasCleaner) {
            this.control?.ngControl?.reset();

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
        return this.connectionContainerRef || this.elementRef;
    }

    /**
     * Determines whether a class from the NgControl should be forwarded to the host element.
     *
     * @docs-private
     */
    shouldForward(prop: keyof NgControl): boolean {
        const ngControl = this.control?.ngControl;

        return ngControl && ngControl[prop];
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

    /** Initializes the form field control. */
    private initializeControl(): void {
        if (this.control.controlType) {
            this.elementRef.nativeElement.classList.add(`kbq-form-field-type-${this.control.controlType}`);
        }

        this.control.stateChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.changeDetectorRef.markForCheck();
        });

        this.control.ngControl?.valueChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.changeDetectorRef.markForCheck();
        });
    }

    /** Initializes the kbqPrefix and kbqSuffix containers. */
    private initializePrefixAndSuffix(): void {
        // Mark the form field as dirty whenever the prefix or suffix children change. This is necessary because we
        // conditionally display the prefix/suffix containers based on whether there is projected content.
        merge(this.prefix.changes, this.suffix.changes)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.changeDetectorRef.markForCheck();
            });
    }

    /** Initializes the KbqHint, KbqPasswordHint containers. */
    private initializeHint(): void {
        merge(this.hint.changes, this.passwordHints.changes)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.changeDetectorRef.markForCheck();
            });
    }
}

/**
 * @docs-private
 *
 * @deprecated Will be removed in next major release, use `noBorders` input instead.
 */
@Directive({
    standalone: true,
    selector: 'kbq-form-field[kbqFormFieldWithoutBorders]',
    exportAs: 'kbqFormFieldWithoutBorders',
    host: { class: 'kbq-form-field_without-borders' }
})
export class KbqFormFieldWithoutBorders {}

/**
 * @docs-private
 */
@Directive({
    standalone: true,
    selector: '[kbqInput], [kbqTextarea]',
    exportAs: 'KbqTrim',
    host: { class: 'kbq-trim' }
})
export class KbqTrim {
    private original: (fn: any) => void;

    constructor(
        @Attribute('no-trim') private readonly noTrim: boolean,
        @Optional() @Self() private ngControl: NgControl
    ) {
        this.noTrim = coerceBooleanProperty(noTrim);

        if (this.noTrim || !this.ngControl?.valueAccessor) {
            return;
        }

        this.original = this.ngControl.valueAccessor.registerOnChange;

        this.ngControl.valueAccessor.registerOnChange = this.registerOnChange;
    }

    trim(value) {
        if (this.noTrim) {
            return value;
        }

        return typeof value === 'string' ? value.trim() : value;
    }

    private registerOnChange = (fn) => {
        return this.original.call(this.ngControl.valueAccessor, (value) => fn(this.trim(value)));
    };
}
