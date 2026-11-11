import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectExampleText } from '../l10n';

/**
 * @title Textarea disabled
 */
@Component({
    selector: 'textarea-disabled-example',
    imports: [KbqTextareaModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="disabled">{{ text().disabled }}</kbq-toggle>

        <kbq-form-field>
            <kbq-label>{{ text().label }}</kbq-label>
            <textarea kbqTextarea [placeholder]="text().placeholder" [disabled]="disabled()"></textarea>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-xl layout-column'
    }
})
export class TextareaDisabledExample {
    protected readonly text = injectExampleText();

    protected readonly disabled = model(true);
}
