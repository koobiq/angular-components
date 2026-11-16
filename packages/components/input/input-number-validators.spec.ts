import { Component, Provider, Type, viewChild } from '@angular/core';
import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DateTime } from 'luxon';
import { KbqInputModule, KbqMaxValidator, KbqMinValidator } from './index';

function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
            FormsModule,
            ReactiveFormsModule,
            KbqInputModule,
            ...imports,
            component
        ],
        providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }, ...providers]
    }).compileComponents();

    return TestBed.createComponent<T>(component);
}

@Component({
    imports: [
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqNumberInput [formControl]="control" [max]="max" [min]="min" />
        </kbq-form-field>
    `
})
class NumberInputWithBounds {
    readonly minValidator = viewChild.required(KbqMinValidator);
    readonly maxValidator = viewChild.required(KbqMaxValidator);

    control = new FormControl<number | null>(null);
    min: number | undefined = 0.5;
    max: number | undefined = 9.5;
}

@Component({
    imports: [
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <input kbqNumberInput min="0.5" max="9.5" [formControl]="control" />
        </kbq-form-field>
    `
})
class NumberInputWithStaticBounds {
    control = new FormControl<number | null>(null);
}

describe('KbqMinValidator/KbqMaxValidator', () => {
    describe('fractional bounds', () => {
        let fixture: ComponentFixture<NumberInputWithBounds>;

        beforeEach(async () => {
            fixture = createComponent(NumberInputWithBounds);
            fixture.detectChanges();
            await fixture.whenStable();
        });

        it('should reject a value below a fractional min', async () => {
            fixture.componentInstance.control.setValue(0.2);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.errors).toEqual({ min: { min: 0.5, actual: 0.2 } });
        });

        it('should accept a value above a fractional min', async () => {
            fixture.componentInstance.control.setValue(0.7);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.hasError('min')).toBe(false);
        });

        it('should accept a value below a fractional max', async () => {
            fixture.componentInstance.control.setValue(9.3);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.hasError('max')).toBe(false);
        });

        it('should reject a value above a fractional max', async () => {
            fixture.componentInstance.control.setValue(9.7);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.errors).toEqual({ max: { max: 9.5, actual: 9.7 } });
        });
    });

    describe('numeric string bounds', () => {
        it('should validate a string bound like a number', async () => {
            const fixture = createComponent(NumberInputWithBounds);

            // Not assignable under the `number` typing, but the string form is what a static
            // `min="0.5"` attribute and an untyped template deliver.
            fixture.componentInstance.min = '0.5' as unknown as number;
            fixture.detectChanges();
            await fixture.whenStable();

            fixture.componentInstance.control.setValue(0.2);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.errors).toEqual({ min: { min: 0.5, actual: 0.2 } });
        });

        it('should validate the string form of a static attribute', async () => {
            const fixture = createComponent(NumberInputWithStaticBounds);

            fixture.componentInstance.control.setValue(0.2);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.errors).toEqual({ min: { min: 0.5, actual: 0.2 } });

            fixture.componentInstance.control.setValue(9.7);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.errors).toEqual({ max: { max: 9.5, actual: 9.7 } });

            const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(inputElement.getAttribute('min')).toBe('0.5');
            expect(inputElement.getAttribute('max')).toBe('9.5');
        });
    });

    describe('non-numeric object bounds', () => {
        // A datepicker input shares its `min`/`max` bindings with these validators through the selector,
        // so a date reaches the transform at runtime despite the `number` typing.
        const objectWithEpochValueOf = () => ({
            valueOf: () => 1717189200000,
            toString: () => '2024-06-01T00:00:00.000Z'
        });

        it('should validate nothing for a bound DateTime and write no attribute', async () => {
            const fixture = createComponent(NumberInputWithBounds);

            fixture.componentInstance.min = DateTime.fromISO('2024-06-01') as unknown as number;
            fixture.componentInstance.max = DateTime.fromISO('2024-08-31') as unknown as number;
            fixture.detectChanges();
            await fixture.whenStable();

            fixture.componentInstance.control.setValue(0.2);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.errors).toBeNull();

            const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(inputElement.getAttribute('min')).toBeNull();
            expect(inputElement.getAttribute('max')).toBeNull();
        });

        it('should validate nothing for any other object with a `valueOf` and write no attribute', async () => {
            const fixture = createComponent(NumberInputWithBounds);

            fixture.componentInstance.min = objectWithEpochValueOf() as unknown as number;
            fixture.componentInstance.max = objectWithEpochValueOf() as unknown as number;
            fixture.detectChanges();
            await fixture.whenStable();

            fixture.componentInstance.control.setValue(0.2);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.errors).toBeNull();

            const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(inputElement.getAttribute('min')).toBeNull();
            expect(inputElement.getAttribute('max')).toBeNull();
        });
    });

    describe('DOM attributes', () => {
        it('should keep a bound zero bound in the DOM', async () => {
            const fixture = createComponent(NumberInputWithBounds);

            fixture.componentInstance.min = 0;
            fixture.componentInstance.max = 0;
            fixture.detectChanges();
            await fixture.whenStable();

            const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(inputElement.getAttribute('min')).toBe('0');
            expect(inputElement.getAttribute('max')).toBe('0');
        });

        it('should drop the attributes when no bound is given', async () => {
            const fixture = createComponent(NumberInputWithBounds);

            fixture.componentInstance.min = undefined;
            fixture.componentInstance.max = undefined;
            fixture.detectChanges();
            await fixture.whenStable();

            const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(inputElement.getAttribute('min')).toBeNull();
            expect(inputElement.getAttribute('max')).toBeNull();
        });

        it('should drop a non-numeric bound instead of writing it raw to the DOM', async () => {
            const fixture = createComponent(NumberInputWithBounds);

            // Not assignable under the `number` typing, but reachable at runtime through a static
            // attribute or an untyped template, same as the coercion in `createValidator` guards against.
            fixture.componentInstance.min = '5px' as unknown as number;
            fixture.componentInstance.max = '5px' as unknown as number;
            fixture.detectChanges();
            await fixture.whenStable();

            const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

            // No validator is installed for a non-numeric bound (see `createValidator`); the DOM attribute
            // must agree instead of exposing the raw, non-numeric string.
            expect(inputElement.getAttribute('min')).toBeNull();
            expect(inputElement.getAttribute('max')).toBeNull();
        });
    });

    describe('rebinding', () => {
        it('should re-run the validators when a bound changes', async () => {
            const fixture = createComponent(NumberInputWithBounds);

            fixture.detectChanges();
            await fixture.whenStable();

            fixture.componentInstance.control.setValue(0.4);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.hasError('min')).toBe(true);

            fixture.componentInstance.min = 0.1;
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.hasError('min')).toBe(false);
        });

        it('should notify the control through registerOnValidatorChange', async () => {
            const fixture = createComponent(NumberInputWithBounds);

            fixture.detectChanges();
            await fixture.whenStable();

            const onValidatorChange = vi.fn();

            fixture.componentInstance.minValidator().registerOnValidatorChange(onValidatorChange);

            fixture.componentInstance.min = 1;
            fixture.detectChanges();
            await fixture.whenStable();

            expect(onValidatorChange).toHaveBeenCalled();
        });

        it('should validate nothing when the bound is not a number', async () => {
            const fixture = createComponent(NumberInputWithBounds);

            fixture.componentInstance.min = undefined;
            fixture.componentInstance.max = undefined;
            fixture.detectChanges();
            await fixture.whenStable();

            fixture.componentInstance.control.setValue(-100);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.errors).toBeNull();
        });
    });
});
