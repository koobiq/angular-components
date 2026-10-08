import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqListModule, KbqListSelection, KbqListSelectionChange } from '@koobiq/components/list';

/** An item of the list, the way a consumer's data carries it. */
export interface ListScenarioFruit {
    id: string;
    name: string;
}

export const LIST_SCENARIO_FRUITS: readonly ListScenarioFruit[] = [
    { id: 'apple', name: 'Apple' },
    { id: 'banana', name: 'Banana' },
    { id: 'cherry', name: 'Cherry' },
    { id: 'grape', name: 'Grape' }
];

/** A multiple selection list bound to a reactive form control, its options rendered from a signal. */
@Component({
    selector: 'check-list',
    imports: [ReactiveFormsModule, KbqListModule],
    template: `
        <button type="button" data-testid="list-before">Before</button>

        <kbq-list-selection
            multiple
            aria-label="Fruits"
            [formControl]="fruitsControl"
            (selectionChange)="onSelectionChange($event)"
        >
            @for (fruit of fruits(); track fruit.id) {
                <kbq-list-option [value]="fruit.id">{{ fruit.name }}</kbq-list-option>
            }
        </kbq-list-selection>

        <button type="button" data-testid="list-after">After</button>

        <p data-testid="list-summary">{{ selected().join(', ') }}</p>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListScenario {
    readonly fruits = signal<readonly ListScenarioFruit[]>(LIST_SCENARIO_FRUITS);

    readonly fruitsControl = new FormControl<string[]>([], { nonNullable: true });

    /** What the control holds, as the page shows it. */
    readonly selected = toSignal(this.fruitsControl.valueChanges, { initialValue: this.fruitsControl.value });

    /** Every `selectionChange` the list emitted, as `<value>:<selected>`. */
    readonly selectionChanges = signal<readonly string[]>([]);

    readonly list = viewChild.required<KbqListSelection<string>>(KbqListSelection);

    addFruit(fruit: ListScenarioFruit, index: number = this.fruits().length): void {
        this.fruits.update((fruits) => [...fruits.slice(0, index), fruit, ...fruits.slice(index)]);
    }

    removeFruit(id: string): void {
        this.fruits.update((fruits) => fruits.filter((fruit) => fruit.id !== id));
    }

    protected onSelectionChange({ option }: KbqListSelectionChange<string>): void {
        this.selectionChanges.update((changes) => [...changes, `${option.value}:${option.selected}`]);
    }
}
