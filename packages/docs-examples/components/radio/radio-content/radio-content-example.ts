import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqRadioModule } from '@koobiq/components/radio';
import { injectExampleText } from '../l10n';

/**
 * @title Radio content
 */
@Component({
    selector: 'radio-content-example',
    imports: [
        KbqRadioModule,
        KbqFormFieldModule
    ],
    templateUrl: 'radio-content-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioContentExample {
    protected readonly text = injectExampleText();

    isDisabled = false;
}
