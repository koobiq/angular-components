import { Injectable } from '@angular/core';
import { AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';

/**
 * Error state matcher that matches when a control is invalid and form is submitted.
 * Requires use FormGroupDirective or NgForm.
 */
@Injectable()
export class ShowOnFormSubmitErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control?.invalid && form?.submitted);
    }
}

/** Error state matcher that matches when a control is invalid and dirty or form is submitted. */
@Injectable()
export class ShowOnControlDirtyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control?.invalid && (control.dirty || form?.submitted));
    }
}

/**
 * Provider that defines how form controls behave with regards to displaying error messages.
 * Error state matcher that matches when a control is invalid and touched or form is submitted.
 */
@Injectable({ providedIn: 'root' })
export class ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control?.invalid && (control.touched || form?.submitted));
    }
}
