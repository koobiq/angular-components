import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Input autocomplete */
@Component({
    selector: 'input-autocomplete-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field style="width: 320px">
            <kbq-label>{{ t().withAutocomplete }}</kbq-label>
            <input
                kbqInput
                type="email"
                name="email"
                autocomplete="email"
                [placeholder]="t().emailPlaceholder"
                [formControl]="withAutocomplete"
            />
        </kbq-form-field>

        <kbq-form-field style="width: 320px">
            <kbq-label>{{ t().withoutAutocomplete }}</kbq-label>
            <input
                kbqInput
                type="email"
                autocomplete="off"
                [placeholder]="t().emailPlaceholder"
                [formControl]="withoutAutocomplete"
            />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-column layout-gap-l layout-align-center-center'
    }
})
export class InputAutocompleteExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly withAutocomplete = new FormControl('');
    protected readonly withoutAutocomplete = new FormControl('');
}
