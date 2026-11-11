import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { injectExampleText } from './l10n';

/**
 * @title Horizontal form
 */
@Component({
    selector: 'horizontal-form-example',
    imports: [
        FormsModule,
        KbqFormsModule,
        KbqInputModule
    ],
    templateUrl: 'horizontal-form-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizontalFormExample {
    protected readonly text = injectExampleText();

    value: any;
}
