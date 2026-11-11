import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectExampleText } from '../l10n';

/**
 * @title Empty-state align
 */
@Component({
    selector: 'empty-state-align-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <div class="layout-row layout-wrap">
            <kbq-empty-state class="flex" style="min-height: 216px">
                <h2 kbq-empty-state-title>{{ text().noGroups }}</h2>
                <div kbq-empty-state-text>{{ text().agentsGroupText }}</div>
                <div kbq-empty-state-actions>
                    <button kbq-button [color]="colors.Theme" [kbqStyle]="styles.Transparent">
                        <i kbq-icon="kbq-plus_16" [color]="'theme'"></i>
                        {{ text().createGroup }}
                    </button>
                </div>
            </kbq-empty-state>

            <kbq-empty-state class="flex" style="min-height: 216px" [alignTop]="true">
                <h2 kbq-empty-state-title>{{ text().noGroups }}</h2>
                <div kbq-empty-state-text>{{ text().agentsGroupText }}</div>
                <div kbq-empty-state-actions>
                    <button kbq-button [color]="colors.Theme" [kbqStyle]="styles.Transparent">
                        <i kbq-icon="kbq-plus_16" [color]="'theme'"></i>
                        {{ text().createGroup }}
                    </button>
                </div>
            </kbq-empty-state>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateAlignExample {
    protected readonly text = injectExampleText();

    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;
}
