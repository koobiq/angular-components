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
         * @TODO should be refactored (#DS-2910)
         */
        './../../components/input/input.scss',
        './../../components/timepicker/timepicker.scss',
        './../../components/datepicker/datepicker-input.scss',
        './../../components/textarea/textarea.scss'
    ],
    host: {
        class: 'kbq-form-field',
        '[class.kbq-form-field_invalid]': 'invalid',
        '[class.kbq-form-field_focused]': 'focused',
        '[class.kbq-form-field_disabled]': 'disabled',
        '[class.kbq-form-field_no-borders]': 'shouldDisableBorders',

        '[class.kbq-form-field_has-prefix]': 'hasPrefix',
        '[class.kbq-form-field_has-suffix]': 'hasSuffix',
        '[class.kbq-form-field_has-label]': 'hasLabel',
        '[class.kbq-form-field_has-cleaner]': 'shouldDisplayCleaner',

        '[class.kbq-form-field_has-password-toggle]': 'hasPasswordToggle',
        '[class.kbq-form-field_has-stepper]': 'canShowStepper',

        '[class.ng-untouched]': 'shouldBeForwarded("untouched")',
        '[class.ng-touched]': 'shouldBeForwarded("touched")',
        '[class.ng-pristine]': 'shouldBeForwarded("pristine")',
        '[class.ng-dirty]': 'shouldBeForwarded("dirty")',
        '[class.ng-valid]': 'shouldBeForwarded("valid")',
        '[class.ng-invalid]': 'shouldBeForwarded("invalid")',
        '[class.ng-pending]': 'shouldBeForwarded("pending")',

        '(keydown)': 'onKeyDown($event)',
        '(mouseenter)': 'onHoverChanged(true)',
        '(mouseleave)': 'onHoverChanged(false)'
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
    @Input({ transform: booleanAttribute }) noBorders: boolean | undefined;

    @ViewChild('connectionContainer') private readonly connectionContainerRef: ElementRef;
    @ContentChild(KbqFormFieldControl) protected readonly control: KbqFormFieldControl<unknown>;
    @ContentChild(KbqStepper) private readonly stepper: KbqStepper;
    @ContentChild(KbqCleaner) private readonly cleaner: KbqCleaner | null;
    @ContentChild(KbqLabel) private readonly label: KbqLabel | null;
    @ContentChild(KbqPasswordToggle) private readonly passwordToggle: KbqPasswordToggle | null;
    @ContentChildren(KbqHint) private readonly hint: QueryList<KbqHint>;
    @ContentChildren(KbqPasswordHint) private readonly passwordHints: QueryList<KbqPasswordHint>;
    @ContentChildren(KbqSuffix) private readonly suffix: QueryList<KbqSuffix>;
    @ContentChildren(KbqPrefix) private readonly prefix: QueryList<KbqPrefix>;
    @ContentChildren(KbqError) private readonly error: QueryList<KbqError>;

    private hovered: boolean = false;

    canCleanerClearByEsc: boolean = true;

    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly destroyRef = inject(DestroyRef);
    private readonly defaultOptions = inject(KBQ_FORM_FIELD_DEFAULT_OPTIONS, { optional: true });

    /** Determines if borders and shadows should be disabled. */
    get shouldDisableBorders(): boolean {
        return this.noBorders || !!this.defaultOptions?.noBorders;
    }

    /** Whether the form field is focused. */
    get focused(): boolean {
        return this.control.focused;
    }

    /** Whether the form field is invalid. */
    get invalid(): boolean {
        return this.control.errorState;
    }

    /** Checks whether the form-field contains kbq-hint */
    get hasHint(): boolean {
        return this.hint?.length > 0;
    }

    /** Checks whether the form-field contains kbq-password-hint */
    get hasPasswordHint(): boolean {
        return this.passwordHints?.length > 0;
    }

    /** Checks whether the form-field contains kbq-label */
    get hasLabel(): boolean {
        return !!this.label;
    }

    /** Checks whether the form-field contains kbqSuffix */
    get hasSuffix(): boolean {
        return this.suffix?.length > 0;
    }

    /** Checks whether the form-field contains kbqPrefix */
    get hasPrefix(): boolean {
        return this.prefix?.length > 0;
    }

    /** Checks whether the form-field contains kbq-cleaner */
    get hasCleaner(): boolean {
        return !!this.cleaner;
    }

    /** Checks whether the form-field contains kbq-stepper */
    get hasStepper(): boolean {
        return !!this.stepper;
    }

    /** Checks whether the form-field contains kbq-password-toggle */
    get hasPasswordToggle(): boolean {
        return !!this.passwordToggle;
    }

    /** Checks whether the form-field contains kbq-error */
    get hasError(): boolean {
        return this.error.length > 0;
    }

    /** Determines whether to display kbq-cleaner */
    get shouldDisplayCleaner(): boolean {
        return this.hasCleaner && this.control?.ngControl ? this.control.ngControl.value && !this.disabled : false;
    }

    /** Whether the form field is disabled. */
    get disabled(): boolean {
        return this.control?.disabled;
    }

    /** Determines whether to display kbq-stepper */
    get canShowStepper(): boolean {
        return this.hasStepper && !this.disabled && (this.focused || this.hovered);
    }

    /** Determines whether to display kbq-error */
    get shouldDisplayError(): boolean {
        return this.hasError && this.control.errorState;
    }

    constructor(public readonly elementRef: ElementRef) {
        super(elementRef);
        this.focusMonitor.monitor(this.elementRef.nativeElement, true);
    }

    ngAfterContentInit(): void {
        this.checkFormFieldControl();
        this.initializeControl();
        this.initializePrefixAndSuffix();

        // Subscribe to changes in the child control state in order to update the form field UI.
        this.control.stateChanges.pipe(startWith()).subscribe((state: any) => {
            if (this.passwordHints.length && !state?.focused && hasPasswordStrengthError(this.passwordHints)) {
                this.control.ngControl?.control?.setErrors({ passwordStrength: true });
            }

            this.changeDetectorRef.markForCheck();
        });

        if (this.hasStepper) {
            this.stepper.connectTo((this.control as any).numberInput);
        }

        this.passwordHints.changes
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.changeDetectorRef.markForCheck());
    }

    ngAfterContentChecked(): void {
        this.checkFormFieldControl();
    }

    ngAfterViewInit(): void {
        // Because the above changes a value used in the template after it was checked, we need
        // to trigger CD or the change might not be reflected if there is no other CD scheduled.
        this.changeDetectorRef.detectChanges();
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    /** Focuses the control. */
    focus(options?: FocusOptions): void {
        this.control.focus(options);
    }

    /** Handles a click on the control's container. */
    protected onContainerClick(event: MouseEvent): void {
        if (this.control.onContainerClick) {
            this.control.onContainerClick(event);
        }
    }

    /** @docs-private */
    protected onKeyDown(event: KeyboardEvent): void {
        if (this.control.controlType === 'input-password' && event.altKey && event.keyCode === F8) {
            (this.control as unknown as { toggleType(): void }).toggleType();
        }
        if (this.canCleanerClearByEsc && event.keyCode === ESCAPE && this.focused && this.hasCleaner) {
            this.control?.ngControl?.reset();

            event.preventDefault();
        }
    }

    /** @docs-private */
    protected onHoverChanged(isHovered: boolean): void {
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
     * Determines whether a class from the AbstractControlDirective should be forwarded to the host element.
     * @docs-private
     */
    protected shouldBeForwarded(prop: keyof AbstractControlDirective): boolean {
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
        merge(this.prefix.changes, this.suffix.changes)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.changeDetectorRef.markForCheck();
            });
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
}
