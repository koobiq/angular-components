import { Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TAB } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTagsModule } from '@koobiq/components/tags';

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });

    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const pressShiftTab = (element: HTMLElement): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        keyCode: TAB,
        shiftKey: true,
        bubbles: true,
        cancelable: true
    });

    element.dispatchEvent(event);

    return event;
};

@Component({
    imports: [KbqFormFieldModule, KbqTagsModule],
    template: `
        <button type="button">before</button>
        <kbq-form-field>
            <kbq-tag-list #tagList>
                @for (tag of tags(); track tag) {
                    <kbq-tag disabled [value]="tag">{{ tag }}</kbq-tag>
                }
                <input [kbqTagInputFor]="tagList" />
            </kbq-tag-list>
        </kbq-form-field>
    `
})
class TagInputWithoutEnabledTags {
    readonly tags = signal<string[]>([]);
}

describe('triage: tags Shift+Tab from an empty tag input', () => {
    it('DEFECT: Shift+Tab in the empty tag input of a list without tags is prevented while focus stays in the input', () => {
        const fixture = createComponent(TagInputWithoutEnabledTags);
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        input.focus();

        const event = pressShiftTab(input);

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(input);
    });

    it('DEFECT: Shift+Tab in the empty tag input of a list whose tags are all disabled is prevented while focus stays in the input', () => {
        const fixture = createComponent(TagInputWithoutEnabledTags);

        fixture.componentInstance.tags.set(['a', 'b']);
        fixture.detectChanges();

        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        expect(fixture.nativeElement.querySelectorAll('kbq-tag.kbq-disabled').length).toBe(2);

        input.focus();

        const event = pressShiftTab(input);

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(input);
    });
});
