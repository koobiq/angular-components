import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { injectExampleText } from '../l10n';

/**
 * @title Empty-state actions more
 */
@Component({
    selector: 'empty-state-actions2-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule
    ],
    template: `
        <kbq-empty-state style="min-height: 216px">
            <div kbq-empty-state-text>{{ text().agentsGroupText }}</div>
            <div kbq-empty-state-actions>
                <button kbq-button [color]="colors.Theme" [kbqStyle]="styles.Transparent">Action 1</button>
                <button kbq-button [color]="colors.Theme" [kbqStyle]="styles.Transparent">Action 2</button>
                <button kbq-button [color]="colors.Theme" [kbqStyle]="styles.Transparent">Action 3</button>
            </div>
        </kbq-empty-state>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateActions2Example {
    protected readonly text = injectExampleText();

    readonly styles = KbqButtonStyles;
    readonly colors = KbqComponentColors;
}
