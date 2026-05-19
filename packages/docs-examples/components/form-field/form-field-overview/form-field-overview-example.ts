import { ChangeDetectionStrategy, Component } from '@angular/core';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field with kbq-label */
@Component({
    selector: 'form-field-overview-example',
    imports: [KbqInputModule],
    template: `
        <kbq-form-field>
            <kbq-label>Label</kbq-label>
            <input kbqInput placeholder="Click on the label for auto focus" />
        </kbq-form-field>
    `,
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldOverviewExample {}
