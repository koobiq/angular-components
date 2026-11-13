import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Textarea with maxRows attribute
 */
@Component({
    selector: 'textarea-max-rows-example',
    imports: [KbqTextareaModule, FormsModule, KbqInputModule],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().label }}</kbq-label>
            <textarea kbqTextarea [placeholder]="t().placeholder" [maxRows]="5" [(ngModel)]="value"></textarea>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-xl layout-row'
    }
})
export class TextareaMaxRowsExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly value = model(this.t().dosText);
}
