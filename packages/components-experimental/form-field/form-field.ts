import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterContentChecked,
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    DestroyRef,
    ElementRef,
    inject,
    InjectionToken,
    Input,
    OnDestroy,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControlDirective } from '@angular/forms';
import { ESCAPE, F8 } from '@koobiq/cdk/keycodes';
import { CanColor, CanColorCtor, KBQ_FORM_FIELD_REF, mixinColor } from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { merge } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { KbqCleaner } from './cleaner';
import { KbqError } from './error';
import { KbqHint } from './hint';
import { KbqLabel } from './label';
import { hasPasswordStrengthError, KbqPasswordHint } from './password-hint';
import { KbqPasswordToggle } from './password-toggle';
import { KbqPrefix } from './prefix';
import { KbqStepper } from './stepper';
import { KbqSuffix } from './suffix';

/**
 * Default options for the kbq-form-field that can be configured using the `KBQ_FORM_FIELD_DEFAULT_OPTIONS` injection token.
 */
export type KbqFormFieldDefaultOptions = Partial<{
    /** Disables form field borders and shadows. */
    noBorders: boolean;
}>;

/** Injection token that can be used to configure the default options for all kbq-form-field's. */
export const KBQ_FORM_FIELD_DEFAULT_OPTIONS = new InjectionToken<KbqFormFieldDefaultOptions>(
    'KBQ_FORM_FIELD_DEFAULT_OPTIONS'
);

/** @docs-private */
export function getKbqFormFieldMissingControlError(): Error {
    return Error('kbq-form-field must contain a KbqFormFieldControl');
}

/** @docs-private */
function getKbqFormFieldYouCanNotUseCleanerInNumberInputError(): Error {
    return Error(`You can't use kbq-cleaner with input that have type="number"`);
}

/** @docs-private */
class KbqFormFieldBase {
    constructor(public readonly elementRef: ElementRef) {}
}

/** @docs-private */
const KbqFormFieldMixinBase: CanColorCtor & typeof KbqFormFieldBase = mixinColor(KbqFormFieldBase);

