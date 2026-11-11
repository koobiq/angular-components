import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { injectExampleText } from '../l10n';

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
            <div kbq-empty-state-text>{{ text().noInfo }}</div>
        </kbq-empty-state>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateTextOnlyExample {
    protected readonly text = injectExampleText();

    readonly styles = KbqButtonStyles;
    readonly colors = KbqComponentColors;
}
