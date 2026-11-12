import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqTextQuery } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

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
            <kbq-label>{{ t().comment }}</kbq-label>
            <textarea
                kbqTextarea
                [placeholder]="t().typeTriggers"
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
export class AutocompleteTriggersExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly control = new FormControl('');
    protected readonly triggers = ['/', '@'];
    protected readonly query = signal<KbqTextQuery | null>(null);

    protected readonly filteredSuggestions = computed(() => {
        const query = this.query();

        if (!query) return [];

        const suggestions = query.trigger === '@' ? this.colleagues() : this.snippets();
        const text = query.text.toLowerCase();

        return suggestions.filter(({ insert, label }) =>
            (query.trigger === '@' ? insert.slice(1) : label.slice(1)).toLowerCase().startsWith(text)
        );
    });

    protected readonly insertText = (suggestion: Suggestion): string => suggestion.insert;

    protected readonly snippets = computed<Suggestion[]>(() => [
        { label: this.t().closedLabel, insert: this.t().closedInsert },
        { label: this.t().escalateLabel, insert: this.t().escalateInsert },
        { label: this.t().signLabel, insert: this.t().signInsert }
    ]);

    protected readonly colleagues = computed<Suggestion[]>(() => [
        { label: this.t().alice, insert: '@alice' },
        { label: this.t().bob, insert: '@bob' },
        { label: this.t().carol, insert: '@carol' }
    ]);

    constructor() {
        super(TRANSLATIONS);
    }
}
