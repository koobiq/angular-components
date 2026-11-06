import { Component, DebugElement, Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { createKeyboardEvent, dispatchEvent, ESCAPE, KbqOptionModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInlineEdit, KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';

const setup = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getInlineEdit = (debugElement: DebugElement): DebugElement => debugElement.query(By.directive(KbqInlineEdit));

const openEditor = async <T>(fixture: ComponentFixture<T>): Promise<KbqInlineEdit> => {
    const inlineEditDebugElement = getInlineEdit(fixture.debugElement);

    inlineEditDebugElement.nativeElement.click();
    fixture.detectChanges();
    // Waits for the deferred snapshot of the initial value taken in `onAttach()`.
    await fixture.whenStable();

    return inlineEditDebugElement.componentInstance as KbqInlineEdit;
};

const pressEscapeInPanel = (): void => {
    const input = document.querySelector<HTMLInputElement>('.kbq-inline-edit__panel input')!;

    dispatchEvent(input, createKeyboardEvent('keydown', ESCAPE, undefined, 'Escape'));
};

@Component({
    selector: 'triage-getter-only-text',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqInputModule, KbqInlineEditModule],
    template: `
        <kbq-inline-edit [getValueHandler]="getValueHandler" (canceled)="canceled()">
            <div kbqInlineEditViewMode>{{ control.value }}</div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [formControl]="control" />
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
class GetterOnlyText {
    readonly control = new FormControl('Initial', { nonNullable: true });
    readonly getValueHandler = () => this.control.value;
    readonly canceled = vi.fn();
}

@Component({
    selector: 'triage-no-handlers-text',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqInputModule, KbqInlineEditModule],
    template: `
        <kbq-inline-edit (canceled)="canceled()">
            <div kbqInlineEditViewMode>{{ control.value }}</div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [formControl]="control" />
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
class NoHandlersText {
    readonly control = new FormControl('Initial', { nonNullable: true });
    readonly canceled = vi.fn();
}

@Component({
    selector: 'triage-getter-only-multi-select',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqSelectModule, KbqOptionModule, KbqInlineEditModule],
    template: `
        <kbq-inline-edit [getValueHandler]="getValueHandler">
            <div kbqInlineEditViewMode>{{ control.value }}</div>
            <kbq-form-field kbqInlineEditEditMode>
                <kbq-select multiple [formControl]="control">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
class GetterOnlyMultiSelect {
    readonly options = ['A', 'B', 'C'];
    readonly control = new FormControl<string[]>(['A', 'B'], { nonNullable: true });
    readonly getValueHandler = () => this.control.value;
}

describe('triage: getValueHandler without setValueHandler', () => {
    it('control: without handlers, Escape restores the value the editor opened with', async () => {
        const fixture = setup(NoHandlersText);
        const { componentInstance } = fixture;
        const inlineEdit = await openEditor(fixture);

        componentInstance.control.setValue('Edited');
        fixture.detectChanges();

        pressEscapeInPanel();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(componentInstance.canceled).toHaveBeenCalledTimes(1);
        expect(inlineEdit.mode()).toBe('view');
        expect(componentInstance.control.value).toBe('Initial');
    });

    it('DEFECT: with a scalar getValueHandler and no setValueHandler, Escape cancels but keeps the edited value', async () => {
        const fixture = setup(GetterOnlyText);
        const { componentInstance } = fixture;
        const inlineEdit = await openEditor(fixture);

        componentInstance.control.setValue('Edited');
        fixture.detectChanges();

        pressEscapeInPanel();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(componentInstance.canceled).toHaveBeenCalledTimes(1);
        expect(inlineEdit.mode()).toBe('view');
        // The cancelled value stays in the bound control.
        expect(componentInstance.control.value).toBe('Edited');
    });

    it('DEFECT: with an array getValueHandler, cancel writes the array items into the form fields by index and throws', async () => {
        const fixture = setup(GetterOnlyMultiSelect);
        const { componentInstance } = fixture;
        const inlineEdit = await openEditor(fixture);

        componentInstance.control.setValue(['A', 'B', 'C']);
        fixture.detectChanges();

        // `cancel()` is what Escape and the cancel button run; called directly so the error is not routed
        // through the ErrorHandler (which would log it and fail the run on the console check).
        // The first item reaches the multi-select's writeValue(), which rejects a non-array value.
        expect(() => (inlineEdit as any).cancel()).toThrow('Value must be an array in multiple-selection mode.');

        // The first item, a string, was written into the multi-select's form control; the editor stays open.
        expect(componentInstance.control.value).toBe('A');
        expect(inlineEdit.mode()).toBe('edit');
    });
});
