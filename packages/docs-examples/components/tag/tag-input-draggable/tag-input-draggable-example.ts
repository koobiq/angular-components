import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagEvent, KbqTagInputEvent, KbqTagListDroppedEvent, KbqTagsModule } from '@koobiq/components/tags';

const getTags = () => Array.from({ length: 3 }, (_, id) => ({ id, value: `Draggable tag ${id}` }));

/**
 * @title Tag input draggable
 */
@Component({
    standalone: true,
    selector: 'tag-input-draggable-example',
    imports: [KbqTagsModule, KbqFormFieldModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList" draggable multiple (dropped)="dropped($event)">
                @for (tag of tags(); track tag.id) {
                    <kbq-tag [value]="tag.value" (removed)="remove($event)">
                        {{ tag.value }}
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input
                    autocomplete="off"
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
            gap: var(--kbq-size-m);
            margin: var(--kbq-size-5xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputDraggableExample {
    protected readonly tags = model(getTags());

    protected dropped(event: KbqTagListDroppedEvent): void {
        moveItemInArray(this.tags(), event.previousIndex, event.currentIndex);
    }

    protected create({ input, value = '' }: KbqTagInputEvent): void {
        if (value) {
            this.tags.update((tags) => {
                tags.push({ id: tags.length, value });

                return tags;
            });

            input.value = '';
        }
    }

    protected remove(event: KbqTagEvent): void {
        this.tags.update((tags) => {
            const index = tags.indexOf(event.tag.value);

            tags.splice(index, 1);

            console.log(`Tag #${index} was removed:`, event);

            return tags;
        });
    }
}
