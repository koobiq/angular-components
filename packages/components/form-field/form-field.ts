import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentChecked,
    AfterContentInit,
    AfterViewInit,
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    DestroyRef,
    Directive,
    ElementRef,
    OnDestroy,
    Optional,
    QueryList,
    Self,
    ViewChild,
    ViewEncapsulation,
    inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import { ESCAPE, F8 } from '@koobiq/cdk/keycodes';
import { CanColor, CanColorCtor, KBQ_FORM_FIELD_REF, mixinColor } from '@koobiq/components/core';
import { EMPTY, merge } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { KbqCleaner } from './cleaner';
import { KbqFormFieldControl } from './form-field-control';
import {
    getKbqFormFieldMissingControlError,
    getKbqFormFieldYouCanNotUseCleanerInNumberInputError
} from './form-field-errors';
import { KbqHint } from './hint';
import { KbqPasswordHint, hasPasswordStrengthError } from './password-hint';
import { KbqPasswordToggle } from './password-toggle';
import { KbqPrefix } from './prefix';
import { KbqStepper } from './stepper';
import { KbqSuffix } from './suffix';

let nextUniqueId = 0;

/** @docs-private */
export class KbqFormFieldBase {
    constructor(public elementRef: ElementRef) {}
}

/** @docs-private */
export const KbqFormFieldMixinBase: CanColorCtor & typeof KbqFormFieldBase = mixinColor(KbqFormFieldBase);

