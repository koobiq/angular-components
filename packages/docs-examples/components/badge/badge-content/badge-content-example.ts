import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
            <kbq-badge [badgeColor]="colors.Success">{{ t().normal }}</kbq-badge>
            <kbq-badge [badgeColor]="colors.Success">
                {{ t().normal }}
                <div class="kbq-badge-caption">0.8</div>
            </kbq-badge>
            <kbq-badge [badgeColor]="colors.Success">
                <i kbq-icon="kbq-cloud-o_16"></i>
                {{ t().normal }}
            </kbq-badge>
            <kbq-badge [badgeColor]="colors.Success">
                {{ t().normal }}
                <i kbq-icon="kbq-cloud-o_16"></i>
            </kbq-badge>
            <kbq-badge [badgeColor]="colors.Success">
                <i kbq-icon="kbq-cloud-o_16"></i>
                {{ t().normal }}
                <div class="kbq-badge-caption">0.8</div>
                <i kbq-icon="kbq-cloud-o_16"></i>
            </kbq-badge>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeContentExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    colors = KbqBadgeColors;
}