/** Container for form controls that applies styling and behavior. */
@Component({
    standalone: true,
    selector: 'kbq-form-field',
    exportAs: 'kbqFormField',
    templateUrl: './form-field.html',
    styleUrls: [
        './form-field.scss',
        './form-field-tokens.scss',
        /**
         * KbqInput is a directive and can't have styles, so we need to include its styles here.
         * The KbqInput styles are fairly minimal so it shouldn't be a big deal for people who aren't using KbqInput.
         * @TODO should be refactored
         */
        './../../components/input/input.scss',
        './../../components/timepicker/timepicker.scss',
        './../../components/datepicker/datepicker-input.scss',
        './../../components/textarea/textarea.scss'
    ],
    host: {
        class: 'kbq-form-field',
        '[class.kbq-form-field_invalid]': 'control.errorState',
        '[class.kbq-form-field_focused]': 'control.focused',
        '[class.kbq-form-field_disabled]': 'control.disabled',
        '[class.kbq-form-field_no-borders]': 'shouldDisableBorders',

        '[class.kbq-form-field_has-prefix]': 'hasPrefix',
        '[class.kbq-form-field_has-suffix]': 'hasSuffix',
        '[class.kbq-form-field_has-label]': 'hasLabel',
        '[class.kbq-form-field_has-cleaner]': 'shouldDisplayCleaner',

        '[class.kbq-form-field_has-password-toggle]': 'hasPasswordToggle',
        '[class.kbq-form-field_has-stepper]': 'canShowStepper',

        '[class.ng-untouched]': '_shouldBeForwarded("untouched")',
        '[class.ng-touched]': '_shouldBeForwarded("touched")',
        '[class.ng-pristine]': '_shouldBeForwarded("pristine")',
        '[class.ng-dirty]': '_shouldBeForwarded("dirty")',
        '[class.ng-valid]': '_shouldBeForwarded("valid")',
        '[class.ng-invalid]': '_shouldBeForwarded("invalid")',
        '[class.ng-pending]': '_shouldBeForwarded("pending")',

        '(keydown)': '_onKeyDown($event)',
        '(mouseenter)': '_onHoverChanged(true)',
        '(mouseleave)': '_onHoverChanged(false)'
    },
    inputs: ['color'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: KBQ_FORM_FIELD_REF, useExisting: KbqFormField }]
})
export class KbqFormField
    extends KbqFormFieldMixinBase
    implements AfterContentInit, AfterContentChecked, AfterViewInit, CanColor, OnDestroy
{
    /** Disables form field borders and shadows. */
    @Input({ transform: booleanAttribute }) noBorders: boolean = false;

    @ViewChild('connectionContainer') readonly _connectionContainerRef: ElementRef;
    @ContentChild(KbqFormFieldControl) readonly control: KbqFormFieldControl<unknown>;
    @ContentChild(KbqStepper) readonly _stepper: KbqStepper;
    /** @TODO should be readonly */
    @ContentChild(KbqCleaner) _cleaner: KbqCleaner | null;
    @ContentChild(KbqLabel) readonly _label: KbqLabel | null;
    @ContentChild(KbqPasswordToggle) readonly _passwordToggle: KbqPasswordToggle | null;
    @ContentChildren(KbqHint) readonly _hint: QueryList<KbqHint>;
    @ContentChildren(KbqPasswordHint) readonly _passwordHints: QueryList<KbqPasswordHint>;
    @ContentChildren(KbqSuffix) readonly _suffix: QueryList<KbqSuffix>;
    @ContentChildren(KbqPrefix) readonly _prefix: QueryList<KbqPrefix>;
    @ContentChildren(KbqError) readonly _error: QueryList<KbqError>;

    hovered: boolean = false;

    /** @TODO move into KbqCleaner */
    canCleanerClearByEsc: boolean = true;

    readonly #changeDetectorRef = inject(ChangeDetectorRef);
    readonly #focusMonitor = inject(FocusMonitor);
    readonly #destroyRef = inject(DestroyRef);
    readonly #defaultOptions = inject(KBQ_FORM_FIELD_DEFAULT_OPTIONS, { optional: true });

    get shouldDisableBorders(): boolean {
        return this.noBorders || !!this.#defaultOptions?.noBorders;
    }

    get hasFocus(): boolean {
        return this.control.focused;
    }

    /** form-field contains kbq-hint */
    get hasHint(): boolean {
        return this._hint?.length > 0;
    }

    /** form-field contains kbq-password-hint */
    get hasPasswordHint(): boolean {
        return this._passwordHints?.length > 0;
    }

    /** form-field contains kbq-label */
    get hasLabel(): boolean {
        return !!this._label;
    }

    /** form-field contains kbqSuffix */
    get hasSuffix(): boolean {
        return this._suffix?.length > 0;
    }

    /** form-field contains kbqPrefix */
    get hasPrefix(): boolean {
        return this._prefix?.length > 0;
    }

    /** form-field contains kbq-cleaner */
    get hasCleaner(): boolean {
        return !!this._cleaner;
    }

    /** form-field contains kbq-stepper */
    get hasStepper(): boolean {
        return !!this._stepper;
    }

    /** form-field contains kbq-password-toggle */
    get hasPasswordToggle(): boolean {
        return !!this._passwordToggle;
    }

    /** form-field contains kbq-error */
    get hasError(): boolean {
        return this._error.length > 0;
    }

    /** Determines whether to display kbq-cleaner */
    get shouldDisplayCleaner(): boolean {
        return this.hasCleaner && this.control?.ngControl
            ? this.control.ngControl.value && !this.control.disabled
            : false;
    }

    get disabled(): boolean {
        return this.control?.disabled;
    }

    get canShowStepper(): boolean {
        return this.hasStepper && !this.disabled && (this.control?.focused || this.hovered);
    }

    /** Determines whether to display kbq-error */
    get shouldDisplayError(): boolean {
        return this.hasError && this.control.errorState;
    }

    constructor(public readonly elementRef: ElementRef) {
        super(elementRef);
        this.#focusMonitor.monitor(this.elementRef.nativeElement, true);
    }

    ngAfterContentInit(): void {
        this.checkFormFieldControl();
        this.initializeControl();
        this.initializePrefixAndSuffix();

        if ((this.control as any)?.numberInput && this.hasCleaner) {
            this._cleaner = null;
            throw getKbqFormFieldYouCanNotUseCleanerInNumberInputError();
        }

        // Subscribe to changes in the child control state in order to update the form field UI.
        this.control.stateChanges.pipe(startWith()).subscribe((state: any) => {
            if (this._passwordHints.length && !state?.focused && hasPasswordStrengthError(this._passwordHints)) {
                this.control.ngControl?.control?.setErrors({ passwordStrength: true });
            }

            this.#changeDetectorRef.markForCheck();
        });

        if (this.hasStepper) {
            this._stepper.connectTo((this.control as any).numberInput);
        }

        this._passwordHints.changes
            .pipe(takeUntilDestroyed(this.#destroyRef))
            .subscribe(() => this.#changeDetectorRef.markForCheck());
    }

    ngAfterContentChecked(): void {
        this.checkFormFieldControl();
    }

    ngAfterViewInit(): void {
        // Because the above changes a value used in the template after it was checked, we need
        // to trigger CD or the change might not be reflected if there is no other CD scheduled.
        this.#changeDetectorRef.detectChanges();
    }

    ngOnDestroy(): void {
        this.#focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    focusViaKeyboard(): void {
        this.control.focus();
    }

    /** @docs-private */
    onContainerClick(event: MouseEvent): void {
        if (this.control.onContainerClick) {
            this.control.onContainerClick(event);
        }
    }

    /** @docs-private */
    _onKeyDown(event: KeyboardEvent): void {
        if (this.control.controlType === 'input-password' && event.altKey && event.keyCode === F8) {
            (this.control as unknown as { toggleType(): void }).toggleType();
        }
        if (this.canCleanerClearByEsc && event.keyCode === ESCAPE && this.control.focused && this.hasCleaner) {
            this.control?.ngControl?.reset();

            event.preventDefault();
        }
    }

    /** @docs-private */
    _onHoverChanged(isHovered: boolean): void {
        if (isHovered !== this.hovered) {
            this.hovered = isHovered;
            this.#changeDetectorRef.markForCheck();
        }
    }

    /**
     * Gets an ElementRef for the element that a overlay attached to the form-field should be positioned relative to.
     */
    getConnectedOverlayOrigin(): ElementRef {
        return this._connectionContainerRef || this.elementRef;
    }

    /**
     * Determines whether a class from the AbstractControlDirective should be forwarded to the host element.
     * @docs-private
     */
    _shouldBeForwarded(prop: keyof AbstractControlDirective): boolean {
        const control = this.control ? this.control.ngControl : null;
        return control && control[prop];
    }

    /** Throws an error if the form field's control is missing. */
    private checkFormFieldControl() {
        if (!this.control) {
            throw getKbqFormFieldMissingControlError();
        }
    }

    /** Initializes the kbqPrefix and kbqSuffix containers. */
    private initializePrefixAndSuffix(): void {
        // Mark the form field as dirty whenever the prefix or suffix children change. This is necessary because we
        // conditionally display the prefix/suffix containers based on whether there is projected content.
        merge(this._prefix.changes, this._suffix.changes)
            .pipe(takeUntilDestroyed(this.#destroyRef))
            .subscribe(() => {
                this.#changeDetectorRef.markForCheck();
            });
    }

    /** Initializes the form field control. */
    private initializeControl(): void {
        if (this.control.controlType) {
            this.elementRef.nativeElement.classList.add(`kbq-form-field-type-${this.control.controlType}`);
        }

        this.control.stateChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
            this.#changeDetectorRef.markForCheck();
        });

        this.control.ngControl?.valueChanges?.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
            this.#changeDetectorRef.markForCheck();
        });
    }
}
