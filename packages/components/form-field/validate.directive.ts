import {
    AfterContentInit,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    forwardRef,
    Host,
    Inject,
    Optional,
    Self
} from '@angular/core';
import {
    AbstractControl,
    FormControlDirective,
    FormControlName,
    FormGroupDirective,
    NG_VALIDATORS,
    NgControl,
    NgForm,
    NgModel,
    RequiredValidator,
    ValidationErrors,
    Validator,
    ValidatorFn
} from '@angular/forms';
import { KBQ_VALIDATION, KbqValidationOptions } from '@koobiq/components/core';
import { KbqFormField } from './form-field';
import { KbqFormFieldControl } from './form-field-control';

/**
 * @deprecated Will be removed in next major release (#DS-2838)
 *
 * Legacy validation directive.
 *
 * ### How to disable?
 *
 * ```typescript
 * import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
 *
 * @NgModule({
 *      providers: [kbqDisableLegacyValidationDirectiveProvider()]
 * })
 * ```
 *
 * @docs-private
 */
@Directive({
    standalone: true,
    selector: `
        input[kbqInput],
        input[kbqNumberInput],
        input[kbqInputPassword],
        input[kbqTimepicker],
        input[kbqDatepicker],
        textarea[kbqTextarea],
        kbq-select,
        kbq-tree-select,
        kbq-tag-list
    `,
    exportAs: 'KbqValidate'
})
export class KbqValidateDirective implements AfterContentInit {
    get isNgModel(): boolean {
        return this.ngControl instanceof NgModel;
    }

    get isFormControlName(): boolean {
        return this.ngControl instanceof FormControlName;
    }

    get isFormControl(): boolean {
        return this.ngControl instanceof FormControlDirective;
    }

    get validationControl(): any {
        return this.ngControl?.control || this.ngControl;
    }

    get parent() {
        return this.parentForm || this.parentFormGroup;
    }

    get hasNotSubmittedParent(): boolean {
        return this.parent && !this.parent.submitted;
    }

    constructor(
        @Inject(forwardRef(() => KbqFormFieldControl)) private formFieldControl: KbqFormFieldControl<any>,
        @Optional() @Self() @Inject(NG_VALIDATORS) public rawValidators: Validator[],
        @Optional() @Self() private ngControl: NgControl,
        @Optional() private parentForm: NgForm,
        @Optional() private parentFormGroup: FormGroupDirective,
        @Optional() @Inject(KBQ_VALIDATION) private mcValidation: KbqValidationOptions,
        private cdr: ChangeDetectorRef,
        @Optional() @Host() private readonly parentFormField: KbqFormField | null,
        private readonly elementRef: ElementRef
    ) {}

    ngAfterContentInit() {
        if (this.mcValidation.useValidation) {
            this.parentFormField?.elementRef.nativeElement.classList.add('kbq-form-field_has-validate-directive');
            this.elementRef.nativeElement.classList.add('kbq-control_has-validate-directive');

            this.setMosaicValidation();
        }
    }

    setValidState(control: AbstractControl, validator: ValidatorFn): void {
        if (!control) {
            return;
        }

        control.clearValidators();
        control.updateValueAndValidity({ emitEvent: false });
        control.setValidators(validator);
    }

    /** This function do next:
     * - run validation on submitting parent form
     * - prevent validation in required validator if form doesn't submitted
     * - if control has focus validation will be prevented
     */
    setMosaicValidation(): void {
        if (!this.validationControl) {
            return;
        }

        if (this.parent?.onSubmit) {
            const originalSubmit = this.parent.onSubmit;

            this.parent.onSubmit = ($event: Event) => {
                this.validationControl!.updateValueAndValidity({ emitEvent: false });

                return originalSubmit.call(this.parent, $event);
            };
        }

        if (this.isNgModel) {
            this.setMosaicValidationForModelControl();
        } else if (this.isFormControl || this.isFormControlName) {
            this.setMosaicValidationForFormControl();
        }
    }

    setMosaicValidationForModelControl() {
        if (!this.rawValidators) {
            return;
        }

        this.rawValidators.forEach((validator: Validator) => {
            const originalValidate = validator.validate;

            if (validator instanceof RequiredValidator) {
                // changed required validation logic
                validator.validate = (control: AbstractControl): ValidationErrors | null => {
                    if (this.hasNotSubmittedParent) {
                        return null;
                    }

                    return originalValidate.call(validator, control);
                };
            } else {
                // changed all other validation logic
                validator.validate = (control: AbstractControl): ValidationErrors | null => {
                    if (this.formFieldControl.focused) {
                        return null;
                    }

                    return originalValidate.call(validator, control);
                };
            }
        });
    }

    setMosaicValidationForFormControl() {
        // changed required validation logic after initialization
        if (this.validationControl.invalid && this.validationControl.errors!.required) {
            Promise.resolve().then(() => {
                this.setValidState(this.validationControl, this.validationControl.validator);
                this.cdr.markForCheck();
            });
        }

        // check dynamic updates
        this.validationControl.statusChanges!.subscribe(() => {
            // changed required validation logic
            if (
                this.validationControl.invalid &&
                this.hasNotSubmittedParent &&
                this.validationControl.errors!.required
            ) {
                this.setValidState(this.validationControl, this.validationControl.validator);
            }

            // changed all other validation logic
            if (this.validationControl.invalid && this.formFieldControl.focused) {
                this.setValidState(this.validationControl, this.validationControl.validator);
            }
        });
    }
}
