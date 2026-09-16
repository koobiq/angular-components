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
 *
 * Always pass an instance, as above — never the bare class (or a subclass) to `kbqErrorStateMatcherProvider`.
 * `scope` has no injection token, so Angular cannot construct this class on its own; passing the class throws
 * `NG0204` the first time anything injects `ErrorStateMatcher`.
 *
 * ## Combining with another matcher
 *
 * Cross-field display timing is this class's one job; timing for a control's own, non-cross-field errors is
 * not, so it is delegated to `own` (default: the plain `ErrorStateMatcher`) rather than hard-coded — pass any
 * other matcher to combine its timing with cross-field support, instead of subclassing:
 *
 * ```typescript
 * new ShowOnCrossFieldErrorStateMatcher(
 *     (key) => (key === 'passwordsMismatch' ? ['newPassword', 'confirmPassword'] : null),
 *     new ShowRequiredOnSubmitErrorStateMatcher()
 * )
 * ```
 */
export class ShowOnCrossFieldErrorStateMatcher extends ErrorStateMatcher {
    // Keyed by the group holding the error, not flattened into one global set — otherwise a typo warned about
    // on one form would silently suppress the same warning for an unrelated group that happens to reuse the
    // control name.
    private readonly warned = new WeakMap<AbstractControl, Set<string>>();

    constructor(
        private readonly scope: CrossFieldErrorScope,
        private readonly own: ErrorStateMatcher = new ErrorStateMatcher()
    ) {
        super();
    }

    override isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return this.own.isErrorState(control, form) || this.isCrossFieldErrorState(control, form);
    }

    /**
     * Whether the controls a cross-field error concerns have been interacted with enough to show it.
     *
     * Consulted only while the form has not been submitted — a submit always reveals. A disabled control
     * counts as satisfied, since it can never be touched by the user. Override to change the rule: when one
     * end of a range is prefilled and the user is never expected to visit it, waiting for all of them hides
     * the error until submit, and `controls.some(...)` is the better cue.
     */
    protected shouldReveal(controls: AbstractControl[]): boolean {
        return controls.every(({ touched, disabled }) => touched || disabled);
    }

    private isCrossFieldErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        // A disabled control is never shown as invalid, matching the default `ErrorStateMatcher` (its own
        // `invalid` is always `false` while disabled). Without this, a control satisfying `shouldReveal` only
        // because it's disabled would end up flagged by the very rule that's supposed to skip past it.
        if (!control?.enabled) {
            return false;
        }

        // The rule may sit on any ancestor, not only the immediate parent. A group's own `errors` never holds
        // its children's, so each level contributes exactly its own cross-field errors.
        for (let group = control.parent; group; group = group.parent) {
            if (this.isRevealedOn(group, control, form)) {
                return true;
            }
        }

        return false;
    }

    private isRevealedOn(
        group: AbstractControl,
        control: AbstractControl,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        if (!group.errors) {
            return false;
        }

        for (const [key, value] of Object.entries(group.errors)) {
            const names = this.scope(key, value);

            if (!names?.length) {
                continue;
            }

            // A cheap first pass: resolve every name once, without allocating, just to learn whether `control`
            // is even named by this rule and whether every name resolved. Most rules don't concern a given
            // control, so the `involved` array below is worth building only once we know it might matter.
            let containsControl = false;
            let allResolved = true;

            for (const name of names) {
                const resolved = this.resolve(group, name);

                containsControl ||= resolved === control;
                allResolved &&= !!resolved;
            }

            if (!containsControl) {
                continue;
            }

            if (form?.submitted) {
                return true;
            }

            // A name that failed to resolve leaves no way to know whether the control it would have named is
            // touched, so "every named control is touched" can't be honestly claimed from the rest — fall
            // back to submit-only for this rule instead of revealing early on the controls that did resolve.
            if (allResolved) {
                // Resolving names to controls, rather than the control back to its name, keeps this
                // proportional to the size of the rule instead of the size of the form, and gets path and
                // `FormArray` index support from `get` for free.
                const involved = names
                    .map((name) => this.resolve(group, name))
                    .filter((item): item is AbstractControl => !!item);

                if (this.shouldReveal(involved)) {
                    return true;
                }
            }
        }

        return false;
    }

    private resolve(group: AbstractControl, name: string): AbstractControl | null {
        const resolved = group.get(name);

        if (!resolved && isDevMode()) {
            const warnedNames = this.warned.get(group) ?? new Set<string>();

            if (!warnedNames.has(name)) {
                warnedNames.add(name);
                this.warned.set(group, warnedNames);

                // eslint-disable-next-line no-console
                console.warn(
                    `ShowOnCrossFieldErrorStateMatcher: the scope named the control "${name}", which the group ` +
                        `holding the error does not have. The error will not be shown on it.`
                );
            }
        }

        return resolved;
    }
}
