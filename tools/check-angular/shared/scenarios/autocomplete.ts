import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

export const AUTOCOMPLETE_COUNTRIES: readonly string[] = [
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Argentina',
    'Armenia',
    'Austria',
    'Belgium',
    'Brazil',
    'Bulgaria'
];

/** A country field suggesting the countries that contain what was typed. */
@Component({
    selector: 'check-autocomplete',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqInputModule, KbqAutocompleteModule],
    template: `
        <kbq-form-field>
            <kbq-label>Country</kbq-label>
            <input
                kbqInput
                type="text"
                placeholder="Start typing a country"
                [formControl]="country"
                [kbqAutocomplete]="countries"
            />
            <kbq-autocomplete
                #countries="kbqAutocomplete"
                (opened)="log('opened')"
                (closed)="log('closed')"
                (optionSelected)="onOptionSelected($event)"
            >
                @for (option of options(); track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
        <p class="check-autocomplete-chosen">Chosen: {{ chosen() ?? 'nothing' }}</p>
        <button type="button" class="check-autocomplete-elsewhere">Elsewhere</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteScenario {
    readonly country = new FormControl('', { nonNullable: true });

    private readonly query = toSignal(this.country.valueChanges, { initialValue: this.country.value });

    readonly options = computed(() => {
        const query = this.query().trim().toLowerCase();

        return AUTOCOMPLETE_COUNTRIES.filter((country) => country.toLowerCase().includes(query));
    });

    /** The country picked from the panel, as `optionSelected` reported it. */
    readonly chosen = signal<string | null>(null);

    /** What the panel reported, in order. */
    readonly events = signal<readonly string[]>([]);

    protected onOptionSelected({ option }: KbqAutocompleteSelectedEvent): void {
        this.chosen.set(option.value);
        this.log(`selected ${option.value}`);
    }

    protected log(event: string): void {
        this.events.update((events) => [...events, event]);
    }
}
