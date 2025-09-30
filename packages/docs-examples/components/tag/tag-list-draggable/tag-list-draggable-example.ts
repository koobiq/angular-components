import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagEvent, KbqTagListDroppedEvent, KbqTagsModule } from '@koobiq/components/tags';
import { KbqToggleModule } from '@koobiq/components/toggle';

const getTags = (): string[] => Array.from({ length: 6 }, (_, i) => `Draggable tag ${i}`);

/**
 * @title Tag list draggable
 */
@Component({
    standalone: true,
    selector: 'tag-list-draggable-example',
    imports: [KbqTagsModule, KbqToggleModule, FormsModule, KbqIconModule],
    template: `
        <kbq-toggle [(ngModel)]="draggable">Draggable</kbq-toggle>

        <kbq-tag-list [draggable]="draggable()" (dropped)="dropped($event)">
            @for (tag of tags(); track tag) {
                <kbq-tag [value]="tag" (removed)="remove($event)">
                    {{ tag }}
                    <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                </kbq-tag>
            } @empty {
                <i kbq-icon-button="kbq-arrow-rotate-left_16" [color]="color.ContrastFade" (click)="restart()"></i>
            }
        </kbq-tag-list>
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
export class TagListDraggableExample {
    protected readonly tags = model(getTags());
    protected readonly draggable = model(true);
    protected readonly color = KbqComponentColors;

    protected dropped(event: KbqTagListDroppedEvent): void {
        moveItemInArray(this.tags(), event.previousIndex, event.currentIndex);
    }

    protected remove(event: KbqTagEvent): void {
        this.tags.update((tags) => {
            const index = tags.indexOf(event.tag.value);

            tags.splice(index, 1);

            console.log(`Tag #${index} was removed:`, event);

            return tags;
        });
    }

    protected restart(): void {
        this.tags.update(() => getTags());
    }
}
