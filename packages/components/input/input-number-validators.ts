import { coerceNumberProperty, NumberInput } from '@angular/cdk/coercion';
import { Directive, forwardRef, input, OnChanges, Provider, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';

export const KBQ_MIN_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => KbqMinValidator),
    multi: true
};

/**
 * A directive which installs the `KbqMinValidator` for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `min` attribute.
 */
@Directive({
    selector: '[min][formControlName],[min][formControl],[min][ngModel]',
    providers: [KBQ_MIN_VALIDATOR],
    host: {
        // `?? null` rather than a falsy check: a bound `[min]="0"` is the most common lower bound and must
        // still reach the DOM.
        '[attr.min]': 'min() ?? null'
    }
})
export class KbqMinValidator implements Validator, OnChanges {
    readonly min = input<number>(undefined!);
    private validator: ValidatorFn;
    private onChange: () => void;

    ngOnChanges(changes: SimpleChanges): void {
        if ('min' in changes) {
            this.createValidator();

            if (this.onChange) {
                this.onChange();
            }
        }
    }

    validate(c: AbstractControl): ValidationErrors | null {
        return this.validator(c);
    }

    registerOnValidatorChange(fn: () => void): void {
        this.onChange = fn;
    }

    private createValidator(): void {
        // `coerceNumberProperty`, not `parseInt`: the bound value may be a fractional number or the string
        // form of a static `min="0.5"` attribute, and `parseInt` would truncate both to `0`.
        const min = coerceNumberProperty(this.min(), NaN);

        this.validator = Number.isNaN(min) ? Validators.nullValidator : Validators.min(min);
    }

    /** @docs-private */
    static ngAcceptInputType_min: NumberInput;
}

export const KBQ_MAX_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => KbqMaxValidator),
    multi: true
};

/**
 * A directive which installs the `KbqMaxValidator` for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `max` attribute.
 */
@Directive({
    selector: '[max][formControlName],[max][formControl],[max][ngModel]',
    providers: [KBQ_MAX_VALIDATOR],
    host: {
        '[attr.max]': 'max() ?? null'
    }
})
export class KbqMaxValidator implements Validator, OnChanges {
    readonly max = input<number>(undefined!);
    private validator: ValidatorFn;
    private onChange: () => void;

    ngOnChanges(changes: SimpleChanges): void {
        if ('max' in changes) {
            this.createValidator();

            if (this.onChange) {
                this.onChange();
            }
        }
    }

    validate(c: AbstractControl): ValidationErrors | null {
        return this.validator(c);
    }

    registerOnValidatorChange(fn: () => void): void {
        this.onChange = fn;
    }

    private createValidator(): void {
        const max = coerceNumberProperty(this.max(), NaN);

        this.validator = Number.isNaN(max) ? Validators.nullValidator : Validators.max(max);
    }

    /** @docs-private */
    static ngAcceptInputType_max: NumberInput;
}

/**
 * @deprecated Use {@link KbqMinValidator}. The unprefixed name shadows the identically named export of
 * `@angular/forms`.
 */
export const MinValidator = KbqMinValidator;

/**
 * @deprecated Use {@link KbqMinValidator}. The unprefixed name shadows the identically named export of
 * `@angular/forms`.
 */
export type MinValidator = KbqMinValidator;

/**
 * @deprecated Use {@link KbqMaxValidator}. The unprefixed name shadows the identically named export of
 * `@angular/forms`.
 */
export const MaxValidator = KbqMaxValidator;

/**
 * @deprecated Use {@link KbqMaxValidator}. The unprefixed name shadows the identically named export of
 * `@angular/forms`.
 */
export type MaxValidator = KbqMaxValidator;

/** @deprecated Use {@link KBQ_MIN_VALIDATOR}. */
export const MIN_VALIDATOR: Provider = KBQ_MIN_VALIDATOR;

/** @deprecated Use {@link KBQ_MAX_VALIDATOR}. */
export const MAX_VALIDATOR: Provider = KBQ_MAX_VALIDATOR;
