import { Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Badge content
 */
@Component({
    standalone: true,
    selector: 'badge-content-example',
    imports: [
        KbqBadgeModule,
        KbqIconModule
    ],
    template: `
        <div class="layout-row layout-gap-l">
            <kbq-badge [badgeColor]="colors.Success">Normal</kbq-badge>
            <kbq-badge [badgeColor]="colors.Success">
                Normal
                <div class="kbq-badge-caption">0.8</div>
            </kbq-badge>
            <kbq-badge [badgeColor]="colors.Success">
                <i kbq-icon="kbq-cloud-o_16"></i>
                Normal
            </kbq-badge>
            <kbq-badge [badgeColor]="colors.Success">
                Normal
                <i kbq-icon="kbq-cloud-o_16"></i>
            </kbq-badge>
            <kbq-badge [badgeColor]="colors.Success">
                <i kbq-icon="kbq-cloud-o_16"></i>
                Normal
                <div class="kbq-badge-caption">0.8</div>
                <i kbq-icon="kbq-cloud-o_16"></i>
            </kbq-badge>
        </div>
    `
})
export class BadgeContentExample {
    colors = KbqBadgeColors;
}
