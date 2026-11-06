import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTagList, KbqTagsModule } from '@koobiq/components/tags';

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });

    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getTagElements = (fixture: ComponentFixture<unknown>): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('kbq-tag'));

const getTagList = (fixture: ComponentFixture<unknown>): KbqTagList =>
    fixture.debugElement.query(By.directive(KbqTagList)).componentInstance;

@Component({
    imports: [KbqFormFieldModule, KbqTagsModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list>
                @for (tag of tags; track tag) {
                    <kbq-tag [value]="tag">{{ tag }}</kbq-tag>
                }
            </kbq-tag-list>
        </kbq-form-field>
    `
})
class FormFieldTagListWithoutInput {
    readonly tags = ['a', 'b', 'c', 'd'];
}

@Component({
    imports: [KbqTagsModule],
    template: `
        <kbq-tag-list>
            @for (tag of tags; track tag) {
                <kbq-tag [value]="tag">{{ tag }}</kbq-tag>
            }
        </kbq-tag-list>
    `
})
class BareTagListWithoutInput {
    readonly tags = ['a', 'b', 'c', 'd'];
}

describe('triage: tags container click', () => {
    it('DEFECT: a plain click on the third tag of a list without a tag input in a form field moves focus to the first tag', async () => {
        const fixture = createComponent(FormFieldTagListWithoutInput);
        const tags = getTagElements(fixture);

        // A browser focuses the tag (tabindex="-1") on mousedown, then dispatches the click.
        tags[2].focus();

        expect(document.activeElement).toBe(tags[2]);
        expect(getTagList(fixture).keyManager.activeItemIndex).toBe(2);

        tags[2].click();
        await fixture.whenStable();

        expect(document.activeElement).toBe(tags[0]);
        expect(getTagList(fixture).keyManager.activeItemIndex).toBe(0);
    });

    it('keeps focus on the clicked tag when the same list has no form field around it', async () => {
        const fixture = createComponent(BareTagListWithoutInput);
        const tags = getTagElements(fixture);

        tags[2].focus();
        tags[2].click();
        await fixture.whenStable();

        expect(document.activeElement).toBe(tags[2]);
        expect(getTagList(fixture).keyManager.activeItemIndex).toBe(2);
    });
});
