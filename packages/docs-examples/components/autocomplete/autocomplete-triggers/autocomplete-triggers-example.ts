import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqTextQuery } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextareaModule } from '@koobiq/components/textarea';

interface Suggestion {
    /** What the option shows. */
    label: string;
    /** What choosing the option puts into the text in place of the query. */
    insert: string;
}

/**
 * @title Autocomplete with triggers
 */
@Component({
    selector: 'autocomplete-triggers-example',
    imports: [
        KbqAutocompleteModule,
        KbqFormFieldModule,
        KbqTextareaModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Comment</kbq-label>
            <textarea
                kbqTextarea
                placeholder="Type / for a snippet or @ to mention a colleague"
                [formControl]="control"
                [kbqAutocomplete]="auto"
                [kbqAutocompleteRelativeToCaret]="true"
                [kbqAutocompleteTextMode]="true"
                [kbqAutocompleteTriggers]="triggers"
                (kbqAutocompleteQueryChange)="query.set($event)"
            ></textarea>

            <kbq-autocomplete #auto="kbqAutocomplete" [autoActiveFirstOption]="true" [displayWith]="insertText">
                @for (suggestion of filteredSuggestions(); track suggestion.label) {
                    <kbq-option [value]="suggestion">{{ suggestion.label }}</kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
    `,
    styles: `
        kbq-form-field {
            width: 480px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-row layout-align-center-center'
    }
})
export class AutocompleteTriggersExample {
    protected readonly control = new FormControl('');
    protected readonly triggers = ['/', '@'];
    protected readonly query = signal<KbqTextQuery | null>(null);

    protected readonly filteredSuggestions = computed(() => {
        const query = this.query();

        if (!query) return [];

        const suggestions = query.trigger === '@' ? this.colleagues : this.snippets;
        const text = query.text.toLowerCase();

        return suggestions.filter(({ insert, label }) =>
            (query.trigger === '@' ? insert.slice(1) : label.slice(1)).toLowerCase().startsWith(text)
        );
    });

    protected readonly insertText = (suggestion: Suggestion): string => suggestion.insert;

    private readonly snippets: Suggestion[] = [
        { label: '/closed — closing note', insert: 'Closed as a false positive.' },
        { label: '/escalate — escalation note', insert: 'Escalated to the second line.' },
        { label: '/sign — signature', insert: 'Best regards, SOC team' }
    ];

    private readonly colleagues: Suggestion[] = [
        { label: 'Alice Johnson', insert: '@alice' },
        { label: 'Bob Smith', insert: '@bob' },
        { label: 'Carol White', insert: '@carol' }
    ];
}
