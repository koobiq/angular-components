import { Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';

/**
 * @title Badge content
 */
@Component({
    standalone: true,
    selector: 'badge-content-example',
    styleUrls: ['badge-content-example.css'],
    imports: [
        KbqBadgeModule
    ],
    template: `
        <div class="badge-content-example">
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