@Component({
    selector: 'kbq-form-field',
    exportAs: 'kbqFormField',
    templateUrl: 'form-field.html',
    // KbqInput is a directive and can't have styles, so we need to include its styles here.
    // The KbqInput styles are fairly minimal so it shouldn't be a big deal for people who
    // aren't using KbqInput.
    styleUrls: [
        'form-field.scss',
        '../input/input.scss',
        '../timepicker/timepicker.scss',
        '../datepicker/datepicker-input.scss',
        '../textarea/textarea.scss',
        'form-field-tokens.scss',
        '../input/input-tokens.scss',
        '../tags/tag-input-tokens.scss'
    ],
    host: {
        class: 'kbq-form-field',
        '[class.kbq-form-field_invalid]': 'control.errorState',
        '[class.kbq-form-field_has-prefix]': 'hasPrefix',
        '[class.kbq-form-field_has-suffix]': 'hasSuffix',
        '[class.kbq-form-field_has-password-toggle]': 'hasPasswordToggle',
        '[class.kbq-form-field_has-cleaner]': 'canShowCleaner',
        '[class.kbq-form-field_has-stepper]': 'canShowStepper',

        '[class.kbq-disabled]': 'control.disabled',

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
    inputs: ['color'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: KBQ_FORM_FIELD_REF, useExisting: KbqFormField }]
})
export class KbqFormField
    extends KbqFormFieldMixinBase
    implements AfterContentInit, AfterContentChecked, AfterViewInit, CanColor, OnDestroy
{
    @ContentChild(KbqFormFieldControl, { static: false }) control: KbqFormFieldControl<any>;
    @ContentChild(KbqStepper, { static: false }) stepper: KbqStepper;
    @ContentChild(KbqCleaner, { static: false }) cleaner: KbqCleaner | null;
    @ContentChild(KbqPasswordToggle, { static: false }) passwordToggle: KbqPasswordToggle | null;

    @ContentChildren(KbqHint) hint: QueryList<KbqHint>;
    @ContentChildren(KbqPasswordHint) passwordHints: QueryList<KbqPasswordHint>;
    @ContentChildren(KbqSuffix) suffix: QueryList<KbqSuffix>;
    @ContentChildren(KbqPrefix) prefix: QueryList<KbqPrefix>;

    @ViewChild('connectionContainer', { static: true }) connectionContainerRef: ElementRef;

    // Unique id for the internal form field label.
    labelId = `kbq-form-field-label-${nextUniqueId++}`;

    hovered: boolean = false;

    canCleanerClearByEsc: boolean = true;

    private readonly destroyRef = inject(DestroyRef);

    get focusOrigin(): FocusOrigin {
        return this._focusOrigin;
    }

    private _focusOrigin: FocusOrigin;

    get hasFocus(): boolean {
        return this.control.focused;
    }

    get hasHint(): boolean {
        return this.hint?.length > 0;
    }

    get hasSuffix(): boolean {
        return this.suffix?.length > 0;
    }

    get hasPrefix(): boolean {
        return this.prefix?.length > 0;
    }

    get hasCleaner(): boolean {
        return !!this.cleaner;
    }

    get hasStepper(): boolean {
        return !!this.stepper;
    }

    get hasPasswordToggle(): boolean {
        return !!this.passwordToggle;
    }

    get canShowCleaner(): boolean {
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

    constructor(
        public elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
        private focusMonitor: FocusMonitor
    ) {
        super(elementRef);
    }

    ngAfterContentInit() {
        if ((this.control as any).numberInput && this.hasCleaner) {
            this.cleaner = null;
            throw getKbqFormFieldYouCanNotUseCleanerInNumberInputError();
        }

        this.validateControlChild();

        if (this.control.controlType) {
            this.elementRef.nativeElement.classList.add(`kbq-form-field-type-${this.control.controlType}`);
        }

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

        // Run change detection if the value changes.
        const valueChanges = this.control.ngControl?.valueChanges || EMPTY;

        merge(valueChanges, this.hint.changes, this.passwordHints.changes)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.changeDetectorRef.markForCheck());
    }

    ngAfterContentChecked() {
        this.validateControlChild();
    }

    ngAfterViewInit() {
        this.runFocusMonitor();

        // Avoid animations on load.
        this.changeDetectorRef.detectChanges();
    }

    focusViaKeyboard(): void {
        this.control.focus();
    }

    clearValue($event) {
        $event.stopPropagation();

        this.control?.ngControl?.reset();
        this.control?.focus();
    }

    onContainerClick($event) {
        if (this.control?.onContainerClick) {
            this.control.onContainerClick($event);
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.control.controlType === 'input-password' && event.altKey && event.keyCode === F8) {
            (this.control as unknown as { toggleType(): void }).toggleType();
        }
        if (this.canCleanerClearByEsc && event.keyCode === ESCAPE && this.control.focused && this.hasCleaner) {
            this.control?.ngControl?.reset();

            event.preventDefault();
        }
    }

    onHoverChanged(isHovered: boolean) {
        if (isHovered !== this.hovered) {
            this.hovered = isHovered;
            this.changeDetectorRef.markForCheck();
        }
    }

    /**
     * Gets an ElementRef for the element that a overlay attached to the form-field should be
     * positioned relative to.
     */
    getConnectedOverlayOrigin(): ElementRef {
        return this.connectionContainerRef || this.elementRef;
    }

    /** Determines whether a class from the NgControl should be forwarded to the host element. */
    shouldForward(prop: keyof NgControl): boolean {
        const ngControl = this.control?.ngControl;

        return ngControl && ngControl[prop];
    }

    ngOnDestroy(): void {
        this.stopFocusMonitor();
    }

    runFocusMonitor = () => {
        this.focusMonitor
            .monitor(this.elementRef.nativeElement, true)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((origin) => (this._focusOrigin = origin));
    };

    stopFocusMonitor() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    /** Throws an error if the form field's control is missing. */
    protected validateControlChild() {
        if (!this.control) {
            throw getKbqFormFieldMissingControlError();
        }
    }
}

@Directive({
    selector: 'kbq-form-field[kbqFormFieldWithoutBorders]',
    exportAs: 'kbqFormFieldWithoutBorders',
    host: { class: 'kbq-form-field_without-borders' }
})
export class KbqFormFieldWithoutBorders {}

@Directive({
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
