import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Empty-state title
 */
@Component({
    selector: 'empty-state-title-example',
    imports: [
        KbqEmptyStateModule
    ],
    template: `
        <kbq-empty-state style="min-height: 216px">
            <h2 kbq-empty-state-title>{{ t().noGroups }}</h2>
            <div kbq-empty-state-text>{{ t().agentsGroupText }}</div>
        </kbq-empty-state>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateTitleExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
