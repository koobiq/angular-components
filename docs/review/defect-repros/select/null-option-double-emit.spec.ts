import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelect, KbqSelectChange, KbqSelectModule } from '@koobiq/components/select';

@Component({
    selector: 'triage-reset-values-select',
    imports: [KbqFormFieldModule, KbqSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-select
                placeholder="Food"
                [formControl]="control"
                (selectionChange)="onSelectionChange($event)"
                (valueChange)="onValueChange($event)"
            >
                @for (food of foods; track food) {
                    <kbq-option [value]="food.value">{{ food.viewValue }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `
})
class ResetValuesSelect {
    foods = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: null, viewValue: 'None' }
    ];
    control = new UntypedFormControl();

    readonly selectionChanges: unknown[] = [];
    readonly valueChanges: unknown[] = [];

    readonly select = viewChild.required(KbqSelect);

    onSelectionChange(event: KbqSelectChange): void {
        this.selectionChanges.push(event.value);
    }

    onValueChange(value: unknown): void {
        this.valueChanges.push(value);
    }
}

describe('KbqSelect triage: null-valued reset option', () => {
    let fixture: ComponentFixture<ResetValuesSelect>;
    let overlayContainer: OverlayContainer;
    let formChanges: unknown[];

    const pick = async (index: number): Promise<void> => {
        fixture.componentInstance.select().open();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();

        overlayContainer.getContainerElement().querySelectorAll<HTMLElement>('kbq-option')[index].click();
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();
    };

    const clearRecords = (): void => {
        fixture.componentInstance.selectionChanges.length = 0;
        fixture.componentInstance.valueChanges.length = 0;
        formChanges.length = 0;
    };

    beforeEach(async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({ imports: [ResetValuesSelect] });
        overlayContainer = TestBed.inject(OverlayContainer);
        fixture = TestBed.createComponent(ResetValuesSelect);
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();

        formChanges = [];
        fixture.componentInstance.control.valueChanges.subscribe((value) => formChanges.push(value));
    });

    afterEach(async () => {
        await vi.runOnlyPendingTimersAsync();
        vi.useRealTimers();
        overlayContainer.ngOnDestroy();
    });

    it('DEFECT: picking the null option after a value emits selectionChange, valueChange and the form change twice', async () => {
        await pick(0);

        expect(fixture.componentInstance.control.value).toBe('steak-0');
        expect(fixture.componentInstance.selectionChanges).toEqual(['steak-0']);

        clearRecords();

        await pick(2);

        expect(fixture.componentInstance.control.value).toBeNull();
        expect(fixture.componentInstance.select().empty()).toBe(true);
        expect(fixture.componentInstance.selectionChanges).toEqual([null, null]);
        expect(fixture.componentInstance.valueChanges).toEqual([null, null]);
        expect(formChanges).toEqual([null, null]);
    });

    it('DEFECT: picking the null option while the select is already empty still emits (twice)', async () => {
        expect(fixture.componentInstance.select().empty()).toBe(true);

        await pick(2);

        expect(fixture.componentInstance.selectionChanges).toEqual([null, null]);
        expect(fixture.componentInstance.valueChanges).toEqual([null, null]);
        expect(formChanges).toEqual([null, null]);
    });
});
