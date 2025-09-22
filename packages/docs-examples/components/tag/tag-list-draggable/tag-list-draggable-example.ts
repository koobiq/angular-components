import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqTagListDroppedEvent, KbqTagsModule } from '@koobiq/components/tags';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Tag list draggable
 */
@Component({
    standalone: true,
    selector: 'tag-list-draggable-example',
    imports: [KbqTagsModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="draggable">Draggable</kbq-toggle>

        <kbq-tag-list [draggable]="draggable()" (dropped)="dropped($event)">
            @for (tag of tags(); track tag) {
                <kbq-tag [value]="tag">{{ tag }}</kbq-tag>
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
    protected readonly tags = model(Array.from({ length: 8 }, (_, i) => `Draggable tag ${i}`));
    protected readonly draggable = model(true);

    protected dropped(event: KbqTagListDroppedEvent): void {
        moveItemInArray(this.tags(), event.previousIndex, event.currentIndex);
    }
}
