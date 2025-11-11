import { moveItemInArray } from '@angular/cdk/drag-drop';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, computed, ElementRef, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import {
    KbqTagEvent,
    KbqTagInput,
    KbqTagInputEvent,
    KbqTagListDroppedEvent,
    KbqTagsModule
} from '@koobiq/components/tags';

const getAutocompleteOptions = () => Array.from({ length: 10 }, (_, i) => `Draggable tag ${i}`);

/**
 * @title Tag autocomplete draggable
 */
@Component({
    standalone: true,
    selector: 'tag-autocomplete-draggable-example',
    imports: [FormsModule, KbqFormFieldModule, KbqTagsModule, KbqAutocompleteModule, KbqIconModule, KbqInputModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList" draggable (dropped)="dropped($event)">
                @for (tag of tags(); track tag) {
                    <kbq-tag [value]="tag" (removed)="removed($event)">
                        {{ tag }}
                        <i kbq-icon="kbq-xmark-s_16" kbqTagRemove (click)="afterRemove()"></i>
                    </kbq-tag>
                }

                <input
                    #input
                    kbqInput
                    placeholder="New tag"
                    [kbqTagInputFor]="tagList"
                    [kbqAutocomplete]="autocomplete"
                    [kbqTagInputSeparatorKeyCodes]="separatorKeysCodes"
                    [kbqTagInputAddOnBlur]="false"
                    [(ngModel)]="tagInputModel"
                    (kbqTagInputTokenEnd)="create($event)"
                />

                <kbq-cleaner #kbqTagListCleaner (click)="clear()" />
            </kbq-tag-list>

            <kbq-autocomplete #autocomplete="kbqAutocomplete" (optionSelected)="selected($event, input)">
                @for (option of filteredOptions(); track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-m);
            margin: var(--kbq-size-5xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagAutocompleteDraggableExample {
    private readonly options = getAutocompleteOptions();
    protected readonly separatorKeysCodes = [ENTER, COMMA];
    protected readonly tagInputModel = model('');
    protected readonly tags = model(this.options.slice(0, 6));
    protected readonly filteredOptions = computed(() => {
        const current = this.tagInputModel().trim().toLowerCase();
        const options = this.options.filter((option) => !this.tags().includes(option));

        return current ? options.filter((option) => option.toLowerCase().includes(current)) : options;
    });
    private readonly input = viewChild.required(KbqTagInput, { read: ElementRef });

    protected create({ input, value = '' }: KbqTagInputEvent): void {
        if (value) {
            this.tags.update((tags) => [...tags, value]);
            input.value = '';
            this.tagInputModel.set('');
        }
    }

    protected afterRemove(): void {
        this.focusInput();
    }

    protected removed({ tag }: KbqTagEvent): void {
        this.tags.update((tags) => {
            const index = tags.indexOf(tag.value);

            tags.splice(index, 1);

            return [...tags];
        });
    }

    protected selected({ option }: KbqAutocompleteSelectedEvent, input: HTMLInputElement): void {
        this.tags.update((tags) => [...tags, option.value]);
        input.value = '';
        this.tagInputModel.set('');
        option.deselect();
    }

    protected clear(): void {
        this.tags.update(() => []);
    }

    protected dropped({ previousIndex, currentIndex }: KbqTagListDroppedEvent): void {
        moveItemInArray(this.tags(), previousIndex, currentIndex);
        this.focusInput();
    }

    private focusInput(): void {
        this.input().nativeElement.focus();
    }
}
