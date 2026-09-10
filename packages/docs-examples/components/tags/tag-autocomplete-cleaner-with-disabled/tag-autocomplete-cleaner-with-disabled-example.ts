import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTag, KbqTagEvent, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';

const getAutocompleteOptions = () => [
    'BruteForce',
    'Complex Attack',
    'DDoS',
    'HIPS alert',
    'Malware',
    'Phishing'
];

/** Tags the user is not allowed to take off. */
const lockedTags = ['DDoS'];

/**
 * @title Tag autocomplete cleaner with disabled tags
 */
@Component({
    selector: 'tag-autocomplete-cleaner-with-disabled-example',
    imports: [
        FormsModule,
        KbqAutocompleteModule,
        KbqIconModule,
        KbqInputModule,
        KbqTagsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList">
                @for (tag of tags(); track tag) {
                    <kbq-tag [value]="tag" [disabled]="isLocked(tag)" (removed)="removed($event)">
                        {{ tag }}
                        <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input
                    #input
                    kbqInput
                    placeholder="New tag"
                    [kbqTagInputFor]="tagList"
                    [kbqAutocomplete]="autocomplete"
                    [kbqTagInputSeparatorKeyCodes]="separatorKeysCodes"
                    [(ngModel)]="tagInputModel"
                    (kbqTagInputTokenEnd)="create($event)"
                />

                <kbq-cleaner (click)="clear(tagList.clearTargets)" />
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
            justify-content: center;
            margin: var(--kbq-size-5xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagAutocompleteCleanerWithDisabledExample {
    private readonly options = getAutocompleteOptions();
    protected readonly separatorKeysCodes = [ENTER, COMMA];
    protected readonly tagInputModel = model('');
    protected readonly tags = model(this.options.slice(0, 4));
    protected readonly filteredOptions = computed(() => {
        const current = this.tagInputModel().trim().toLowerCase();
        const options = this.options.filter((option) => !this.tags().includes(option));

        return current ? options.filter((option) => option.toLowerCase().includes(current)) : options;
    });

    protected isLocked(tag: string): boolean {
        return lockedTags.includes(tag);
    }

    /**
     * The tag list holds no tags of its own, so it hands over the ones the cleaner offers and leaves the
     * removal to this handler. Asking it, rather than filtering by `isLocked` again, keeps the button and
     * what it does from drifting apart.
     */
    protected clear(targets: KbqTag[]): void {
        const removed = new Set(targets.map(({ value }) => value));

        this.tags.update((tags) => tags.filter((tag) => !removed.has(tag)));
    }

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
