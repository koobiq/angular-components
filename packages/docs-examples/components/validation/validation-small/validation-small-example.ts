import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

function emptyFormValidator(): ValidatorFn {
    return (g: AbstractControl | FormGroup): ValidationErrors | null => {
        return g.get('firstName')?.value && g.get('lastName')?.value ? null : { empty: true };
    };
}

/**
 * @title Validation small
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'validation-small-example',
    templateUrl: 'validation-small-example.html',
    imports: [KbqFormFieldModule, ReactiveFormsModule, KbqInputModule, KbqButtonModule, KbqFormsModule]
})
export class ValidationSmallExample {
    smallForm: FormGroup;

    constructor() {
        this.smallForm = new FormGroup(
            {
                firstName: new FormControl('', Validators.required),
                lastName: new FormControl('', Validators.required)
            },
            emptyFormValidator()
        );
    }
}
