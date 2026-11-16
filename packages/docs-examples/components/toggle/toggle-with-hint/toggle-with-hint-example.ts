import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Toggle With Hint
 */
@Component({
    selector: 'toggle-with-hint-example',
    imports: [KbqToggleModule, KbqFormFieldModule],
    template: `
        <div class="example-toggle-with-hint__container layout-align-center-start layout-column layout-gap-s">
            <div>{{ t().touch }}</div>
            <kbq-toggle>
                {{ t().tapToWake }}
                <kbq-hint>{{ t().tapToWakeHint }}</kbq-hint>
            </kbq-toggle>
            <kbq-toggle>
                {{ t().shakeToUndo }}
                <kbq-hint>
                    {{ t().shakeToUndoHint }}
                </kbq-hint>
            </kbq-toggle>
            <kbq-toggle>
                {{ t().vibration }}
                <kbq-hint>
                    {{ t().vibrationHint }}
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
export class ToggleWithHintExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
