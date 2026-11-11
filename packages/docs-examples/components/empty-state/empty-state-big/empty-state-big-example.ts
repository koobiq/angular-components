import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectExampleText } from '../l10n';

/**
 * @title Empty-state big
 */
@Component({
    selector: 'empty-state-big-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <kbq-empty-state size="big" style="min-height: 216px">
            <h2 kbq-empty-state-title>{{ text().noGroups }}</h2>
            <div kbq-empty-state-text>{{ text().agentsGroupText }}</div>
            <div kbq-empty-state-actions>
                <button kbq-button [color]="'theme'" [kbqStyle]="'transparent'">
                    <i kbq-icon="kbq-plus_16" [color]="'theme'"></i>
                    {{ text().createGroup }}
                </button>
            </div>
        </kbq-empty-state>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateBigExample {
    protected readonly text = injectExampleText();
}
