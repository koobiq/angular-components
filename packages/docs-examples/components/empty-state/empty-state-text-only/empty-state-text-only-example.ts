import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Empty-state text only
 */
@Component({
    selector: 'empty-state-text-only-example',
    imports: [
        KbqEmptyStateModule
    ],
    template: `
        <kbq-empty-state style="min-height: 216px">
            <div kbq-empty-state-text>{{ t().noInfo }}</div>
        </kbq-empty-state>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateTextOnlyExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly styles = KbqButtonStyles;
    readonly colors = KbqComponentColors;
}
