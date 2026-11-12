import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormField, KbqHint, KbqLabel, KbqSuffix } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInput } from '@koobiq/components/input';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/** @title Form field */
@Component({
    selector: 'form-field-overview-example',
    imports: [KbqFormField, KbqLabel, KbqInput, KbqSuffix, KbqIcon, KbqHint],
    template: `
        <kbq-form-field>
            <kbq-label>{{ text().email }}</kbq-label>
            <input kbqInput placeholder="name@example.com" />
            <i kbqSuffix kbq-icon="kbq-envelope_16"></i>
            <kbq-hint>{{ text().emailHint }}</kbq-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldOverviewExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
