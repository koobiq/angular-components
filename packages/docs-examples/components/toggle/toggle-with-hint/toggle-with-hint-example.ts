import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Toggle With Hint
 */
@Component({
    selector: 'toggle-with-hint-example',
    imports: [KbqToggleModule, KbqFormFieldModule],
    template: `
        <div class="example-toggle-with-hint__container layout-align-center-start layout-column layout-gap-s">
            <div>{{ text().touch }}</div>
            <kbq-toggle>
                {{ text().tapToWake }}
                <kbq-hint>{{ text().tapToWakeHint }}</kbq-hint>
            </kbq-toggle>
            <kbq-toggle>
                {{ text().shakeToUndo }}
                <kbq-hint>
                    {{ text().shakeToUndoHint }}
                </kbq-hint>
            </kbq-toggle>
            <kbq-toggle>
                {{ text().vibration }}
                <kbq-hint>
                    {{ text().vibrationHint }}
                </kbq-hint>
            </kbq-toggle>
        </div>
    `,
    styles: `
        .example-toggle-with-hint__container {
            max-width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-align-center-center layout-row layout-padding-top-l layout-padding-bottom-3xl'
    }
})
export class ToggleWithHintExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
