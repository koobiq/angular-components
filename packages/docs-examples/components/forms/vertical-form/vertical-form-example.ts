import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Vertical form
 */
@Component({
    selector: 'vertical-form-example',
    imports: [
        FormsModule,
        KbqFormsModule,
        KbqInputModule
    ],
    templateUrl: 'vertical-form-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerticalFormExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    value: any;
}
