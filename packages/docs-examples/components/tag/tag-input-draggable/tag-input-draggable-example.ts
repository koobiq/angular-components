import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, ElementRef, model, viewChild } from '@angular/core';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    KbqTagEvent,
    KbqTagInput,
    KbqTagInputEvent,
    KbqTagListDroppedEvent,
    KbqTagsModule
} from '@koobiq/components/tags';

const getTags = () => Array.from({ length: 3 }, (_, id) => ({ id, value: `Draggable tag ${id}` }));

/**
 * @title Tag input draggable
 */
@Component({
    standalone: true,
    selector: 'tag-input-draggable-example',
    imports: [KbqTagsModule, KbqFormFieldModule, KbqIconModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList" draggable (dropped)="dropped($event)">
                @for (tag of tags(); track tag.id) {
                    <kbq-tag [value]="tag.value" (removed)="removed($event)">
                        {{ tag.value }}
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove (click)="afterRemove()"></i>
                    </kbq-tag>
                }

                <input
                    autocomplete="off"
                    kbqInput
                    placeholder="New tag"
                    [kbqTagInputFor]="tagList"
                    (kbqTagInputTokenEnd)="create($event)"
                />

                <kbq-cleaner #kbqTagListCleaner (click)="clear()" />
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
    private readonly input = viewChild.required(KbqTagInput, { read: ElementRef });

    protected dropped(event: KbqTagListDroppedEvent): void {
        moveItemInArray(this.tags(), event.previousIndex, event.currentIndex);
        this.focusInput();
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

    protected removed(event: KbqTagEvent): void {
        this.tags.update((tags) => {
            const index = tags.findIndex(({ value }) => value === event.tag.value);

            tags.splice(index, 1);

            console.log(`Tag #${index} was removed:`, event);

            return tags;
        });
    }

    protected clear(): void {
        this.tags.update(() => []);
    }

    protected afterRemove(): void {
        this.focusInput();
    }

    private focusInput(): void {
        this.input().nativeElement.focus();
    }
}
