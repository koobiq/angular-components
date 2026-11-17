import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Textarea overview
 */
@Component({
    selector: 'textarea-overview-example',
    imports: [KbqTextareaModule],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().label }}</kbq-label>
            <textarea kbqTextarea canGrow="false" [placeholder]="t().placeholder"></textarea>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-xl layout-row'
    }
})
export class TextareaOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
