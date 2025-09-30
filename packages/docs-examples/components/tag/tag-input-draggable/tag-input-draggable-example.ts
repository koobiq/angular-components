import { moveItemInArray } from '@angular/cdk/drag-drop';
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagEvent, KbqTagInputEvent, KbqTagListDroppedEvent, KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag input draggable
 */
@Component({
    standalone: true,
    selector: 'tag-input-draggable-example',
    imports: [KbqTagsModule, KbqFormFieldModule, JsonPipe, KbqIconModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList" draggable (dropped)="dropped($event)">
                @for (tag of tags(); track $index) {
                    <kbq-tag [value]="tag" (removed)="remove($event)">
                        {{ tag }}
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

        <small>
            <code>{{ tags() | json }}</code>
        </small>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-m);
            margin: var(--kbq-size-5xl);
        }

        small {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputDraggableExample {
    protected readonly tags = model(Array.from({ length: 3 }, (_, i) => `Draggable tag ${i}`));

    protected dropped(event: KbqTagListDroppedEvent): void {
        moveItemInArray(this.tags(), event.previousIndex, event.currentIndex);
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

    protected remove(event: KbqTagEvent): void {
        this.tags.update((tags) => {
            const index = tags.indexOf(event.tag.value);

            tags.splice(index, 1);

            console.log(`Tag #${index} was removed:`, event);

            return tags;
        });
    }
}
