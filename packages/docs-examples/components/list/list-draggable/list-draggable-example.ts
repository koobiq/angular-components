import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqListModule, KbqListSelectionDroppedEvent } from '@koobiq/components/list';

/**
 * @title Draggable list
 */
@Component({
    selector: 'list-draggable-example',
    imports: [KbqListModule],
    template: `
        <kbq-list-selection multiple="checkbox" [draggable]="true" (dropped)="dropped($event)">
            @for (item of items(); track item.id) {
                <kbq-list-option [value]="item">{{ item.name }}</kbq-list-option>
            }
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDraggableExample {
    protected readonly items = signal([
        { id: 1, name: 'Critical' },
        { id: 2, name: 'High' },
        { id: 3, name: 'Medium' },
        { id: 4, name: 'Low' },
        { id: 5, name: 'Info' }
    ]);

    protected dropped({ previousIndex, currentIndex }: KbqListSelectionDroppedEvent): void {
        const items = [...this.items()];

        moveItemInArray(items, previousIndex, currentIndex);

        this.items.set(items);
    }
}
