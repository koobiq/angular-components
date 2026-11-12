import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqListModule, KbqListSelectionDroppedEvent } from '@koobiq/components/list';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Draggable list
 */
@Component({
    selector: 'list-draggable-example',
    imports: [KbqListModule, KbqDividerModule],
    template: `
        <kbq-list-selection multiple="checkbox" [draggable]="true" (dropped)="dropped($event)">
            @for (item of beforeGroup(); track item.id) {
                <kbq-list-option [value]="item">{{ itemName(item) }}</kbq-list-option>
            }
            <kbq-optgroup [label]="t().groupHeader">
                @for (item of grouped(); track item.id) {
                    <kbq-list-option [value]="item">{{ itemName(item) }}</kbq-list-option>
                }
            </kbq-optgroup>
            <!-- Decorative: a listbox owns options and groups, and a separator has nothing to announce. -->
            <kbq-divider aria-hidden="true" />
            @for (item of afterDivider(); track item.id) {
                <kbq-list-option [draggable]="!item.pinned" [value]="item">{{ itemName(item) }}</kbq-list-option>
            }
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDraggableExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly items = signal([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
        { id: 5, name: 'Item 5' },
        { id: 6, name: 'Item 6' },
        { id: 7, name: 'Item 7. Sorting is prohibited', pinned: true }
    ]);

    protected itemName(item: { id: number }): string {
        return item.id === 7 ? this.t().item7Pinned : 'Item ' + item.id;
    }

    // The group and the divider sit at fixed positions, so the sections are plain slices and the indices
    // `dropped` reports address the array directly. An option dragged past a boundary changes section.
    protected readonly beforeGroup = computed(() => this.items().slice(0, 2));
    protected readonly grouped = computed(() => this.items().slice(2, 5));
    protected readonly afterDivider = computed(() => this.items().slice(5));

    protected dropped({ previousIndex, currentIndex }: KbqListSelectionDroppedEvent): void {
        const items = [...this.items()];

        moveItemInArray(items, previousIndex, currentIndex);

        this.items.set(items);
    }

    constructor() {
        super(TRANSLATIONS);
    }
}
