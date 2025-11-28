import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Textarea overview
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'textarea-overview-example',
    imports: [KbqFormFieldModule, KbqTextareaModule],
    template: `
        <kbq-form-field>
            <kbq-label>Label</kbq-label>
            <textarea kbqTextarea placeholder="Placeholder" canGrow="false"></textarea>
        </kbq-form-field>
    `,
    host: {
        class: 'layout-margin-xl layout-row'
    }
})
export class TextareaOverviewExample {}
