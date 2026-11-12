import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { KbqListModule, KbqListSelectionDroppedEvent } from '@koobiq/components/list';
import { injectLocalizedText } from '@koobiq/docs-examples/i18n';
import { TEXT } from './l10n';

type Metric = { id: number };

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
                [connectedTo]="[selected]"
                [draggable]="true"
                (dropped)="dropped($event)"
            >
                @for (metric of availableMetrics(); track metric.id) {
                    <kbq-list-option [value]="metric">{{ metricName(metric.id) }}</kbq-list-option>
                }
            </kbq-list-selection>

            <kbq-list-selection
                #selected="kbqListSelection"
                class="flex"
                dragCursor="grab"
                [connectedTo]="[available]"
                [draggable]="true"
                (dropped)="dropped($event)"
            >
                @for (metric of selectedMetrics(); track metric.id) {
                    <kbq-list-option [value]="metric">{{ metricName(metric.id) }}</kbq-list-option>
                }
            </kbq-list-selection>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDraggableConnectedExample {
    protected readonly text = injectLocalizedText(TEXT);

    protected metricName(id: number): string {
        return this.metricsText().metrics[id - 1];
    }

    private readonly metricsText = injectLocalizedText(TEXT);

    protected readonly availableMetrics = signal<Metric[]>([{ id: 1 }, { id: 2 }, { id: 3 }]);

    protected readonly selectedMetrics = signal<Metric[]>([{ id: 4 }]);

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
