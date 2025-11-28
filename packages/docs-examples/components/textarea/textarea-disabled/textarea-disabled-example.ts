import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Textarea disabled
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'textarea-disabled-example',
    imports: [KbqFormFieldModule, KbqTextareaModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="disabled">Disabled</kbq-toggle>

        <kbq-form-field>
            <kbq-label>Label</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" [disabled]="disabled()"></textarea>
        </kbq-form-field>
    `,
    host: {
        class: 'layout-margin-xl layout-column'
    }
})
export class TextareaDisabledExample {
    protected readonly disabled = model(true);
}
