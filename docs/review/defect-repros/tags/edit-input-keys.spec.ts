import { A } from '@angular/cdk/keycodes';
import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LEFT_ARROW, TAB } from '@koobiq/components/core';
import { KbqTagsModule } from '@koobiq/components/tags';

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });

    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

@Component({
    imports: [KbqTagsModule],
    template: `
        <kbq-tag-list editable>
            @for (tag of tags; track tag) {
                <kbq-tag [value]="tag" (editChange)="editChange($event)">
                    {{ tag }}
                    <input kbqTagEditInput />
                </kbq-tag>
            }
        </kbq-tag-list>
    `
})
class EditableTagList {
    readonly tags = ['a', 'b', 'c', 'd'];
    readonly editChange = vi.fn();
}

/** Starts editing the first tag and empties its edit input, the way select-all and Backspace would. */
const startEditingFirstTag = async (fixture: ComponentFixture<EditableTagList>) => {
    const tags: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('kbq-tag'));

    tags[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    const editInput = tags[0].querySelector<HTMLInputElement>('.kbq-tag-edit-input')!;

    editInput.focus();
    editInput.value = '';

    expect(tags[0].classList).toContain('kbq-tag_editing');
    expect(document.activeElement).toBe(editInput);
    expect(fixture.componentInstance.editChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'start', reason: 'dblclick' })
    );

    return { tags, editInput };
};

const keydown = (element: HTMLElement, init: KeyboardEventInit & { keyCode: number }): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });

    element.dispatchEvent(event);

    return event;
};

describe('triage: tags keys pressed in an empty edit input', () => {
    it('DEFECT: Left in the empty edit input of the first tag moves focus to the last tag and cancels the edit', async () => {
        const fixture = createComponent(EditableTagList);
        const { tags, editInput } = await startEditingFirstTag(fixture);

        const event = keydown(editInput, { key: 'ArrowLeft', keyCode: LEFT_ARROW });

        fixture.detectChanges();
        await fixture.whenStable();

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(tags[3]);
        expect(tags[0].classList).not.toContain('kbq-tag_editing');
        expect(fixture.componentInstance.editChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ type: 'cancel', reason: 'blur' })
        );
    });

    it('DEFECT: Shift+Tab in the empty edit input of the first tag moves focus to the last tag and cancels the edit', async () => {
        const fixture = createComponent(EditableTagList);
        const { tags, editInput } = await startEditingFirstTag(fixture);

        keydown(editInput, { key: 'Tab', keyCode: TAB, shiftKey: true });

        fixture.detectChanges();
        await fixture.whenStable();

        expect(document.activeElement).toBe(tags[3]);
        expect(tags[0].classList).not.toContain('kbq-tag_editing');
    });

    it('DEFECT: Ctrl+A in the empty edit input selects every tag of the list', async () => {
        const fixture = createComponent(EditableTagList);
        const { tags, editInput } = await startEditingFirstTag(fixture);

        expect(tags.some((tag) => tag.classList.contains('kbq-selected'))).toBe(false);

        keydown(editInput, { key: 'a', keyCode: A, ctrlKey: true });

        fixture.detectChanges();
        await fixture.whenStable();

        expect(tags.every((tag) => tag.classList.contains('kbq-selected'))).toBe(true);
        expect(document.activeElement).toBe(tags[3]);
    });
});
