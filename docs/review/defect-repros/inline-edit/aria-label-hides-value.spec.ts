import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ruRULocaleData } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import axe from 'axe-core';

const setup = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

/** Accessible name as axe-core computes it (accname 1.2). */
const accessibleName = (element: Element): string => {
    axe.setup(document);

    try {
        return axe.commons.text.accessibleText(element);
    } finally {
        axe.teardown();
    }
};

@Component({
    selector: 'triage-aria-label-hides-value',
    imports: [FormsModule, KbqFormFieldModule, KbqInputModule, KbqInlineEditModule],
    template: `
        <kbq-inline-edit>
            <kbq-label>Assignee</kbq-label>
            <div kbqInlineEditViewMode>John Smith</div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [(ngModel)]="value" />
            </kbq-form-field>
        </kbq-inline-edit>
    `
})
class LabelledInlineEdit {
    value = 'John Smith';
}

describe('triage: accessible name of the view content', () => {
    it('DEFECT: the view button is named by the default aria-label alone, without the value or the field label', async () => {
        const fixture = setup(LabelledInlineEdit);

        await fixture.whenStable();

        const viewContent: HTMLElement = fixture.nativeElement.querySelector('.kbq-inline-edit__view-content');

        expect(viewContent.getAttribute('role')).toBe('button');
        expect(viewContent.textContent).toContain('John Smith');

        const name = accessibleName(viewContent);

        expect(name).toBe(ruRULocaleData.a11y.edit);
        expect(name).not.toContain('John Smith');
        expect(name).not.toContain('Assignee');
        // Nothing else carries the value or the label to assistive technology.
        expect(viewContent.hasAttribute('aria-describedby')).toBe(false);
        expect(viewContent.hasAttribute('aria-labelledby')).toBe(false);
    });
});
