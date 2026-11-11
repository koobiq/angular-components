import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectExampleText } from '../l10n';

/**
 * @title Badge content
 */
@Component({
    selector: 'badge-content-example',
    imports: [
        KbqBadgeModule,
        KbqIconModule
    ],
    template: `
        <div class="layout-row layout-gap-l">
            <kbq-badge [badgeColor]="colors.Success">{{ text().normal }}</kbq-badge>
            <kbq-badge [badgeColor]="colors.Success">
                {{ text().normal }}
                <div class="kbq-badge-caption">0.8</div>
            </kbq-badge>
            <kbq-badge [badgeColor]="colors.Success">
                <i kbq-icon="kbq-cloud-o_16"></i>
                {{ text().normal }}
            </kbq-badge>
            <kbq-badge [badgeColor]="colors.Success">
                {{ text().normal }}
                <i kbq-icon="kbq-cloud-o_16"></i>
            </kbq-badge>
            <kbq-badge [badgeColor]="colors.Success">
                <i kbq-icon="kbq-cloud-o_16"></i>
                {{ text().normal }}
                <div class="kbq-badge-caption">0.8</div>
                <i kbq-icon="kbq-cloud-o_16"></i>
            </kbq-badge>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeContentExample {
    protected readonly text = injectExampleText();

    colors = KbqBadgeColors;
}
