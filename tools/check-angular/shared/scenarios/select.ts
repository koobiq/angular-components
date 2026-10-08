import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/** A settings form: a single select for the city and a multiple select with tags, both on reactive controls. */
@Component({
    selector: 'check-select',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-label>City</kbq-label>
            <kbq-select
                data-testid="city"
                placeholder="Choose a city"
                [formControl]="city"
                (openedChange)="onCityOpenedChange($event)"
            >
                @for (option of cities; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
        <output data-testid="city-summary">{{ cityOpened() ? 'open' : 'closed' }}: {{ cityValue() ?? 'none' }}</output>

        <kbq-form-field>
            <kbq-label>Topics</kbq-label>
            <kbq-select
                multiple
                data-testid="topics"
                placeholder="Choose topics"
                [formControl]="topics"
                (openedChange)="onTopicsOpenedChange($event)"
            >
                @for (option of topicOptions; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
        <output data-testid="topics-summary">{{ topicsValue().join(', ') || 'none' }}</output>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectScenario {
    readonly cities = ['Amsterdam', 'Berlin', 'Lisbon', 'Madrid', 'Paris'];
    readonly topicOptions = ['Angular', 'CDK', 'RxJS', 'Signals', 'Vitest'];

    readonly city = new FormControl<string | null>(null);
    readonly topics = new FormControl<string[]>([], { nonNullable: true });

    readonly cityValue = toSignal(this.city.valueChanges, { initialValue: this.city.value });
    readonly topicsValue = toSignal(this.topics.valueChanges, { initialValue: this.topics.value });

    readonly cityOpened = signal(false);
    /** Every `openedChange` emission, in order. */
    readonly cityOpenedChanges = signal<boolean[]>([]);
    readonly topicsOpenedChanges = signal<boolean[]>([]);

    protected onCityOpenedChange(opened: boolean): void {
        this.cityOpened.set(opened);
        this.cityOpenedChanges.update((events) => [...events, opened]);
    }

    protected onTopicsOpenedChange(opened: boolean): void {
        this.topicsOpenedChanges.update((events) => [...events, opened]);
    }
}
