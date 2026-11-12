import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Horizontal form labels
 */
@Component({
    selector: 'horizontal-form-labels-example',
    imports: [
        FormsModule,
        KbqFormsModule,
        KbqInputModule
    ],
    templateUrl: 'horizontal-form-labels-example.html',
    styleUrls: ['horizontal-form-labels-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizontalFormLabelsExample extends BaseLocalizedExample<ExampleTranslation> {
    value: any;

    constructor() {
        super(TRANSLATIONS);
    }
}
