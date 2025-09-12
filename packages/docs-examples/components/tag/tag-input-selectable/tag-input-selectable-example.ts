import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagInputEvent, KbqTagSelectionChange, KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag input selectable
 */
@Component({
    standalone: true,
    selector: 'tag-input-selectable-example',
    imports: [KbqTagsModule, KbqIconModule, KbqFormFieldModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList" selectable multiple>
                @for (tag of tags(); track tag) {
                    <kbq-tag [selected]="$index > 0" [value]="tag" (selectionChange)="selectionChange($event)">
                        {{ tag }}
                    </kbq-tag>
                }

                <input
                    kbqInput
                    placeholder="New tag"
                    [kbqTagInputFor]="tagList"
                    (kbqTagInputTokenEnd)="create($event)"
                />
            </kbq-tag-list>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: var(--kbq-size-5xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputSelectableExample {
    protected readonly tags = model(Array.from({ length: 3 }, (_, i) => `Selectable tag ${i}`));

    protected selectionChange(event: KbqTagSelectionChange): void {
        console.log('Tag selection was changed :', event);
    }

    protected create({ input, value = '' }: KbqTagInputEvent): void {
        if (value) {
            this.tags.update((tags) => {
                tags.push(value);

                return tags;
            });

            input.value = '';
        }
    }
}
