import { booleanAttribute, Directive, forwardRef, Provider } from '@angular/core';
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
    host: { '[attr.required]': 'requiredAttribute' }
})
export class KbqCheckboxRequiredValidator extends CheckboxRequiredValidator {
    /**
     * The `required` input coerced the way the base validator coerces it, which is what decides
     * whether the validator runs. Binding the raw input instead would strip the attribute for
     * `<kbq-checkbox required>`, where the raw value is the empty string, at the exact moment validation
     * turns on.
     *
     * @docs-private
     */
    protected get requiredAttribute(): string | null {
        return booleanAttribute(this.required) ? '' : null;
    }
}
