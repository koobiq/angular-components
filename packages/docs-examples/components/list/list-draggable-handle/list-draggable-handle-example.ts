import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqListModule, KbqListSelectionDroppedEvent } from '@koobiq/components/list';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
                    {{ fruitName(item.id) }}
                </kbq-list-option>
            }
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDraggableHandleExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected fruitName(id: number): string {
        return this.fruitsText().fruits[id - 1];
    }

    private readonly fruitsText = injectTranslation(TRANSLATIONS);

    protected readonly items = signal([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);

    protected dropped({ previousIndex, currentIndex }: KbqListSelectionDroppedEvent): void {
        const items = [...this.items()];

        moveItemInArray(items, previousIndex, currentIndex);

        this.items.set(items);
    }
}
