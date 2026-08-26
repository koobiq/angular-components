import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqListModule, KbqListSelectionDroppedEvent } from '@koobiq/components/list';

/**
 * @title Draggable list with a handle
 */
@Component({
    selector: 'list-draggable-handle-example',
    imports: [KbqListModule, KbqIconModule],
    template: `
        <kbq-list-selection [draggable]="true" (dropped)="dropped($event)">
            @for (item of items(); track item.id) {
                <kbq-list-option [value]="item">
                    <i kbq-icon="kbq-grip-vertical-s_16" cdkDragHandle></i>
                    {{ item.name }}
                </kbq-list-option>
            }
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDraggableHandleExample {
    protected readonly items = signal([
        { id: 1, name: 'Banana' },
        { id: 2, name: 'Cherry' },
        { id: 3, name: 'Grapefruit' },
        { id: 4, name: 'Mango' }
    ]);

    protected dropped({ previousIndex, currentIndex }: KbqListSelectionDroppedEvent): void {
        const items = [...this.items()];

        moveItemInArray(items, previousIndex, currentIndex);

        this.items.set(items);
    }
}
