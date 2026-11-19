import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Input with label and hint */
@Component({
    selector: 'input-label-and-hint-example',
    imports: [KbqInputModule],
    template: `
        <kbq-form-field style="width: 320px">
            <kbq-label>{{ t().label }}</kbq-label>
            <input kbqInput />
            <kbq-hint>{{ t().hint }}</kbq-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputLabelAndHintExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
