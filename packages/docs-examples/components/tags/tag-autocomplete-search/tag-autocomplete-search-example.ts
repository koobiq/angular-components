import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { createSearchPredicate, KbqHighlightBackgroundPipe, tokenizeSearchQuery } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagEvent, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';

const getAutocompleteOptions = () => [
    'BruteForce',
    'Complex Attack',
    'DDoS',
    'HIPS alert',
    'IDS/IPS Alert',
    'Zero-Day Exploit',
    'XSS',
    'Malware',
    'Ransomware',
    'Phishing'
];

/**
 * @title Tag autocomplete search
 */
@Component({
    selector: 'tag-autocomplete-search-example',
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
                    placeholder='Try "exploit zero"'
                    [kbqTagInputFor]="tagList"
                    [kbqAutocomplete]="autocomplete"
                    [kbqTagInputSeparatorKeyCodes]="separatorKeysCodes"
                    [kbqTagInputAddOnBlur]="true"
                    [(ngModel)]="tagInputModel"
                    (kbqTagInputTokenEnd)="create($event)"
                />

                <kbq-cleaner (click)="clear()" />
            </kbq-tag-list>

            <kbq-autocomplete #autocomplete="kbqAutocomplete" (optionSelected)="selected($event, input)">
                @for (option of filteredOptions(); track option) {
                    <kbq-option [value]="option">
                        <span [innerHTML]="option | kbqHighlightBackground: searchTokens()"></span>
                    </kbq-option>
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
export class TagAutocompleteSearchExample {
    private readonly options = getAutocompleteOptions();
    protected readonly separatorKeysCodes = [ENTER, COMMA];
    protected readonly tagInputModel = model('');
    protected readonly tags = model(this.options.slice(0, 2));
    protected readonly searchTokens = computed(() => tokenizeSearchQuery(this.tagInputModel().trim()));
    protected readonly filteredOptions = computed(() => {
        const options = this.options.filter((option) => !this.tags().includes(option));
        const predicate = createSearchPredicate(this.tagInputModel().trim());

        return options.filter(predicate);
    });

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
}
