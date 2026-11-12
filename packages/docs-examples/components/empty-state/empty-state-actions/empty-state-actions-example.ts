import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Empty-state actions
 */
@Component({
    selector: 'empty-state-actions-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule
    ],
    template: `
        <kbq-empty-state style="min-height: 216px">
            <div kbq-empty-state-text>{{ text().agentsGroupText }}</div>
            <div class="layout-row layout-align-center" kbq-empty-state-actions style="min-width: 340px">
                <button class="layout-margin-right-s" kbq-button [color]="colors.Contrast" [kbqStyle]="styles.Filled">
                    {{ text().createGroup }}
                </button>

                <button kbq-button [color]="colors.ContrastFade" [kbqStyle]="styles.Filled">
                    {{ text().mergeGroups }}
                </button>
            </div>
        </kbq-empty-state>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateActionsExample extends BaseLocalizedExample<ExampleText> {
    readonly styles = KbqButtonStyles;
    readonly colors = KbqComponentColors;

    constructor() {
        super(TEXT);
    }
}
