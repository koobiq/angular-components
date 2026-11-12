import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Textarea overview
 */
@Component({
    selector: 'textarea-overview-example',
    imports: [KbqTextareaModule],
    template: `
        <kbq-form-field>
            <kbq-label>{{ text().label }}</kbq-label>
            <textarea kbqTextarea canGrow="false" [placeholder]="text().placeholder"></textarea>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-xl layout-row'
    }
})
export class TextareaOverviewExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
