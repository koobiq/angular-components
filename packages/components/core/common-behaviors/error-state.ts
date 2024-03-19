import { UntypedFormControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';

import { ErrorStateMatcher } from '../error/error-options';

import { AbstractConstructor, Constructor } from './constructor';


/** @docs-private */
// tslint:disable-next-line:naming-convention
export interface CanUpdateErrorState {
    /** Whether the component is in an error state. */
    errorState: boolean;
    /** An object used to control the error state of the component. */
    errorStateMatcher: ErrorStateMatcher;
    /** Updates the error state based on the provided error state matcher. */
    updateErrorState(): void;
}

/** @docs-private */
export type CanUpdateErrorStateCtor = Constructor<CanUpdateErrorState>;

/** @docs-private */
// tslint:disable-next-line:naming-convention
export interface HasErrorState {
    parentFormGroup: FormGroupDirective;
    parentForm: NgForm;
    defaultErrorStateMatcher: ErrorStateMatcher;

    ngControl: NgControl;
    stateChanges: Subject<void>;
}

/**
 * Mixin to augment a directive with updateErrorState method.
 * For component with `errorState` and need to update `errorState`.
 */
export function mixinErrorState<T extends AbstractConstructor<HasErrorState>>(base: T): CanUpdateErrorStateCtor & T;
export function mixinErrorState<T extends Constructor<HasErrorState>>(base: T): CanUpdateErrorStateCtor & T {
    return class extends base {
        /** Whether the component is in an error state. */
        errorState: boolean = false;

        errorStateMatcher: ErrorStateMatcher;

        constructor(...args: any[]) {
            super(...args);
        }

        updateErrorState() {
            const oldState = this.errorState;
            const parent = this.parentFormGroup || this.parentForm;
            const matcher = this.errorStateMatcher || this.defaultErrorStateMatcher;
            const control = this.ngControl ? this.ngControl.control as UntypedFormControl : null;
            const newState = matcher.isErrorState(control, parent);

            if (newState !== oldState) {
                this.errorState = newState;
                this.stateChanges.next();
            }
        }
    };
}
