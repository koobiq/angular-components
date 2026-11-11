import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { injectExampleText } from '../l10n';

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
            <h2 kbq-empty-state-title>{{ text().noGroups }}</h2>
            <div kbq-empty-state-text>{{ text().agentsGroupText }}</div>
        </kbq-empty-state>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateTitleExample {
    protected readonly text = injectExampleText();
}
