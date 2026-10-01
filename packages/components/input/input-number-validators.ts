import { coerceNumberProperty, NumberInput } from '@angular/cdk/coercion';
import { computed, Directive, forwardRef, input, OnChanges, Provider, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';

/**
 * Transform for the validator bounds. `coerceNumberProperty`, not `parseInt`: the bound value may be a
 * fractional number or the string form of a static `min="0.5"` attribute, and `parseInt` would truncate
 * both to `0`. A non-numeric bound becomes `NaN`, which installs no validator and writes no attribute.
 */
const bound = (value: NumberInput): number => coerceNumberProperty(value, NaN);

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
        // Coerced rather than the raw `min()`, so a non-numeric bound (e.g. `"5px"`) is dropped from the
        // DOM exactly like it is from the installed validator, instead of writing a bogus `min` attribute.
        // `?? null` rather than a falsy check: a bound `[min]="0"` is the most common lower bound and must
        // still reach the DOM.
        '[attr.min]': 'coercedMin() ?? null'
    }
})
export class KbqMinValidator implements Validator, OnChanges {
    /** Lower bound installed as `Validators.min`. A non-numeric bound reads back as `NaN`. */
    readonly min = input<number, NumberInput>(undefined!, { transform: bound });

    private validator: ValidatorFn;
    private onChange: () => void;

    /** `min()` unless it is `NaN`, which has no DOM representation. */
    protected readonly coercedMin = computed(() => (Number.isNaN(this.min()) ? null : this.min()));

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
        const min = this.min();

        this.validator = Number.isNaN(min) ? Validators.nullValidator : Validators.min(min);
    }
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
        // See `KbqMinValidator`'s `[attr.min]` for why this is coerced rather than the raw `max()`.
        '[attr.max]': 'coercedMax() ?? null'
    }
})
export class KbqMaxValidator implements Validator, OnChanges {
    /** Upper bound installed as `Validators.max`. A non-numeric bound reads back as `NaN`. */
    readonly max = input<number, NumberInput>(undefined!, { transform: bound });

    private validator: ValidatorFn;
    private onChange: () => void;

    /** `max()` unless it is `NaN`, which has no DOM representation. */
    protected readonly coercedMax = computed(() => (Number.isNaN(this.max()) ? null : this.max()));

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
        const max = this.max();

        this.validator = Number.isNaN(max) ? Validators.nullValidator : Validators.max(max);
    }
}
