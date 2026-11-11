import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectExampleText } from '../l10n';

/**
 * @title Textarea with canGrow attribute
 */
@Component({
    selector: 'textarea-can-grow-example',
    imports: [KbqTextareaModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="canGrow">canGrow</kbq-toggle>

        <kbq-form-field>
            <kbq-label>{{ text().label }}</kbq-label>
            <textarea
                kbqTextarea
                [placeholder]="text().placeholder"
                [canGrow]="canGrow()"
                [(ngModel)]="value"
            ></textarea>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-xl layout-column'
    }
})
export class TextareaCanGrowExample {
    protected readonly text = injectExampleText();

    protected readonly canGrow = model(true);
    protected readonly value = model(this.text().dosText);
}
