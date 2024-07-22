import { Directive, forwardRef, Provider } from '@angular/core';
import { CheckboxRequiredValidator, NG_VALIDATORS } from '@angular/forms';

export const KBQ_CHECKBOX_REQUIRED_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => KbqCheckboxRequiredValidator),
    multi: true
};

/**
 * Validator for koobiq checkbox's required attribute in template-driven checkbox.
 * Current CheckboxRequiredValidator only work with `input type=checkbox` and does not
 * work with `kbq-checkbox`.
 */
@Directive({
    selector: `kbq-checkbox[required][formControlName],
             kbq-checkbox[required][formControl], kbq-checkbox[required][ngModel]`,
    providers: [KBQ_CHECKBOX_REQUIRED_VALIDATOR],
    host: { '[attr.required]': 'required ? "" : null' }
})
export class KbqCheckboxRequiredValidator extends CheckboxRequiredValidator {}
