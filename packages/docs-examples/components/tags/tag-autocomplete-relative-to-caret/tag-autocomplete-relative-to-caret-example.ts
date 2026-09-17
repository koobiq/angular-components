import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqHighlightBackgroundPipe } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagEvent, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag autocomplete relative to caret
 */
@Component({
    selector: 'tag-autocomplete-relative-to-caret-example',
    imports: [
        FormsModule,
        KbqTagsModule,
        KbqAutocompleteModule,
        KbqIconModule,
        KbqInputModule,
        KbqHighlightBackgroundPipe
    ],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList">
                @for (tag of tags(); track tag) {
                    <kbq-tag [value]="tag" (removed)="removed($event)">
                        {{ tag }}
                        <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input
                    #input
                    kbqInput
                    placeholder="New tag"
                    [kbqAutocomplete]="autocomplete"
                    [kbqAutocompleteRelativeToCaret]="true"
                    [kbqTagInputAddOnBlur]="true"
                    [kbqTagInputFor]="tagList"
                    [kbqTagInputSeparatorKeyCodes]="separatorKeysCodes"
                    [(ngModel)]="tagInputModel"
                    (kbqTagInputTokenEnd)="create($event)"
                />
            </kbq-tag-list>

            <kbq-autocomplete #autocomplete="kbqAutocomplete" (optionSelected)="selected($event, input)">
                @for (option of filteredOptions(); track option) {
                    <kbq-option [value]="option">
                        <span [innerHTML]="option | kbqHighlightBackground: tagInputModel().trim()"></span>
                    </kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
    `,
    styles: `
        kbq-form-field {
            width: 480px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center'
    }
})
export class TagAutocompleteRelativeToCaretExample {
    private readonly options = [
        'Acronis',
        'AegisLab',
        'AhnLab-V3',
        'Avast',
        'Babable',
        'ClamAV',
        'CrowdStrike Falcon',
        'NANO-Antivirus',
        'Palo Alto Networks',
        'TheHacker'
    ];

    protected readonly separatorKeysCodes = [ENTER, COMMA];
    protected readonly tagInputModel = model('');
    protected readonly tags = model(['TheHacker', 'ClamAV', 'NANO-Antivirus', 'Babable', 'Palo Alto Networks']);
    protected readonly filteredOptions = computed(() => {
        const current = this.tagInputModel().trim().toLowerCase();
        const options = this.options.filter((option) => !this.tags().includes(option));

        return current ? options.filter((option) => option.toLowerCase().includes(current)) : options;
    });

    protected create({ input, value = '' }: KbqTagInputEvent): void {
        if (value) {
            this.tags.update((tags) => [...tags, value]);
            input.value = '';
            this.tagInputModel.set('');
        }
    }

    protected removed({ tag }: KbqTagEvent): void {
        this.tags.update((tags) => tags.filter((value) => value !== tag.value));
    }

    protected selected({ option }: KbqAutocompleteSelectedEvent, input: HTMLInputElement): void {
        this.tags.update((tags) => [...tags, option.value]);
        input.value = '';
        this.tagInputModel.set('');
        option.deselect();
    }
}
