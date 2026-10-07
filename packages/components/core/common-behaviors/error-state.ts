import { Signal, signal } from '@angular/core';
import { AbstractControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '../error/error-state-matcher';

/** @docs-private */
export interface CanUpdateErrorState {
    /** Whether the component is in an error state. */
    readonly errorState: Signal<boolean>;
    /** Updates the error state based on the provided error state matcher. */
    updateErrorState(): void;
}

/**
 * Class that tracks the error state of a component.
 *
 * The state depends on the form control and its parent form, which notify nothing a signal could follow, so
 * the owner calls `updateErrorState` from `ngDoCheck`.
 * @docs-private
 */
export class KbqErrorStateTracker implements CanUpdateErrorState {
    private readonly state = signal(false);

    /** Whether the tracker is currently in an error state. */
    readonly errorState: Signal<boolean> = this.state.asReadonly();

    /** User-defined matcher for the error state. */
    errorStateMatcher: ErrorStateMatcher | null | undefined;

    constructor(
        private defaultMatcher: ErrorStateMatcher | null,
        public ngControl: NgControl | null,
        private parentFormGroup: FormGroupDirective | null,
        private parentForm: NgForm | null
    ) {}

    /** Updates the error state based on the provided error state matcher. */
    updateErrorState() {
        const parent = this.parentFormGroup || this.parentForm;
        const matcher = this.errorStateMatcher || this.defaultMatcher;
        const control = this.ngControl ? (this.ngControl.control as AbstractControl) : null;

        this.state.set(matcher?.isErrorState(control, parent) ?? false);
    }
}
