import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
export class CheckboxOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
