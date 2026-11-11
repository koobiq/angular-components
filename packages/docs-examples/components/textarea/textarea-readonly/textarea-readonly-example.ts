import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectExampleText } from '../l10n';

/**
 * @title Textarea readonly
 */
@Component({
    selector: 'textarea-readonly-example',
    imports: [KbqTextareaModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="readonly">{{ text().readonly }}</kbq-toggle>

        <kbq-form-field>
            <kbq-label>{{ text().label }}</kbq-label>
            <textarea
                kbqTextarea
                [placeholder]="text().placeholder"
                [readonly]="readonly()"
                [(ngModel)]="value"
            ></textarea>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-xl layout-column'
    }
})
export class TextareaReadonlyExample {
    protected readonly text = injectExampleText();

    protected readonly readonly = model(true);
    protected readonly value = model('Text');
}
