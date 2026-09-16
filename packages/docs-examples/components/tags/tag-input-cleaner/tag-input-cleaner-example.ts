import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagEvent, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag input cleaner
 */
@Component({
    selector: 'tag-input-cleaner-example',
    imports: [KbqIconModule, KbqInputModule, KbqTagsModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList">
                @for (tag of tags(); track tag) {
                    <kbq-tag [value]="tag" (removed)="removed($event)">
                        {{ tag }}
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input
                    autocomplete="off"
                    kbqInput
                    placeholder="New tag"
                    [kbqTagInputFor]="tagList"
                    [kbqTagInputSeparatorKeyCodes]="separators"
                    (kbqTagInputTokenEnd)="create($event)"
                />

                <kbq-cleaner />
            </kbq-tag-list>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputCleanerExample {
    protected readonly separators = [COMMA, ENTER];
    protected readonly tags = model(['Alpha', 'Beta', 'Gamma']);

    protected create({ input, value = '' }: KbqTagInputEvent): void {
        if (value) {
            this.tags.update((tags) => [...tags, value]);
            input.value = '';
        }
    }

    // The reset control removes the tags through this same output, so it needs no handler of its own.
    protected removed({ tag }: KbqTagEvent): void {
        this.tags.update((tags) => tags.filter((value) => value !== tag.value));
    }
}
