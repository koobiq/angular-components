import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { injectExampleText } from '../l10n';

/**
 * @title Textarea with maxRows attribute
 */
@Component({
    selector: 'textarea-max-rows-example',
    imports: [KbqTextareaModule, FormsModule, KbqInputModule],
    template: `
        <kbq-form-field>
            <kbq-label>{{ text().label }}</kbq-label>
            <textarea kbqTextarea [placeholder]="text().placeholder" [maxRows]="5" [(ngModel)]="value"></textarea>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-xl layout-row'
    }
})
export class TextareaMaxRowsExample {
    protected readonly text = injectExampleText();

    protected readonly value = model(this.text().dosText);
}
