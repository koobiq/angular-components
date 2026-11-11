import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqHighlightBackgroundPipe, KbqTextQuery } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { injectExampleText } from '../l10n';

/**
 * @title Autocomplete in text
 */
@Component({
    selector: 'autocomplete-textarea-example',
    imports: [
        KbqAutocompleteModule,
        KbqFormFieldModule,
        KbqTextareaModule,
        ReactiveFormsModule,
        KbqHighlightBackgroundPipe
    ],
    template: `
        <kbq-form-field>
            <kbq-label>{{ text().incidentDescription }}</kbq-label>
            <textarea
                kbqTextarea
                [placeholder]="text().typePrefixes"
                [formControl]="control"
                [kbqAutocomplete]="auto"
                [kbqAutocompleteRelativeToCaret]="true"
                [kbqAutocompleteTextMode]="true"
                (kbqAutocompleteQueryChange)="query.set($event)"
            ></textarea>

            <kbq-autocomplete #auto="kbqAutocomplete" [autoActiveFirstOption]="true">
                @for (option of filteredOptions(); track option) {
                    <kbq-option [value]="option">
                        <span [innerHTML]="option | kbqHighlightBackground: query()?.text ?? ''"></span>
                    </kbq-option>
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
export class AutocompleteTextareaExample {
    protected readonly text = injectExampleText();

    protected readonly control = new FormControl('');
    protected readonly query = signal<KbqTextQuery | null>(null);

    // Prefix matches keep the active option continuing the word, which is what the inline hint needs.
    // The placeholder's prefixes are English, so the options they match stay English in every locale.
    protected readonly filteredOptions = computed(() => {
        const text = this.query()?.text.toLowerCase();

        return text ? this.options.filter((option) => option.toLowerCase().startsWith(text)) : [];
    });

    private readonly options = [
        'false positive',
        'file integrity',
        'filter rule',
        'fingerprint',
        'firewall',
        'firmware',
        'threat',
        'threat hunting',
        'threat intelligence',
        'token',
        'traffic',
        'trojan',
        'virus',
        'VPN',
        'vulnerability',
        'vulnerability scan'
    ];
}
