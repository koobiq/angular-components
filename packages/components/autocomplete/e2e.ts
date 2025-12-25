import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

@Component({
    selector: 'e2e-autocomplete-states',
    imports: [KbqFormFieldModule, KbqInputModule, KbqAutocompleteModule],
    template: `
        <kbq-form-field>
            <kbq-label>Label</kbq-label>
            <input
                data-testid="e2eAutocompleteInput"
                kbqInput
                placeholder="Placeholder"
                [kbqAutocomplete]="autocomplete"
            />
            <kbq-hint>Hint</kbq-hint>

            <kbq-autocomplete #autocomplete="kbqAutocomplete">
                @for (option of options; track $index) {
                    <kbq-option [disabled]="$index === 4" [value]="option">{{ option }}</kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: inline-flex;
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xxs);
            height: 340px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eAutocompleteStates'
    }
})
export class E2eAutocompleteStates {
    protected readonly options = Array.from({ length: 20 }).map((_, i) => `Option ${i + 1}`);
}
