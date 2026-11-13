import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Textarea disabled
 */
@Component({
    selector: 'textarea-disabled-example',
    imports: [KbqTextareaModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="disabled">{{ t().disabled }}</kbq-toggle>

        <kbq-form-field>
            <kbq-label>{{ t().label }}</kbq-label>
            <textarea kbqTextarea [placeholder]="t().placeholder" [disabled]="disabled()"></textarea>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-xl layout-column'
    }
})
export class TextareaDisabledExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly disabled = model(true);
}
