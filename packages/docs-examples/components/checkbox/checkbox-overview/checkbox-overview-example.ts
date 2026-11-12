import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Checkbox
 */
@Component({
    selector: 'checkbox-overview-example',
    imports: [
        KbqCheckboxModule,
        KbqFormFieldModule
    ],
    templateUrl: 'checkbox-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxOverviewExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
