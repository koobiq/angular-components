import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { KbqListModule, KbqListSelectionDroppedEvent } from '@koobiq/components/list';

type Metric = { id: number; name: string };

/**
 * @title Draggable list with transfer between lists
 */
@Component({
    selector: 'list-draggable-connected-example',
    imports: [KbqListModule],
    template: `
        <div class="layout-row layout-gap-l">
            <kbq-list-selection
                #available="kbqListSelection"
                class="flex"
                dragCursor="grab"
                multiple="checkbox"
                [connectedTo]="[selected]"
                [draggable]="true"
                (dropped)="dropped($event)"
            >
                @for (metric of availableMetrics(); track metric.id) {
                    <kbq-list-option [value]="metric">{{ metric.name }}</kbq-list-option>
                }
            </kbq-list-selection>

            <kbq-list-selection
                #selected="kbqListSelection"
                class="flex"
                dragCursor="grab"
                multiple="checkbox"
                [connectedTo]="[available]"
                [draggable]="true"
                (dropped)="dropped($event)"
            >
                @for (metric of selectedMetrics(); track metric.id) {
                    <kbq-list-option [value]="metric">{{ metric.name }}</kbq-list-option>
                }
            </kbq-list-selection>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDraggableConnectedExample {
    protected readonly availableMetrics = signal<Metric[]>([
        { id: 1, name: 'CPU load' },
        { id: 2, name: 'Memory usage' },
        { id: 3, name: 'Disk I/O' }
    ]);

    protected readonly selectedMetrics = signal<Metric[]>([{ id: 4, name: 'Network traffic' }]);

    protected dropped({
        previousIndex,
        currentIndex,
        previousContainer,
        container,
        option
    }: KbqListSelectionDroppedEvent): void {
        // `previousContainer` and `container` identify the lists, but only the consumer knows which
        // array backs which list — here the dragged value itself is the lookup key.
        const fromAvailable = this.availableMetrics().includes(option.value);
        const source = fromAvailable ? this.availableMetrics : this.selectedMetrics;

        if (previousContainer === container) {
            this.reorder(source, previousIndex, currentIndex);

            return;
        }

        const target = fromAvailable ? this.selectedMetrics : this.availableMetrics;

        this.transfer(source, target, previousIndex, currentIndex);
    }

    private reorder(list: WritableSignal<Metric[]>, previousIndex: number, currentIndex: number): void {
        const items = [...list()];

        moveItemInArray(items, previousIndex, currentIndex);

        list.set(items);
    }

    private transfer(
        source: WritableSignal<Metric[]>,
        target: WritableSignal<Metric[]>,
        previousIndex: number,
        currentIndex: number
    ): void {
        const from = [...source()];
        const to = [...target()];

        transferArrayItem(from, to, previousIndex, currentIndex);

        source.set(from);
        target.set(to);
    }
}
