import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Toggle multiline example
 */
@Component({
    selector: 'toggle-multiline-example',
    imports: [KbqToggleModule, KbqFormFieldModule],
    template: `
        <div
            class="example-toggle-multiline__container layout-align-center-start layout-column layout-gap-s layout-padding-top-l layout-padding-left-l layout-padding-right-l layout-padding-bottom-xl "
        >
            <kbq-toggle labelPosition="left">
                Shake to undo
                <kbq-hint>
                    {{ t().shakeToUndoHint }}
                </kbq-hint>
            </kbq-toggle>
        </div>
    `,
    styles: `
        .example-toggle-multiline__container {
            max-width: 320px;
            background: var(--kbq-background-card);
            box-shadow: var(--kbq-shadow-card);
            border-radius: var(--kbq-size-border-radius);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-align-center-center layout-row layout-margin-top-l layout-margin-bottom-l'
    }
})
export class ToggleMultilineExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
