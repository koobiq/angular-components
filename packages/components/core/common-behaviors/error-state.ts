import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectorRef,
    DestroyRef,
    Directive,
    inject,
    input
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { ErrorStateMatcher } from '../error/error-state-matcher';
import { KBQ_FORM_FIELD_REF } from '../form-field';
import { AbstractConstructor, Constructor } from './constructor';

/** @docs-private */
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
export interface HasErrorState {
    parentFormGroup: FormGroupDirective | null;
    parentForm: NgForm | null;
    defaultErrorStateMatcher: ErrorStateMatcher;

    ngControl: NgControl | null;
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

            console.warn('mixinErrorState deprecated and will be deleted in next major release');
        }

        updateErrorState() {
            const oldState = this.errorState;
            const parent = this.parentFormGroup || this.parentForm;
            const matcher = this.errorStateMatcher || this.defaultErrorStateMatcher;
            const control = this.ngControl ? (this.ngControl.control as UntypedFormControl) : null;
            const newState = matcher.isErrorState(control, parent);

            if (newState !== oldState) {
                this.errorState = newState;
                this.stateChanges.next();
            }
        }
    };
}

/**
 * Class that tracks the error state of a component.
 * @docs-private
 */
export class KbqErrorStateTracker implements CanUpdateErrorState {
    /** Whether the tracker is currently in an error state. */
    errorState = false;

    /** User-defined matcher for the error state. */
    errorStateMatcher: ErrorStateMatcher;

    constructor(
        private defaultMatcher: ErrorStateMatcher | null,
        public ngControl: NgControl | null,
        private parentFormGroup: FormGroupDirective | null,
        private parentForm: NgForm | null,
        private stateChanges: Subject<void>
    ) {}

    /** Updates the error state based on the provided error state matcher. */
    updateErrorState() {
        const oldState = this.errorState;
        const parent = this.parentFormGroup || this.parentForm;
        const matcher = this.errorStateMatcher || this.defaultMatcher;
        const control = this.ngControl ? (this.ngControl.control as AbstractControl) : null;
        const newState = matcher?.isErrorState(control, parent) ?? false;

        if (newState !== oldState) {
            this.errorState = newState;
            this.stateChanges.next();
        }
    }
}

/**
 * Directive to automatically apply error-based styling to a host element
 * when used within a form field component.
 */
@Directive({
    standalone: true,
    selector: '[kbqAutoColor]',
    exportAs: 'kbqAutoColor',
    host: {
        '[class.kbq-error]': 'hasError'
    }
})
export class KbqAutoColor implements AfterContentInit {
    readonly autoColor = input(false, { alias: 'kbqAutoColor', transform: booleanAttribute });
    protected readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true });
    protected readonly cdr = inject(ChangeDetectorRef);
    protected readonly destroyRef = inject(DestroyRef);

    /** Flag that controls css-class on host when control state changes. */
    hasError: boolean = false;

    /** @docs-private */
    ngAfterContentInit(): void {
        if (this.autoColor()) {
            this.setupHostErrorStyling();
        }
    }

    private setupHostErrorStyling() {
        this.formField?.control?.stateChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.updateState);

        this.updateState();
    }

    private updateState = () => {
        this.hasError = this.formField?.control?.errorState;
        this.cdr.markForCheck();
    };
}
