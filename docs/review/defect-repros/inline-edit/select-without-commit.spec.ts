import { Component, DebugElement, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInlineEdit, KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';

const setup = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getInlineEdit = (debugElement: DebugElement): DebugElement => debugElement.query(By.directive(KbqInlineEdit));

const options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);

@Component({
    selector: 'triage-select-without-commit',
    imports: [FormsModule, KbqFormFieldModule, KbqSelectModule, KbqOptionModule, KbqInlineEditModule],
    template: `
        <kbq-inline-edit (saved)="saved()">
            <div kbqInlineEditViewMode>{{ selected() }}</div>
            <kbq-form-field kbqInlineEditEditMode>
                <kbq-select [(ngModel)]="selected">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
class SelectWithoutCommit {
    readonly options = options;
    readonly selected = signal(options[0]);
    readonly saved = vi.fn();
}

@Component({
    selector: 'triage-select-with-commit',
    imports: [FormsModule, KbqFormFieldModule, KbqSelectModule, KbqOptionModule, KbqInlineEditModule],
    template: `
        <kbq-inline-edit #inlineEdit="kbqInlineEdit" (saved)="saved()">
            <div kbqInlineEditViewMode>{{ selected() }}</div>
            <kbq-form-field kbqInlineEditEditMode>
                <kbq-select [(ngModel)]="selected" (selectionChange)="inlineEdit.commit()">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
class SelectWithCommit {
    readonly options = options;
    readonly selected = signal(options[0]);
    readonly saved = vi.fn();
}

const pickOptionWithPointer = async <T>(fixture: ComponentFixture<T>, index: number): Promise<void> => {
    const option = document.querySelectorAll<HTMLElement>('.kbq-select__panel kbq-option')[index];

    option.click();
    fixture.detectChanges();
    await fixture.whenStable();
};

const openEditor = async <T>(fixture: ComponentFixture<T>): Promise<KbqInlineEdit> => {
    const inlineEditDebugElement = getInlineEdit(fixture.debugElement);

    inlineEditDebugElement.nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    return inlineEditDebugElement.componentInstance as KbqInlineEdit;
};

describe('triage: select-style editor without commit() on selectionChange', () => {
    it('control: with commit() bound, picking an option saves and returns to view mode', async () => {
        const fixture = setup(SelectWithCommit);
        const inlineEdit = await openEditor(fixture);

        expect(document.querySelector('.kbq-select__panel')).toBeTruthy();

        await pickOptionWithPointer(fixture, 2);

        expect(fixture.componentInstance.selected()).toBe('Option #2');
        expect(inlineEdit.mode()).toBe('view');
        expect(fixture.componentInstance.saved).toHaveBeenCalledTimes(1);
    });

    it('DEFECT: picking an option closes only the options panel and leaves the select-style editor open', async () => {
        const fixture = setup(SelectWithoutCommit);
        const inlineEditDebugElement = getInlineEdit(fixture.debugElement);
        const inlineEdit = await openEditor(fixture);
        const select: KbqSelect = fixture.debugElement.query(By.directive(KbqSelect)).componentInstance;

        expect(select.panelOpen).toBe(true);
        expect(inlineEditDebugElement.classes['kbq-inline-edit_select']).toBe(true);

        await pickOptionWithPointer(fixture, 2);

        expect(fixture.componentInstance.selected()).toBe('Option #2');
        expect(select.panelOpen).toBe(false);

        // The click inside the options overlay never reached the edit panel's outside-click handler.
        expect(inlineEdit.mode()).toBe('edit');
        expect(inlineEditDebugElement.classes['kbq-inline-edit_edit']).toBe(true);
        expect(fixture.componentInstance.saved).not.toHaveBeenCalled();
        // The edit panel is still attached, in its select-style form whose field container the theme hides.
        expect(document.querySelector('.kbq-inline-edit__panel.kbq-inline-edit__panel_select')).toBeTruthy();
    });
});
