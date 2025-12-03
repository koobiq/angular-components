import { ChangeDetectionStrategy, Component } from '@angular/core';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field with kbq-label */
@Component({
    selector: 'form-field-with-label-example',
    imports: [KbqFormFieldModule, KbqInputModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <kbq-label>Label</kbq-label>
            <input kbqInput placeholder="Click on the label for auto focus" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithLabelExample {}
