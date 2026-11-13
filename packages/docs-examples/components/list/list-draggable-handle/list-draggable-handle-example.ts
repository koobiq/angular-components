import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
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
            @for (fruit of fruits(); track fruit.id) {
                <kbq-list-option [value]="fruit">
                    <i kbq-icon="kbq-grip-vertical-s_16" cdkDragHandle></i>
                    {{ fruit.label }}
                </kbq-list-option>
            }
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDraggableHandleExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly items = signal([1, 2, 3, 4]);

    protected readonly fruits = computed(() => this.items().map((id) => this.t().fruits[id - 1]));

    protected dropped({ previousIndex, currentIndex }: KbqListSelectionDroppedEvent): void {
        const items = [...this.items()];

        moveItemInArray(items, previousIndex, currentIndex);

        this.items.set(items);
    }
}
