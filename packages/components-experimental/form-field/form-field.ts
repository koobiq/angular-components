import {
    AfterContentInit,
    afterNextRender,
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
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControlDirective } from '@angular/forms';
import { ESCAPE, F8 } from '@koobiq/cdk/keycodes';
import { KBQ_FORM_FIELD_REF } from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { merge } from 'rxjs';
import { KbqCleaner } from './cleaner';
import { KbqError, KbqHint, KbqPasswordHint } from './hint';
import { KbqLabel } from './label';
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
export const getKbqFormFieldMissingControlError = (): Error => {
    return Error('kbq-form-field must contain a KbqFormFieldControl');
};

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
        './../../components/input/input-tokens.scss',
        './../../components/tags/tag-input-tokens.scss',
        './../../components/timepicker/timepicker.scss',
        './../../components/datepicker/datepicker-input.scss',
        './../../components/textarea/textarea.scss',
        './../../components/textarea/textarea-tokens.scss'
    ],
    host: {
        class: 'kbq-form-field___EXPERIMENTAL',
        '[class.kbq-form-field_invalid]': 'invalid',
        '[class.kbq-form-field_focused]': 'focused',
        '[class.kbq-form-field_disabled]': 'disabled',
        '[class.kbq-form-field_no-borders]': 'shouldDisableBorders',

        '[class.ng-untouched]': 'shouldBeForwarded("untouched")',
        '[class.ng-touched]': 'shouldBeForwarded("touched")',
        '[class.ng-pristine]': 'shouldBeForwarded("pristine")',
        '[class.ng-dirty]': 'shouldBeForwarded("dirty")',
        '[class.ng-valid]': 'shouldBeForwarded("valid")',
        '[class.ng-invalid]': 'shouldBeForwarded("invalid")',
        '[class.ng-pending]': 'shouldBeForwarded("pending")',

        '(keydown)': 'onKeyDown($event)',
        '(mouseenter)': 'mouseenter($event)',
        '(mouseleave)': 'mouseleave($event)'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: KBQ_FORM_FIELD_REF, useExisting: KbqFormField }]
})
export class KbqFormField implements AfterContentInit {
    /** Disables form field borders and shadows. */
    @Input({ transform: booleanAttribute }) noBorders: boolean | undefined;

    @ContentChild(KbqFormFieldControl) private readonly _control: KbqFormFieldControl<unknown>;
    @ViewChild('connectionContainer') private readonly connectionContainerRef: ElementRef;
    @ContentChild(KbqStepper) private readonly stepper: KbqStepper;
    @ContentChild(KbqCleaner) private readonly cleaner: KbqCleaner | null;
    @ContentChild(KbqLabel) private readonly label: KbqLabel | null;
    @ContentChild(KbqPasswordToggle) private readonly passwordToggle: KbqPasswordToggle | null;
    @ContentChildren(KbqHint) private readonly hint: QueryList<KbqHint>;
    @ContentChildren(KbqPasswordHint) private readonly passwordHint: QueryList<KbqPasswordHint>;
    @ContentChildren(KbqSuffix) private readonly suffix: QueryList<KbqSuffix>;
    @ContentChildren(KbqPrefix) private readonly prefix: QueryList<KbqPrefix>;
    @ContentChildren(KbqError) private readonly error: QueryList<KbqError>;

    canCleanerClearByEsc: boolean = true;

    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly elementRef = inject(ElementRef);
    private readonly defaultOptions = inject(KBQ_FORM_FIELD_DEFAULT_OPTIONS, { optional: true });

    /** The form field's control. */
    get control() {
        if (!this._control) {
            throw getKbqFormFieldMissingControlError();
        }
        return this._control;
    }

    /** Determines if borders and shadows should be disabled. */
    get shouldDisableBorders(): boolean {
        return this.noBorders || !!this.defaultOptions?.noBorders;
    }

    /** Whether the form field control is focused. */
    get focused(): boolean {
        return !!this.control?.focused;
    }

    /** Whether the form field is hovered. */
    get hovered(): boolean {
        return !!this._hovered;
    }

    /** Whether the form field is invalid. */
    get invalid(): boolean {
        return !!this.control?.errorState;
    }

    /** Checks whether the form-field contains kbq-hint */
    get hasHint(): boolean {
        return this.hint?.length > 0;
    }

    /** Checks whether the form-field contains kbq-password-hint */
    get hasPasswordHint(): boolean {
        return this.passwordHint?.length > 0;
    }

    /** Checks whether the form-field contains kbq-password-toggle */
    get hasPasswordToggle(): boolean {
        return !!this.passwordToggle;
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

    /** Checks whether the form-field contains kbq-error */
    get hasError(): boolean {
        return this.error.length > 0;
    }

    /** Whether the form field is disabled. */
    get disabled(): boolean {
        return !!this.control?.disabled;
    }

    private _hovered: boolean = false;

    constructor() {
        afterNextRender(() => {
            // Because the above changes a value used in the template after it was checked, we need
            // to trigger CD or the change might not be reflected if there is no other CD scheduled.
            this.changeDetectorRef.detectChanges();
        });
    }

    ngAfterContentInit(): void {
        this.initializeControl();
        this.initializePrefixAndSuffix();
        this.initializeHint();
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

    /** Handles keydown events. */
    protected onKeyDown(event: KeyboardEvent): void {
        // @TODO should move into KbqPasswordToggle (#DS-2910)
        if (this.control.controlType === 'input-password' && event.altKey && event.keyCode === F8) {
            (this.control as unknown as { toggleType(): void }).toggleType();
        }
        // @TODO should move into KbqCleaner (#DS-2910)
        if (this.canCleanerClearByEsc && event.keyCode === ESCAPE && this.focused && this.hasCleaner) {
            this.control?.ngControl?.reset();
            event.preventDefault();
        }
    }

    /** Handles mouseenter events. */
    protected mouseenter(_event: MouseEvent): void {
        this._hovered = true;
    }

    /** Handles mouseleave events. */
    protected mouseleave(_event: MouseEvent): void {
        this._hovered = false;
    }

    /**
     * Gets an ElementRef for the element that a overlay attached to the form-field should be positioned relative to.
     */
    getConnectedOverlayOrigin(): ElementRef {
        return this.connectionContainerRef || this.elementRef;
    }

    /**
     * Determines whether a class from the AbstractControlDirective should be forwarded to the host element.
     */
    protected shouldBeForwarded(property: keyof AbstractControlDirective): boolean {
        return this.control.ngControl?.[property];
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

    /** Initializes the KbqHint, KbqError and KbqPasswordHint containers. */
    private initializeHint(): void {
        merge(this.hint.changes, this.error.changes, this.passwordHint.changes)
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
