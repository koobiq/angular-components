import { Injectable, isDevMode, Provider, Type } from '@angular/core';
import { AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';

/** Utility provider for `ErrorStateMatcher`. */
export const kbqErrorStateMatcherProvider = (
    errorStateMatcher: Type<ErrorStateMatcher> | ErrorStateMatcher
): Provider => {
    if (errorStateMatcher instanceof Type) {
        return {
            provide: ErrorStateMatcher,
            useClass: errorStateMatcher
        };
    }

    return {
        provide: ErrorStateMatcher,
        useValue: errorStateMatcher
    };
};

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

/**
 * Error state matcher with split behavior based on error's type:
 * - `required` errors are shown only after the form is submitted.
 * - All other errors are shown as soon as the control is invalid and touched.
 */
@Injectable()
export class ShowRequiredOnSubmitErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return control?.hasError('required')
            ? !!(control?.invalid && form?.submitted)
            : !!(control?.invalid && control.touched);
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

/**
 * Resolves which controls a group-level error concerns.
 *
 * Called with one error of a group at a time. Return the names of the controls the error applies to, relative
 * to the group holding it — `AbstractControl.get` paths such as `'passwords.confirm'` are supported — or
 * `null` for errors this scope does not know.
 *
 * It is called from change detection, so keep it cheap and allocation-free.
 */
export type CrossFieldErrorScope = (errorKey: string, errorValue: unknown) => readonly string[] | null;

/**
 * Error state matcher that also shows an error set on a `FormGroup` on the controls that error concerns,
 * which the default matcher cannot: it is handed the field's own `FormControl` and never looks further.
 *
 * `scope` maps an error to those controls, so no error shape is imposed on validators. The error is revealed
 * once every one of them is touched, or the form is submitted — override `shouldReveal` to change that.
 *
 * ## Usage:
 *
 * ```typescript
 * providers: [
 *     kbqErrorStateMatcherProvider(
 *         new ShowOnCrossFieldErrorStateMatcher((key) =>
 *             key === 'passwordsMismatch' ? ['newPassword', 'confirmPassword'] : null
 *         )
 *     )
 * ]
 * ```
 */
export class ShowOnCrossFieldErrorStateMatcher extends ErrorStateMatcher {
    /** Names already reported as unresolvable, so that a typo is logged once rather than every check. */
    private readonly warned = new Set<string>();

    constructor(private readonly scope: CrossFieldErrorScope) {
        super();
    }

    override isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return super.isErrorState(control, form) || this.isCrossFieldErrorState(control, form);
    }

    /**
     * Whether the controls a cross-field error concerns have been interacted with enough to show it.
     *
     * Consulted only while the form has not been submitted — a submit always reveals. Override to change the
     * rule: when one end of a range is prefilled and the user is never expected to visit it, waiting for all
     * of them hides the error until submit, and `controls.some(...)` is the better cue.
     */
    protected shouldReveal(controls: AbstractControl[]): boolean {
        return controls.every(({ touched }) => touched);
    }

    private isCrossFieldErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        if (!control) {
            return false;
        }

        // The rule may sit on any ancestor, not only the immediate parent. A group's own `errors` never holds
        // its children's, so each level contributes exactly its own cross-field errors.
        for (let group = control.parent; group; group = group.parent) {
            if (!group.errors) {
                continue;
            }

            for (const [key, value] of Object.entries(group.errors)) {
                const names = this.scope(key, value);

                if (!names?.length) {
                    continue;
                }

                // Resolving names to controls, rather than the control back to its name, keeps this
                // proportional to the size of the rule instead of the size of the form, and gets path and
                // `FormArray` index support from `get` for free.
                const involved = names
                    .map((name) => this.resolve(group!, name))
                    .filter((item): item is AbstractControl => !!item);

                if (!involved.includes(control) || !(form?.submitted || this.shouldReveal(involved))) {
                    continue;
                }

                return true;
            }
        }

        return false;
    }

    private resolve(group: AbstractControl, name: string): AbstractControl | null {
        const resolved = group.get(name);

        if (!resolved && isDevMode() && !this.warned.has(name)) {
            this.warned.add(name);

            // eslint-disable-next-line no-console
            console.warn(
                `ShowOnCrossFieldErrorStateMatcher: the scope named the control "${name}", which the group ` +
                    `holding the error does not have. The error will not be shown on it.`
            );
        }

        return resolved;
    }
}
