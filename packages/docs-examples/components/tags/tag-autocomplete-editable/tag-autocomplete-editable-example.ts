import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, computed, ElementRef, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqComponentColors, kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagEditChange, KbqTagEvent, KbqTagInput, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';
import { KbqTitleModule } from '@koobiq/components/title';

const getAutocompleteOptions = () => Array.from({ length: 10 }, (_, i) => `Editable tag ${i}`);

/**
 * @title Tag autocomplete editable
 */
@Component({
    selector: 'tag-autocomplete-editable-example',
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqTagsModule,
        KbqAutocompleteModule,
        KbqIconModule,
        KbqInputModule,
        KbqTitleModule
    ],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList" editable>
                @for (tag of tags(); track tag) {
                    <kbq-tag
                        kbq-title
                        [value]="tag"
                        (editChange)="editChange($event, $index, input)"
                        (removed)="removed($event)"
                    >
                        {{ tag }}
                        <input kbqInput kbqTagEditInput [(ngModel)]="editInputModel" />
                        @if (editInputModel().length === 0) {
                            <i kbq-icon-button="kbq-xmark-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
                        } @else {
                            <i kbq-icon-button="kbq-check-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
                        }
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove (click)="afterRemove()"></i>
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
export class TagAutocompleteEditableExample {
    private readonly options = getAutocompleteOptions();
    protected readonly color = KbqComponentColors;
    protected readonly separatorKeysCodes = [ENTER, COMMA];
    protected readonly tagInputModel = model('');
    protected readonly tags = model(this.options.slice(0, 2));
    protected readonly filteredOptions = computed(() => {
        const current = this.tagInputModel().trim().toLowerCase();
        const options = this.options.filter((option) => !this.tags().includes(option));

        return current ? options.filter((option) => option.toLowerCase().includes(current)) : options;
    });
    protected readonly editInputModel = model<string>('');
    private readonly input = viewChild.required(KbqTagInput, { read: ElementRef });

    protected create({ input, value = '' }: KbqTagInputEvent): void {
        if (value) {
            this.tags.update((tags) => [...tags, value]);
            input.value = '';
            this.tagInputModel.set('');
        }
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

    protected editChange({ type, tag }: KbqTagEditChange, index: number, input: HTMLInputElement): void {
        switch (type) {
            case 'start': {
                this.editInputModel.set(tag.value);
                break;
            }
            case 'cancel': {
                this.editInputModel.set('');
                input.focus();
                break;
            }
            case 'submit': {
                if (!this.editInputModel()) {
                    tag.remove();
                } else {
                    this.tags.update((tags) => {
                        tags[index] = this.editInputModel();

                        return [...tags];
                    });
                    this.editInputModel.set('');
                }

                input.focus();
                break;
            }
            default:
        }
    }

    protected afterRemove(): void {
        this.input().nativeElement.focus();
    }
}
