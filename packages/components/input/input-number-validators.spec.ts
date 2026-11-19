import type { NumberInput } from '@angular/cdk/coercion';
import { Component, type Provider, type Type, viewChild } from '@angular/core';
import { type ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DateTime } from 'luxon';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
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
    min: NumberInput = 0.5;
    max: NumberInput = 9.5;
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

@Component({
    imports: [
        KbqDatepickerModule,
        KbqInputModule,
        ReactiveFormsModule,
        KbqLuxonDateModule
    ],
    template: `
        <input [kbqDatepicker]="datepicker" [formControl]="control" [min]="min" [max]="max" />
        <kbq-datepicker #datepicker />
    `
})
class DatepickerWithBounds {
    control = new FormControl<DateTime | null>(DateTime.fromISO('2024-06-02'));
    min: DateTime | string = DateTime.fromISO('2024-06-01');
    max: DateTime | string = DateTime.fromISO('2024-08-31');
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

    describe('coercible object bounds', () => {
        it('should preserve object coercion for an untyped template', async () => {
            const fixture = createComponent(NumberInputWithBounds);

            fixture.componentInstance.min = {
                valueOf: () => 5,
                toString: () => '5'
            } as unknown as NumberInput;
            fixture.detectChanges();
            await fixture.whenStable();

            fixture.componentInstance.control.setValue(4);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.errors).toEqual({ min: { min: 5, actual: 4 } });

            const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(inputElement.getAttribute('min')).toBe('5');
        });
    });

    describe('datepicker bounds', () => {
        it.each([
            ['DateTime', DateTime.fromISO('2024-06-01'), DateTime.fromISO('2024-08-31')],
            ['basic ISO string', '20240601', '20240831']
        ])('should leave %s bounds to the datepicker', async (_name, min, max) => {
            const fixture = createComponent(DatepickerWithBounds);

            fixture.componentInstance.min = min;
            fixture.componentInstance.max = max;
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.control.errors).toBeNull();

            const adapter = TestBed.inject<DateAdapter<DateTime>>(DateAdapter);
            const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(inputElement.getAttribute('min')).toBe(adapter.toIso8601(adapter.deserialize(min)!));
            expect(inputElement.getAttribute('max')).toBe(adapter.toIso8601(adapter.deserialize(max)!));
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

            fixture.componentInstance.min = '5px';
            fixture.componentInstance.max = '5px';
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

    // A form can validate the control before the directive gets its first inputs
    it('should pass any value before the bounds arrive', () => {
        const [minValidator, maxValidator] = TestBed.runInInjectionContext(() => [
            new KbqMinValidator(),
            new KbqMaxValidator()
        ]);
        const control = new FormControl(5);

        expect(minValidator.validate(control)).toBeNull();
        expect(maxValidator.validate(control)).toBeNull();
    });
});
