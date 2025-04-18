import { ChangeDetectionStrategy, Component, computed, signal, WritableSignal } from '@angular/core';
import { KbqToggleModule } from '@koobiq/components/toggle';

type ExampleParam = { name: string; checked: WritableSignal<boolean> };

/**
 * @title Toggle Indeterminate
 */
@Component({
    standalone: true,
    selector: 'toggle-indeterminate-example',
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle [checked]="parentChecked()" [indeterminate]="parentIndeterminate()" (change)="toggleChecked()">
            All params
        </kbq-toggle>
        @for (param of params(); track param) {
            <p>
                <kbq-toggle [checked]="param.checked()" (change)="param.checked.set(!param.checked())">
                    {{ param.name }}
                </kbq-toggle>
            </p>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleIndeterminateExample {
    protected readonly params = signal<ExampleParam[]>(
        Array.from({ length: 3 }, (_, i) => ({
            name: `param #${i}`,
            checked: signal(i === 0)
        }))
    );

    protected readonly parentChecked = computed(() => this.params().every((param) => param.checked()));
    protected readonly parentIndeterminate = computed(() => {
        const totalItems = this.params();
        const checked = totalItems.filter(({ checked }) => checked()).length;

        return checked > 0 && checked < totalItems.length;
    });

    toggleChecked() {
        const newValue = this.parentIndeterminate() ? true : !this.parentChecked();

        for (const param of this.params()) {
            param.checked.set(newValue);
        }
    }
}
